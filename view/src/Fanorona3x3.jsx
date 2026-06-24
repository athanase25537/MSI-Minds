
import { useState, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const COLS   = 3;
const ROWS   = 3;
const PAD    = 70;
const STEP   = 90;
const SVG_W  = PAD * 2 + STEP * (COLS - 1);
const SVG_H  = PAD * 2 + STEP * (ROWS - 1);
const PIECE_R = 18;
const N      = ROWS * COLS; // 9 cases

const PLAYER = { NONE: 0, ONE: 1, TWO: 2 };

const EDGES = [
  // horizontales
  [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],
  // verticales
  [0,3],[1,4],[2,5],[3,6],[4,7],[5,8],
  // diagonales (uniquement via le centre 4)
  [0,4],[2,4],[4,6],[4,8],
];

// Précalcul : pour chaque case, liste de ses voisins directs
const ADJACENCY = Array.from({ length: N }, () => []);
EDGES.forEach(([a, b]) => {
  ADJACENCY[a].push(b);
  ADJACENCY[b].push(a);
});

// Lignes gagnantes (identiques au morpion classique)
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],   // lignes
  [0,3,6],[1,4,7],[2,5,8],   // colonnes
  [0,4,8],[2,4,6],            // diagonales
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const toXY = (i) => ({
  x: PAD + (i % COLS) * STEP,
  y: PAD + Math.floor(i / COLS) * STEP,
});


function getValidMoves(i, board) {
  return ADJACENCY[i].filter((n) => board[n] === PLAYER.NONE);
}

function checkWin(board, player) {
  return WIN_LINES.some((line) => line.every((i) => board[i] === player));
}

/* ─────────────────────────────────────────────
   GAME STATE
───────────────────────────────────────────── */
function initState() {
  return {
    board:         Array(N).fill(PLAYER.NONE),
    placed:        { [PLAYER.ONE]: 0, [PLAYER.TWO]: 0 },
    phase:         1,          // 1 = placement, 2 = mouvement
    currentPlayer: PLAYER.ONE,
    selected:      null,       // index du pion sélectionné (phase 2)
    gameOver:      false,
    winner:        null,
  };
}


function applyAction(state, cellIndex) {
  if (state.gameOver) return state;

  const { board, phase, currentPlayer, placed, selected } = state;
  const nextPlayer = (p) => (p === PLAYER.ONE ? PLAYER.TWO : PLAYER.ONE);

  /* ── PHASE 1 : PLACEMENT ── */
  if (phase === 1) {
    if (board[cellIndex] !== PLAYER.NONE) return state;

    const newBoard = [...board];
    newBoard[cellIndex] = currentPlayer;
    const newPlaced = { ...placed, [currentPlayer]: placed[currentPlayer] + 1 };

    if (checkWin(newBoard, currentPlayer)) {
      return { ...state, board: newBoard, placed: newPlaced, gameOver: true, winner: currentPlayer };
    }

    const allPlaced = newPlaced[PLAYER.ONE] === 3 && newPlaced[PLAYER.TWO] === 3;
    return {
      ...state,
      board:         newBoard,
      placed:        newPlaced,
      phase:         allPlaced ? 2 : 1,
      currentPlayer: nextPlayer(currentPlayer),
    };
  }

 
  if (selected === null) {
    // Sélectionner un pion du joueur courant
    if (board[cellIndex] !== currentPlayer) return state;
    const moves = getValidMoves(cellIndex, board);
    // Ne pas sélectionner un pion bloqué
    return moves.length > 0 ? { ...state, selected: cellIndex } : state;
  }

  // Re-sélection d'un autre pion du même joueur
  if (board[cellIndex] === currentPlayer) {
    const moves = getValidMoves(cellIndex, board);
    return moves.length > 0
      ? { ...state, selected: cellIndex }
      : { ...state, selected: null };
  }

  // Déplacement vers une case vide adjacente VALIDE
  const validMoves = getValidMoves(selected, board);
  if (!validMoves.includes(cellIndex)) {
    // Clic sur case vide non-adjacente : on ignore (le pion reste sélectionné)
    return state;
  }

  const newBoard = [...board];
  newBoard[cellIndex] = currentPlayer;
  newBoard[selected]  = PLAYER.NONE;

  if (checkWin(newBoard, currentPlayer)) {
    return { ...state, board: newBoard, selected: null, gameOver: true, winner: currentPlayer };
  }

  return {
    ...state,
    board:         newBoard,
    selected:      null,
    currentPlayer: nextPlayer(currentPlayer),
  };
}

/* ─────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────── */

function Piece({ index, player, isSelected, onClick }) {
  const { x, y } = toXY(index);
  const isP1 = player === PLAYER.ONE;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle
        cx={x} cy={y}
        r={isSelected ? PIECE_R + 3 : PIECE_R}
        fill={isP1 ? "#1a1a18" : "#f5f3ee"}
        stroke={isSelected ? "#EF9F27" : isP1 ? "#5F5E5A" : "#B4B2A9"}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />
      <circle cx={x - 4} cy={y - 4} r={5}
        fill={isP1 ? "#3d3d3a" : "#ffffff"} opacity={0.5} />
    </g>
  );
}

function MoveHint({ index, onClick }) {
  const { x, y } = toXY(index);
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle cx={x} cy={y} r={PIECE_R + 8} fill="transparent" />
      <circle cx={x} cy={y} r={PIECE_R} fill="#3B8BD4" opacity={0.15} />
      <circle cx={x} cy={y} r={PIECE_R}
        fill="none" stroke="#3B8BD4" strokeWidth={2.5}
        strokeDasharray="5 3" opacity={0.9} />
    </g>
  );
}

function PlacementHint({ index, onClick }) {
  const { x, y } = toXY(index);
  return (
    <circle cx={x} cy={y} r={PIECE_R}
      fill="#3B8BD4" opacity={0.12}
      onClick={onClick} style={{ cursor: "pointer" }} />
  );
}

function Board({ state, onCellClick }) {
  const { board, phase, selected, gameOver } = state;

  const validMoves = useMemo(() => {
    if (phase !== 2 || selected === null) return [];
    return getValidMoves(selected, board);
  }, [phase, selected, board]);

  // Lignes de grille (horizontales + verticales)
  const gridLines = useMemo(() => {
    const lines = [];
    for (let r = 0; r < ROWS; r++) {
      const y = PAD + r * STEP;
      lines.push(<line key={`h${r}`} x1={PAD} y1={y} x2={PAD + (COLS-1)*STEP} y2={y} />);
    }
    for (let c = 0; c < COLS; c++) {
      const x = PAD + c * STEP;
      lines.push(<line key={`v${c}`} x1={x} y1={PAD} x2={x} y2={PAD + (ROWS-1)*STEP} />);
    }
    return lines;
  }, []);

  // Diagonales du plateau (0-4-8 et 2-4-6)
  const diagLines = [
    <line key="d1" x1={PAD} y1={PAD} x2={PAD+(COLS-1)*STEP} y2={PAD+(ROWS-1)*STEP} />,
    <line key="d2" x1={PAD+(COLS-1)*STEP} y1={PAD} x2={PAD} y2={PAD+(ROWS-1)*STEP} />,
  ];

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={SVG_W} height={SVG_H}
      style={{ display: "block", maxWidth: "100%" }}
      role="img" aria-label="Plateau Fanorona 3×3">

      {/* Fond */}
      <rect width={SVG_W} height={SVG_H} rx={16}
        fill="var(--board-bg)" stroke="var(--board-border)" strokeWidth={0.5} />

      {/* Grille H+V */}
      <g stroke="var(--grid-color)" strokeWidth={1.5} strokeLinecap="round">
        {gridLines}
      </g>

      {/* Diagonales */}
      <g stroke="var(--grid-color)" strokeWidth={1} strokeLinecap="round"
        strokeDasharray="4 3" opacity={0.6}>
        {diagLines}
      </g>

      {/* Points d'intersection */}
      {Array.from({ length: N }, (_, i) => {
        const { x, y } = toXY(i);
        return <circle key={`dot${i}`} cx={x} cy={y} r={3} fill="var(--grid-color)" />;
      })}

      {/* Hints placement (phase 1) */}
      {phase === 1 && !gameOver && board.map((v, i) =>
        v === PLAYER.NONE
          ? <PlacementHint key={`ph${i}`} index={i} onClick={() => onCellClick(i)} />
          : null
      )}

      {/* Highlight du pion sélectionné */}
      {selected !== null && (() => {
        const { x, y } = toXY(selected);
        return <circle cx={x} cy={y} r={PIECE_R + 7} fill="#EF9F27" opacity={0.18} />;
      })()}

      {/* Hints mouvement (phase 2) */}
      {validMoves.map((i) => (
        <MoveHint key={`mh${i}`} index={i} onClick={() => onCellClick(i)} />
      ))}

      {/* Pions */}
      {board.map((v, i) =>
        v !== PLAYER.NONE ? (
          <Piece key={`p${i}`} index={i} player={v}
            isSelected={selected === i}
            onClick={() => onCellClick(i)} />
        ) : null
      )}
    </svg>
  );
}

function StatusBar({ state }) {
  const { currentPlayer, phase, placed, gameOver, winner } = state;
  const label = gameOver
    ? `Joueur ${winner} gagne !`
    : `Joueur ${currentPlayer} (${currentPlayer === PLAYER.ONE ? "noir" : "blanc"})`;
  const badge = gameOver
    ? "Partie terminée"
    : phase === 1
    ? `Phase 1 · Placement (${placed[currentPlayer]}/3)`
    : "Phase 2 · Mouvement";

  return (
    <div style={styles.statusBar}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          ...styles.dot,
          background: gameOver
            ? (winner === PLAYER.ONE ? "#1a1a18" : "#f5f3ee")
            : currentPlayer === PLAYER.ONE ? "#1a1a18" : "#f5f3ee",
          border: "2px solid #888",
        }} />
        <span style={styles.playerLabel}>{label}</span>
      </div>
      <span style={{
        ...styles.badge,
        background: gameOver ? "var(--badge-win-bg)" : "var(--badge-bg)",
        color:      gameOver ? "var(--badge-win-color)" : "var(--badge-color)",
      }}>
        {badge}
      </span>
    </div>
  );
}

function MessageBox({ state }) {
  const { phase, selected, gameOver, winner, currentPlayer } = state;
  let msg = "";
  if (gameOver) {
    msg = `Joueur ${winner} (${winner === PLAYER.ONE ? "noir" : "blanc"}) a aligné ses 3 pions !`;
  } else if (phase === 1) {
    msg = `Joueur ${currentPlayer} — placez un pion sur une intersection libre.`;
  } else if (selected !== null) {
    msg = `Joueur ${currentPlayer} — déplacez vers une intersection adjacente libre (cercle bleu).`;
  } else {
    msg = `Joueur ${currentPlayer} — choisissez un de vos pions à déplacer.`;
  }
  return (
    <div style={{
      ...styles.messageBox,
      background:  gameOver ? "var(--msg-win-bg)"    : "var(--msg-bg)",
      color:       gameOver ? "var(--msg-win-color)"  : "var(--msg-color)",
      fontWeight:  gameOver ? 500 : 400,
    }}>
      {msg}
    </div>
  );
}

function ScoreBoard({ scores }) {
  return (
    <div style={styles.scoreBoard}>
      <span style={styles.scoreItem}>
        <span style={{ ...styles.dot, background: " #1a1a18", border: "1.5px solid #888", marginRight: 6 }} />
        Joueur 1 : <strong style={{ marginLeft: 4 }}>{scores[PLAYER.ONE]}</strong>
      </span>
      <span style={{ color: "var(--divider)", fontSize: 12 }}>|</span>
      <span style={styles.scoreItem}>
        <span style={{ ...styles.dot, background: "#f5f3ee", border: "1.5px solid #888", marginRight: 6 }} />
        Joueur 2 : <strong style={{ marginLeft: 4 }}>{scores[PLAYER.TWO]}</strong>
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function Fanorona3x3() {
  const [gameState, setGameState] = useState(initState);
  const [scores, setScores]       = useState({ [PLAYER.ONE]: 0, [PLAYER.TWO]: 0 });

  const handleCellClick = useCallback((cellIndex) => {
    setGameState((prev) => {
      const next = applyAction(prev, cellIndex);
      if (next.gameOver && !prev.gameOver && next.winner) {
        setScores((s) => ({ ...s, [next.winner]: s[next.winner] + 1 }));
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => setGameState(initState()), []);

  return (
    <div style={styles.root}>
      <style>{`
        :root {
          --board-bg: #f8f7f4; --board-border: #c8c6bc; --grid-color: #a0a098;
          --badge-bg: #dbeeff; --badge-color: #185fa5;
          --badge-win-bg: #d4f5e2; --badge-win-color: #1a6640;
          --msg-bg: #f1efea; --msg-color: #5f5e5a;
          --msg-win-bg: #d4f5e2; --msg-win-color: #1a6640;
          --divider: #ccc;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --board-bg: #1e1d1b; --board-border: #3d3c39; --grid-color: #555450;
            --badge-bg: #0c3a5c; --badge-color: #7bbcf0;
            --badge-win-bg: #0d3d22; --badge-win-color: #6de6a0;
            --msg-bg: #2a2927; --msg-color: #a0a098;
            --msg-win-bg: #0d3d22; --msg-win-color: #6de6a0;
            --divider: #444;
          }
        }
        button:hover { opacity: 0.82; }
      `}</style>

      <h1 style={styles.title}>Fanorona <span style={styles.titleAccent}>3 × 3</span></h1>
      <p style={styles.subtitle}>Jeu traditionnel malagasy</p>

      <StatusBar  state={gameState} />
      <Board      state={gameState} onCellClick={handleCellClick} />
      <MessageBox state={gameState} />

      <div style={styles.controls}>
        <button style={styles.btnSecondary} onClick={handleReset}>↺ Recommencer</button>
        {gameState.gameOver && (
          <button style={styles.btnPrimary} onClick={handleReset}>Nouvelle partie →</button>
        )}
      </div>

      <ScoreBoard scores={scores} />

      
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = {
  root: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "1rem", padding: "2rem 1rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 480, margin: "0 auto", userSelect: "none",
  },
  title:       { fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", color: "inherit", margin: 0 },
  titleAccent: { color: "#EF9F27" },
  subtitle:    { fontSize: 13, color: "#888", margin: "-0.5rem 0 0" },
  statusBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", maxWidth: 320,
    background: "var(--msg-bg)", border: "0.5px solid var(--divider)",
    borderRadius: 12, padding: "0.65rem 1rem",
  },
  dot: { display: "inline-block", width: 13, height: 13, borderRadius: "50%", flexShrink: 0 },
  playerLabel: { fontSize: 14, fontWeight: 500 },
  badge:       { fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20 },
  messageBox: {
    width: "100%", maxWidth: 320, minHeight: 42, borderRadius: 10,
    padding: "0.6rem 1rem", fontSize: 13, textAlign: "center",
    lineHeight: 1.5, border: "0.5px solid var(--divider)", transition: "background 0.3s, color 0.3s",
  },
  controls:    { display: "flex", gap: 10 },
  btnSecondary: {
    fontSize: 13, padding: "7px 18px", borderRadius: 8, cursor: "pointer",
    fontFamily: "inherit", border: "0.5px solid var(--divider)",
    background: "transparent", color: "inherit",
  },
  btnPrimary: {
    fontSize: 13, padding: "7px 18px", borderRadius: 8, cursor: "pointer",
    fontFamily: "inherit", border: "none",
    background: "#EF9F27", color: "#fff", fontWeight: 500,
  },
  scoreBoard:  { display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#888" },
  scoreItem:   { display: "flex", alignItems: "center" },
  rules: {
    width: "100%", maxWidth: 340, border: "0.5px solid var(--divider)",
    borderRadius: 10, padding: "0.6rem 1rem", fontSize: 13, color: "inherit",
  },
  rulesSummary: { cursor: "pointer", fontWeight: 500, fontSize: 13, listStyle: "none", outline: "none" },
  rulesBody:    { marginTop: 10, lineHeight: 1.6, color: "#888" },
};
