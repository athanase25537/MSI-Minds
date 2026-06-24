# Fanoron‑telo – Backend IA (FastAPI)

> Projet Hackathon – Algorithmique Avancée – ISPM Madagascar 2025

---

## 1. En‑tête institutionnel et identification

**Institution :** [ISPM Madagascar](https://www.ispm-edu.com)
**Groupe :** MSI-Minds  

| Nom complet | Numéro étudiant | Classe | Rôle dans le hackathon |
|-------------|-----------------|--------|-------------------------|
| ANDRIAMASY Athanase Marc | 28 | ESIIA 4 | Lead Developer & Backend Architect & DevOps |
| RANDRIANARISOA Notahianiela Olly Desto | 20 | IMTICIA 4 | UI/UX Designer & Frontend Lead |
| Ravelonjatovoarijaona Zo Noary Fitahiana | 29 | ESIIA 4 | Frontend Developer & API Integration |
| Rakotoniaina Mbolatiana Joëllah | 13 | ESIIA 4 | Quality Assurance & Testing Engineer |
| Rakotoarisoa Heriniaina Steve | 15 | ESIIA 4 | AI Core Developer (Minimax & Alpha‑Beta) |
| RAKOTONARIVO Jonah Harivelona | 6 | ESIIA 4 | AI Heuristic & Evaluation Specialist |
| RAVELOMANANTSOA Hardy Christel | 14 | ESIIA 4 | Technical Documentation & Project Coordinator |

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
- ✅ Interface utilisateur fonctionnelle (HTML/CSS/JS) intégrée au backend

**Ce qui n’a pas été fait** (P3 bonus) :
- Undo/Redo
- Animations avancées
- Table de transposition / opening book
- Déploiement effectif (mais le README contient les instructions pour lancer localement)

**Architecture technique** :
- Backend : FastAPI (Python 3.10+)
- Frontend : HTML / CSS / JavaScript (intégré dans les templates)
- Serveur : Uvicorn (ou `fastapi run`)
- Test : pytest
- Stockage : en mémoire (dict) – peut être remplacé par Redis/DB en production

**Lien vers la version hébergée** : [https://msi-minds.onrender.com/](https://msi-minds.onrender.com/)

---

## 3. Guide d’installation rapide (4 commandes)

### Prérequis
- **Python 3.10 ou supérieur** installé sur votre machine.
- **Git** pour cloner le dépôt.

### Étapes pour Linux / macOS

```bash
# 1. Cloner le dépôt
git clone https://github.com/athanase25537/MSI-Minds.git
cd MSI-Minds

# 2. Lancer le frontend (dans ./view)
cd view
npm install
npm run dev

# 3. Lancer le backend (dans ./back)
cd ../back

# 3a. Créer et activer l’environnement virtuel
python3 -m venv venv
source venv/bin/activate

# 3b. Installer les dépendances
pip install -r requirements.txt

# 3c. Lancer le serveur (avec uvicorn, recommandé)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```

### Étapes pour Windows Powershell

```bash
# 1. Cloner le dépôt
git clone https://github.com/athanase25537/MSI-Minds.git
cd MSI-Minds

# 2. Lancer le frontend (dans .\view)
cd view
npm install
npm run dev

# 3. Lancer le backend (dans .\back)
cd ..\back

# 3a. Créer et activer l’environnement virtuel
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3b. Installer les dépendances
pip install -r requirements.txt

# 3c. Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

```