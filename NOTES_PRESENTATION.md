# Project 5 - Presentation Notes

## Overview

**Projet**: Deploiement d'un modele ML en production (POC)
**Client**: TechNova Partners / Futurisys
**Objectif**: API de prediction d'attrition des employes

---

## Architecture Production-Ready

### Data Flow (Point cle pour la presentation)

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

### Pourquoi cette architecture?

**Question anticipee**: "Pourquoi le feature engineering cote serveur?"

**Reponse**: Dans un cas reel, les RH n'ont acces qu'aux donnees brutes des employes. Ils ne connaissent pas les features engineerees comme `satisfaction_globale` ou `ratio_poste_entreprise`. L'API doit donc:

1. Accepter uniquement les donnees brutes (30 champs)
2. Calculer les 5 features engineerees cote serveur
3. Faire la prediction avec les 35 features completes
4. Logger l'ensemble (raw + engineered) pour tracabilite

---

## Features Engineerees (Calculees cote serveur)

| Feature | Formule | Signification |
|---------|---------|---------------|
| `ratio_poste_entreprise` | annees_poste / (annees_entreprise + 1) | Stabilite dans le poste |
| `evolution_evaluation` | note_actuelle - note_precedente | Progression de performance |
| `satisfaction_globale` | moyenne(4 scores satisfaction) | Satisfaction generale |
| `salaire_par_experience` | salaire / (experience + 1) | Ratio remuneration |
| `duree_moyenne_poste` | experience / (nb_postes + 1) | Stabilite carriere |

---

## Stack Technique

### Backend
- **FastAPI**: Framework API Python moderne
- **Pydantic**: Validation des donnees d'entree
- **SQLAlchemy**: ORM pour PostgreSQL
- **Joblib**: Chargement du modele ML

### Database
- **PostgreSQL**: Base de donnees relationnelle
- **Tables**: `employees` (raw data), `predictions` (logs)
- **Views**: `prediction_stats`, `employee_summary`

### Frontend
- **React + Vite**: Interface utilisateur moderne
- **TailwindCSS**: Styling avec design Glassmorphism
- **Lucide Icons**: Iconographie

### DevOps
- **Docker Compose**: Orchestration multi-conteneurs
- **Hot Reload**: Developpement local efficace

---

## Points Forts a Presenter

### 1. Separation des responsabilites
- CSV = donnees brutes uniquement (32 colonnes)
- API = feature engineering + prediction
- DB = tracabilite complete

### 2. Tracabilite (Exigence cahier des charges)
- Chaque prediction est loggee avec:
  - Donnees d'entree (raw + engineered)
  - Resultat de prediction
  - Probabilite et niveau de risque
  - Timestamp

### 3. Transparence
- L'API retourne les features calculees dans la reponse
- Permet de comprendre comment la prediction est faite

### 4. Validation robuste
- Pydantic valide toutes les entrees
- Types, ranges, valeurs obligatoires

---

## Demo Scenarios

### Scenario 1: Prediction manuelle
1. Ouvrir le frontend (http://localhost:3030)
2. Remplir le formulaire avec donnees employe
3. Soumettre et voir:
   - Niveau de risque (Low/Medium/High)
   - Probabilite d'attrition
   - Features calculees
   - Recommandations

### Scenario 2: Prediction depuis la base
1. GET /employees - Liste des employes
2. GET /employees/{id}/predict - Prediction pour un employe existant
3. Montrer que les features sont calculees a la volee

### Scenario 3: Historique des predictions
1. GET /predictions - Voir l'historique
2. GET /predictions/{id} - Detail avec input_data complet
3. Montrer la tracabilite

---

## Reponses aux Questions Anticipees

### Q: Pourquoi ne pas stocker les features engineerees?
**R**: Pour eviter la duplication et garantir la coherence. Si on modifie une formule, toutes les predictions futures utilisent la nouvelle version. Les anciennes predictions gardent leur input_data original pour audit.

### Q: Comment gerer les mises a jour du modele?
**R**: Le champ `model_version` dans la table predictions permet de tracer quelle version a fait chaque prediction. On peut ainsi comparer les performances entre versions.

### Q: Pourquoi PostgreSQL plutot que SQLite?
**R**: PostgreSQL est une base production-ready avec:
- Support JSON natif (JSONB) pour stocker input_data
- Performances superieures pour les requetes complexes
- Facilement deployable sur le cloud

### Q: Comment securiser l'API en production?
**R**: Points a implementer:
- Authentication (JWT tokens)
- Rate limiting
- HTTPS obligatoire
- Variables d'environnement pour secrets

---

## Fichiers Cles

| Fichier | Role |
|---------|------|
| `app/main.py` | Endpoints FastAPI |
| `app/feature_engineering.py` | Calcul des 5 features engineerees |
| `app/schemas.py` | Validation Pydantic (30 champs raw) |
| `app/model.py` | Chargement et inference ML |
| `app/database.py` | Modeles SQLAlchemy |
| `scripts/create_db.sql` | Schema PostgreSQL |
| `data/employees.csv` | Dataset brut (294 employes) |
| `docker-compose.yml` | Orchestration services |

---

## Metriques du Modele (depuis P4)

| Metrique | Valeur |
|----------|--------|
| AUC-ROC | 0.816 |
| Accuracy | 76.2% |
| Recall | 70.2% |
| F1-Score | 0.485 |

**Top 5 Facteurs d'attrition** (SHAP):
1. `heure_supplementaires` - Heures sup
2. `frequence_deplacement_Frequent` - Deplacements frequents
3. `ratio_poste_entreprise` - Stabilite poste
4. `duree_moyenne_poste` - Stabilite carriere
5. `annees_dans_le_poste_actuel` - Anciennete poste

---

## Insights Cles du Modele (Tests API)

### 1. Satisfaction : Impact Majeur mais Fragmente

| Facteur | Impact sur Probabilite |
|---------|------------------------|
| **Toute satisfaction = 1** | **+73.7%** (7.7% → 81.4%) |
| Heures supplementaires = Oui | +37.3% |
| Environnement satisfaction = 1 | +24.0% |
| Nature travail satisfaction = 1 | +20.4% |
| Equilibre pro/perso = 1 | +19.3% |

**Explication SHAP vs Realite:**
> Le modele considere la satisfaction comme un facteur majeur (impact combine de +73.7%), mais cette importance est distribuee sur 4 indicateurs de satisfaction. SHAP mesure chaque feature individuellement, ce qui explique pourquoi les heures supplementaires (feature unique) apparaissent en tete.

### 2. Paradoxe de l'Evolution d'Evaluation

| Precedente | Actuelle | Evolution | Risque Attrition |
|------------|----------|-----------|------------------|
| 4 | 3 | -1 (decline) | **16.2%** |
| 3 | 3 | 0 (stable) | 23.9% |
| 2 | 3 | +1 (amelioration) | 33.7% |
| 1 | 3 | +2 (bond) | 45.2% |
| 1 | 4 | +3 (bond majeur) | **54.0%** |

**Insight Business:**
> Les employes qui ont recemment recu une forte amelioration de leur evaluation (+2 ou +3 points) presentent un risque d'attrition 2x plus eleve (45-54%) que ceux avec une evaluation stable (24%).
>
> **Explication:** Une bonne evaluation peut valider la valeur de l'employe sur le marche et lui donner confiance pour chercher ailleurs. C'est le paradoxe du "bon performer qui part apres sa meilleure evaluation".

### 3. Autres Facteurs Notables

| Facteur | Impact |
|---------|--------|
| Annees sans promotion (0→15) | +49.9% |
| Frequence deplacement (Aucun→Frequent) | +28.7% |
| Age (22→55 ans) | -12.9% |
| Revenu mensuel (2k→20k) | -6.9% |

---

## Commandes Utiles pour la Demo

```bash
# Demarrer tous les services
docker compose up -d

# Voir les logs
docker compose logs -f api

# Tester l'API
curl http://localhost:8000/health
curl http://localhost:8000/model/info
curl http://localhost:8000/employees

# Acceder a la base
docker compose exec db psql -U postgres -d attrition_db

# Frontend
http://localhost:3030

# Documentation API
http://localhost:8000/docs
```
