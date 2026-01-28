# Plan de Réalisation - Projet 5

## Vue d'ensemble

**Objectif** : Déployer le modèle de classification d'attrition (Projet 4) en tant qu'API de production.

**Modèle choisi** : Classification d'attrition des employés (**LogisticRegression**) du Projet 4

**Approche** : Local-first (tout tester en local avant Git/CI/CD)

---

## Ce qui compte VRAIMENT (TL;DR)

| Priorité | Élément | Pourquoi |
|----------|---------|----------|
| **1** | API FastAPI qui marche | C'est le coeur du projet |
| **2** | PostgreSQL (logs) | Traçabilité des prédictions |
| **3** | Tests Pytest | Prouve que ça fonctionne |
| **4** | Docs | README + Swagger auto |
| **5** | Git propre | Historique + branches |
| **6** | CI/CD + Déploiement | GitHub Actions + HF Spaces |

**Ce qui est overkill :**
- ❌ Schéma UML complexe → Simple diagram suffit
- ❌ Multiple tables DB → 2 tables suffisent (`employees`, `predictions`)
- ❌ Gestion des secrets complexe → `.env` suffit pour POC
- ❌ Multi-environnements (dev/test/prod) → Local + deployed suffit

---

## Justification du choix de LogisticRegression

| Modèle | F1-Score (Test) | AUC-ROC | Overfitting Gap |
|--------|-----------------|---------|-----------------|
| **LogisticRegression** | 47.0% | **80.8%** | +10.4 pts |
| RandomForest (base) | 17.5% | 78.5% | +82.5 pts |
| RandomForest (optimisé) | 48.1% | 78.2% | +21.3 pts |

**Avantages de LogisticRegression :**
- Meilleur AUC-ROC (80.8% vs 78.2%) = meilleure capacité de discrimination
- Moins d'overfitting (10.4 pts vs 21.3 pts) = meilleure généralisation
- Modèle plus simple et interprétable pour les stakeholders
- Plus léger en production (temps de prédiction plus rapide)
- Coefficients directement interprétables (importance des features)

---

## Structure du Projet

```
project-5/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + endpoints
│   ├── schemas.py              # Pydantic models
│   ├── database.py             # PostgreSQL connection
│   └── model.py                # ML model loading/prediction
├── models/
│   ├── lr_pipeline.pkl         # Trained model
│   ├── features.json           # Feature info
│   └── model_metadata.json     # Model metadata
├── data/
│   └── employees.csv           # Test set from P4
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api.py             # API tests
├── scripts/
│   └── create_db.sql           # Database setup
├── .github/
│   └── workflows/
│       └── ci.yml              # Tests automatiques (Phase 6)
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml          # API + PostgreSQL
├── requirements.txt
├── README.md
└── PLAN.md
```

---

## Phase 1 : Export depuis Projet 4 ✅

### 1.1 Ce qu'on exporte de P4

| Export | Fichier | Utilisation en P5 |
|--------|---------|-------------------|
| **Modèle entraîné** | `lr_pipeline.pkl` | API predictions |
| **Test set** | `employees.csv` | Table PostgreSQL |
| **Feature list** | `features.json` | Validation Pydantic |
| **Métadonnées** | `model_metadata.json` | Info modèle |

### 1.2 Tâches
- [x] Ajouter le code d'export au notebook P4 (cells 78-79)
- [ ] Exécuter le notebook P4 pour générer les fichiers
- [x] Créer les dossiers `project-5/models/` et `project-5/data/`

---

## Phase 2 : Développement de l'API FastAPI (Local)

### 2.1 Fichiers de base créés
- [x] `.gitignore`
- [x] `requirements.txt`
- [x] `.env.example`

### 2.2 Endpoints à créer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | API health status |
| POST | `/predict` | Single prediction |
| POST | `/predict/batch` | Batch predictions |
| GET | `/model/info` | Model metadata |
| GET | `/predictions/{id}` | Get prediction by ID |
| GET | `/predictions` | List predictions (paginated) |

### 2.3 Fichiers à créer

```python
# app/__init__.py - Package init
# app/main.py - FastAPI app + endpoints
# app/schemas.py - Pydantic models (EmployeeInput, PredictionOutput)
# app/model.py - ML model loading/prediction
# app/database.py - PostgreSQL connection + SQLAlchemy
```

### 2.4 Tâches
- [ ] Créer `app/__init__.py`
- [ ] Créer `app/model.py` (chargement modèle + prédiction)
- [ ] Créer `app/schemas.py` (Pydantic models)
- [ ] Créer `app/main.py` (endpoints)
- [ ] Tester l'API localement avec `uvicorn app.main:app --reload`

---

## Phase 3 : Base de Données PostgreSQL (Local Docker)

### 3.1 Schéma de la BDD

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│       employees             │       │       predictions           │
├─────────────────────────────┤       ├─────────────────────────────┤
│ id (PK)                     │◄──────│ employee_id (FK, nullable)  │
│ age                         │       │ id (PK)                     │
│ ... (features du modèle)    │       │ prediction (INTEGER)        │
│ attrition_actual            │       │ probability (FLOAT)         │
└─────────────────────────────┘       │ risk_level (VARCHAR)        │
        ↑                             │ created_at (TIMESTAMP)      │
   Test set de P4                     └─────────────────────────────┘
```

### 3.2 Docker PostgreSQL (Local)

```bash
# Lancer PostgreSQL
docker run -d \
  --name postgres-attrition \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=attrition_db \
  -p 5432:5432 \
  postgres:15
```

### 3.3 Tâches
- [ ] Créer `scripts/create_db.sql`
- [ ] Créer `app/database.py` (SQLAlchemy models + connection)
- [ ] Lancer PostgreSQL avec Docker
- [ ] Importer `employees.csv` dans PostgreSQL
- [ ] Ajouter logging des prédictions dans `predictions` table
- [ ] Créer `docker-compose.yml` (API + PostgreSQL)

---

## Phase 4 : Tests avec Pytest (Local)

### 4.1 Couverture visée : > 80%

### 4.2 Tests à implémenter

| Fichier | Tests |
|---------|-------|
| `test_api.py` | Endpoints, validation, error handling |
| `test_model.py` | Predictions, preprocessing |

### 4.3 Tâches
- [ ] Créer `tests/__init__.py`
- [ ] Créer `tests/conftest.py` (fixtures)
- [ ] Créer `tests/test_api.py`
- [ ] Exécuter `pytest --cov=app`
- [ ] Vérifier couverture > 80%

---

## Phase 5 : Documentation

### 5.1 Documents à créer

| Document | Contenu |
|----------|---------|
| `README.md` | Installation, usage, API docs |
| Swagger UI | Auto-généré par FastAPI |

### 5.2 Tâches
- [ ] Créer `README.md` complet
- [ ] Ajouter exemples curl/httpie
- [ ] Documenter le schéma DB
- [ ] Créer `Dockerfile`

---

## Phase 6 : Git & CI/CD (Dernier)

### 6.1 Git Setup
- [ ] Initialiser repo Git
- [ ] Créer branches : `main`, `develop`
- [ ] Commit initial avec tout le code fonctionnel

### 6.2 GitHub Actions
- [ ] Créer `.github/workflows/ci.yml`
- [ ] Configurer tests automatiques
- [ ] Ajouter badge CI dans README

### 6.3 Déploiement (Optionnel)
- [ ] Créer compte Hugging Face Spaces
- [ ] Déployer l'API

---

## Calendrier réaliste

| Phase | Durée | Status |
|-------|-------|--------|
| 1. Export modèle P4 | 1h | ✅ Code ajouté |
| 2. API FastAPI (local) | 4h | 🔄 En cours |
| 3. PostgreSQL (Docker) | 2h | ⏳ Pending |
| 4. Tests Pytest | 2h | ⏳ Pending |
| 5. Documentation | 2h | ⏳ Pending |
| 6. Git & CI/CD | 2h | ⏳ Pending |
| **TOTAL** | **~13h** | |

---

## Checklist finale

- [ ] API fonctionnelle localement
- [ ] PostgreSQL avec données
- [ ] Tests avec couverture > 80%
- [ ] README complet
- [ ] Repository Git structuré
- [ ] Pipeline CI/CD fonctionnel
- [ ] Documentation Swagger accessible
