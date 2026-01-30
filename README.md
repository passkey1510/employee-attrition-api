---
title: Employee Attrition API
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Employee Attrition Prediction API

API de prediction d'attrition des employes basee sur le modele de classification du Projet 4.

## Vue d'ensemble

Cette API expose un modele de Machine Learning (LogisticRegression) entraine sur les donnees de TechNova Partners pour predire le risque de depart d'un employe.

### Performances du modele

| Metrique | Valeur |
|----------|--------|
| AUC-ROC | 81.6% |
| Accuracy | 76.2% |
| Recall | 70.2% |
| F1-Score | 48.5% |

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   HR Input      │────▶│   FastAPI       │────▶│   ML Model      │
│  (30 raw fields)│     │  + Feature Eng. │     │  (35 features)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │  (Tracabilite)  │
                        └─────────────────┘
```

## Installation

### Prerequis

- Python 3.12+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Installation locale

```bash
# Cloner le depot
git clone <repository-url>
cd project-5

# Installer les dependances
pip install -r requirements.txt

# Copier le fichier d'environnement
cp .env.example .env
```

### Demarrage avec Docker Compose

```bash
# Demarrer tous les services (API + PostgreSQL)
docker compose up -d

# Verifier les logs
docker compose logs -f api

# Arreter les services
docker compose down
```

### Demarrage manuel (developpement)

```bash
# Demarrer PostgreSQL
docker run -d \
  --name postgres-attrition \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=attrition_db \
  -p 5432:5432 \
  postgres:15

# Creer les tables
docker exec -i postgres-attrition psql -U postgres -d attrition_db < scripts/create_db.sql

# Seeder les donnees
python scripts/seed_db.py

# Demarrer l'API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Utilisation

### Documentation API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints principaux

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Info API |
| GET | `/health` | Health check |
| POST | `/predict` | Prediction unique |
| POST | `/predict/batch` | Predictions en lot |
| GET | `/model/info` | Infos du modele |
| GET | `/employees` | Liste des employes |
| GET | `/employees/{id}/predict` | Prediction pour un employe |
| GET | `/predictions` | Historique des predictions |

### Exemple de prediction

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "genre": "M",
    "statut_marital": "Marie(e)",
    "departement": "Commercial",
    "poste": "Representant Commercial",
    "heure_supplementaires": "Non",
    "augementation_salaire_precedente": 0.13,
    "domaine_etude": "Infra & Cloud",
    "ayant_enfants": "Y",
    "frequence_deplacement": "Occasionnel",
    "age": 35,
    "revenu_mensuel": 5000,
    "nombre_experiences_precedentes": 2,
    "nombre_heures_travailless": 80,
    "annee_experience_totale": 10,
    "annees_dans_l_entreprise": 5,
    "annees_dans_le_poste_actuel": 3,
    "satisfaction_employee_environnement": 3,
    "note_evaluation_precedente": 3,
    "niveau_hierarchique_poste": 2,
    "satisfaction_employee_nature_travail": 4,
    "satisfaction_employee_equipe": 3,
    "satisfaction_employee_equilibre_pro_perso": 3,
    "note_evaluation_actuelle": 4,
    "nombre_participation_pee": 1,
    "nb_formations_suivies": 3,
    "nombre_employee_sous_responsabilite": 0,
    "distance_domicile_travail": 10,
    "niveau_education": 3,
    "annees_depuis_la_derniere_promotion": 1,
    "annes_sous_responsable_actuel": 3
  }'
```

### Reponse

```json
{
  "prediction_id": 1,
  "result": {
    "prediction": 0,
    "probability": 0.1542,
    "risk_level": "low",
    "attrition_label": "Non"
  },
  "engineered_features": {
    "ratio_poste_entreprise": 0.5,
    "evolution_evaluation": 1,
    "satisfaction_globale": 3.25,
    "salaire_par_experience": 454.55,
    "duree_moyenne_poste": 3.33
  },
  "timestamp": "2026-02-05T16:45:00"
}
```

## Schema de la base de donnees

```
┌─────────────────────────────┐       ┌─────────────────────────────┐
│       employees             │       │       predictions           │
├─────────────────────────────┤       ├─────────────────────────────┤
│ id (PK)                     │◄──────│ employee_id (FK, nullable)  │
│ employee_id (UNIQUE)        │       │ id (PK)                     │
│ genre                       │       │ input_data (JSONB)          │
│ age                         │       │ prediction (INTEGER)        │
│ departement                 │       │ probability (FLOAT)         │
│ ... (30 features)           │       │ risk_level (VARCHAR)        │
│ attrition_actual            │       │ model_version (VARCHAR)     │
│ dataset_type                │       │ created_at (TIMESTAMP)      │
└─────────────────────────────┘       └─────────────────────────────┘
```

## Tests

### Executer les tests

```bash
# Tests unitaires et fonctionnels
pytest tests/ -v

# Avec couverture
pytest tests/ --cov=app --cov-report=term-missing

# Generer un rapport HTML
pytest tests/ --cov=app --cov-report=html
```

### Couverture actuelle: 91%

## Structure du projet

```
project-5/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI endpoints
│   ├── schemas.py              # Pydantic models
│   ├── database.py             # SQLAlchemy models
│   ├── model.py                # ML model loading
│   └── feature_engineering.py  # Feature computation
├── models/
│   ├── lr_pipeline.pkl         # Trained model
│   ├── features.json           # Feature info
│   └── model_metadata.json     # Model metadata
├── data/
│   └── employees.csv           # Dataset
├── tests/
│   ├── conftest.py             # Pytest fixtures
│   ├── test_api.py             # API tests
│   └── test_model.py           # Model tests
├── scripts/
│   ├── create_db.sql           # DB schema
│   └── seed_db.py              # Data seeding
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## Variables d'environnement

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/attrition_db` |

## Deploiement

### Hugging Face Spaces

1. Creer un compte sur [Hugging Face](https://huggingface.co)
2. Creer un nouveau Space (Docker)
3. Pousser le code

### Docker

```bash
# Build
docker build -t attrition-api .

# Run
docker run -p 8000:8000 attrition-api
```

## Securite (Production)

Pour un deploiement en production, implementer:

- [ ] Authentication JWT
- [ ] Rate limiting
- [ ] HTTPS obligatoire
- [ ] Gestion des secrets (variables d'environnement)
- [ ] Logs securises

## Auteur

Anh Tuan KIEU - Data Scientist

## Licence

Ce projet est developpe dans le cadre de la formation Data Scientist d'OpenClassrooms.
