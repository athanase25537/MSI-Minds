# Fanoron‑telo – Backend IA (FastAPI)

> Projet Hackathon – Algorithmique Avancée – ISPM Madagascar 2025

---

## 1. En‑tête institutionnel et identification

**Groupe :** MSI-Minds  
**Institution :** [ISPM Madagascar](https://www.ispm-edu.com)

| Nom complet | Numéro étudiant | Classe | Rôle dans le hackathon |
|-------------|-----------------|--------|-------------------------|
| ANDRIAMASY Athanase Marc | 28 | ESIIA 4 | Lead AI Developer |
| RANDRIANARISOA Notahianiela Olly Desto | 20 | IMTICIA 4 | UI/UX Designer & Frontend (API consommateur) |
| Rakotoniaina Mbolatiana Joëllah | 13 | ESIIA 4 | Backend Architect & DevOps |
| Rakotoarisoa Heriniaina Steve | 15 | ESIIA 4 | Expert Optimisation IA |
| RAKOTONARIVO Jonah  Harivelona | 6 | ESIIA 4 | Expert Optimisation IA |
| Ravelonjatovoarijaona Zo Noary Fitahiana | 29 | ESIIA 4 | Expert Optimisation IA |
| RAVELOMANANTSOA Hardy Christel  | 14 | ESIIA 4 | Expert Optimisation IA |

---

## 2. Description du travail réalisé

Nous avons développé le **backend complet** et le **frontend complet** du jeu Fanoron‑telo en **FastAPI**, en 5 heures de hackathon.  
L’application expose une API REST qui gère :

- La logique métier du jeu (placement, mouvement, victoire, blocage)
- Trois modes de jeu : Humain vs Humain, Humain vs IA, IA vs IA
- Trois niveaux d’IA : **Facile** (aléatoire), **Moyen** (Minimax profondeur 3) et **Difficile** (Alpha‑Bêta profondeur 6)
- Une fonction d’évaluation heuristique personnalisée (alignements, centre, mobilité)
- Des endpoints pour créer une partie, jouer un coup, demander un coup IA, réinitialiser

**Ce qui est réalisé** (P1 + P2) :
- ✅ Règles complètes (phases 1 et 2, détection victoire immédiate, détection de blocage)
- ✅ Modes HvH, HvIA (avec choix du camp), IA vs IA
- ✅ IA aléatoire, Minimax (profondeur 3), Alpha‑Bêta (profondeur 6)
- ✅ API documentée (Swagger automatique)
- ✅ CORS activé pour faciliter l’intégration frontend
- ✅ Code modulaire, tests unitaires de base

**Ce qui n’a pas été fait** (P3 bonus) :
- Undo/Redo
- Animations
- Table de transposition / opening book
- Déploiement effectif (mais le README contient les instructions pour lancer localement)

**Architecture technique** :
- Backend : FastAPI (Python 3.10+)
- Serveur : Uvicorn
- Test : pytest
- Stockage : en mémoire (dic) – peut être remplacé par Redis/DB en production

**Lien vers la version hébergée** : *non disponible pour l’instant (hébergement prévu plus tard)*

---

## 3. Guide d’installation rapide (3 commandes)

Assurez‑vous d’avoir **Python 3.10+** et **Git** installés.

```bash
# 1. Cloner le dépôt
git clone https://github.com/athanase25537/MSI-Minds
cd fanoron-telo-backend

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Lancer le serveur
fastapi run app/main.py --host 0.0.0.0 --port 8000