"""
FastAPI application for Employee Attrition Prediction
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session

from app import __version__
from app.model import get_model
from app.database import get_db, log_prediction, get_employee_by_id, get_employees, get_predictions, Prediction, Employee
from app.feature_engineering import feature_engineer
from app.schemas import (
    EmployeeInput,
    EngineeredFeatures,
    PredictionOutput,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelInfo,
    HealthCheck,
)

# Initialize FastAPI app
app = FastAPI(
    title="Employee Attrition Prediction API",
    description="""
    API de prédiction d'attrition des employés.

    Cette API utilise un modèle de classification (LogisticRegression) entraîné
    sur les données de TechNova Partners pour prédire le risque de départ d'un employé.

    ## Endpoints

    - **GET /health** - Vérifier l'état de l'API
    - **POST /predict** - Prédire l'attrition pour un employé
    - **POST /predict/batch** - Prédictions pour plusieurs employés
    - **GET /model/info** - Informations sur le modèle
    - **GET /employees** - Liste des employés en base
    - **GET /employees/{id}/predict** - Prédire pour un employé en base
    - **GET /predictions** - Historique des prédictions
    """,
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API info."""
    return {
        "message": "Employee Attrition Prediction API",
        "version": __version__,
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Check API health status."""
    try:
        model = get_model()
        model_loaded = model.model is not None
    except Exception:
        model_loaded = False

    return HealthCheck(
        status="healthy" if model_loaded else "degraded",
        version=__version__,
        model_loaded=model_loaded,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict(employee: EmployeeInput, db: Session = Depends(get_db)):
    """
    Predict attrition risk for a single employee.

    HR provides raw employee data. Engineered features are computed server-side.
    Returns prediction (0/1), probability, and risk level (low/medium/high).
    All predictions are logged to the database.
    """
    try:
        model = get_model()
        raw_data = employee.model_dump()

        # Compute engineered features server-side
        full_data = feature_engineer.engineer_features(raw_data)

        # Make prediction with complete feature set
        result = model.predict(full_data)

        # Log to database (store raw + engineered data)
        db_prediction = log_prediction(
            db=db,
            input_data=full_data,
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        # Extract engineered features for response (5 features)
        engineered = EngineeredFeatures(
            ratio_poste_entreprise=full_data["ratio_poste_entreprise"],
            evolution_evaluation=full_data["evolution_evaluation"],
            satisfaction_globale=full_data["satisfaction_globale"],
            salaire_par_experience=full_data["salaire_par_experience"],
            duree_moyenne_poste=full_data["duree_moyenne_poste"],
        )

        return PredictionResponse(
            prediction_id=db_prediction.id,
            result=PredictionOutput(**result),
            engineered_features=engineered,
            timestamp=datetime.now(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Predictions"])
async def predict_batch(request: BatchPredictionRequest, db: Session = Depends(get_db)):
    """
    Predict attrition risk for multiple employees.

    HR provides raw employee data. Engineered features are computed server-side.
    Accepts a list of employees and returns predictions for each.
    All predictions are logged to the database.
    """
    try:
        model = get_model()
        predictions = []

        for employee in request.employees:
            raw_data = employee.model_dump()

            # Compute engineered features server-side
            full_data = feature_engineer.engineer_features(raw_data)

            # Make prediction with complete feature set
            result = model.predict(full_data)

            # Log to database (store raw + engineered data)
            db_prediction = log_prediction(
                db=db,
                input_data=full_data,
                prediction=result["prediction"],
                probability=result["probability"],
                risk_level=result["risk_level"]
            )

            # Extract engineered features for response (5 features)
            engineered = EngineeredFeatures(
                ratio_poste_entreprise=full_data["ratio_poste_entreprise"],
                evolution_evaluation=full_data["evolution_evaluation"],
                satisfaction_globale=full_data["satisfaction_globale"],
                salaire_par_experience=full_data["salaire_par_experience"],
                duree_moyenne_poste=full_data["duree_moyenne_poste"],
            )

            predictions.append(
                PredictionResponse(
                    prediction_id=db_prediction.id,
                    result=PredictionOutput(**result),
                    engineered_features=engineered,
                    timestamp=datetime.now(),
                )
            )

        return BatchPredictionResponse(
            predictions=predictions,
            count=len(predictions),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@app.get("/model/info", response_model=ModelInfo, tags=["Model"])
async def model_info():
    """Get model information and performance metrics."""
    try:
        model = get_model()
        info = model.get_model_info()
        return ModelInfo(**info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")


@app.get("/model/features", tags=["Model"])
async def model_features():
    """Get list of features used by the model."""
    try:
        model = get_model()
        return {
            "features": model.feature_names,
            "categorical": model.categorical_features,
            "numerical": model.numerical_features,
            "total": len(model.feature_names),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting features: {str(e)}")


@app.get("/employees", tags=["Employees"])
async def list_employees(
    skip: int = 0,
    limit: int = 100,
    dataset_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of employees from the database.

    Filter by dataset_type: 'train' or 'test' (optional)
    """
    employees = get_employees(db, skip=skip, limit=limit, dataset_type=dataset_type)
    return {
        "employees": [
            {
                "employee_id": e.employee_id,
                "age": e.age,
                "genre": e.genre,
                "departement": e.departement,
                "poste": e.poste,
                "revenu_mensuel": e.revenu_mensuel,
                "annees_dans_l_entreprise": e.annees_dans_l_entreprise,
                "attrition_actual": e.attrition_actual,
                "dataset_type": e.dataset_type
            }
            for e in employees
        ],
        "count": len(employees),
        "skip": skip,
        "limit": limit
    }


@app.get("/employees/{employee_id}", tags=["Employees"])
async def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Get a specific employee by ID."""
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")

    return {
        "employee_id": employee.employee_id,
        "age": employee.age,
        "genre": employee.genre,
        "statut_marital": employee.statut_marital,
        "departement": employee.departement,
        "poste": employee.poste,
        "revenu_mensuel": employee.revenu_mensuel,
        "annees_dans_l_entreprise": employee.annees_dans_l_entreprise,
        "satisfaction_globale": employee.satisfaction_globale,
        "heure_supplementaires": "Oui" if employee.surcharge_travail else "Non",
        "attrition_actual": employee.attrition_actual
    }


@app.get("/employees/{employee_id}/predict", response_model=PredictionResponse, tags=["Employees"])
async def predict_employee(employee_id: int, db: Session = Depends(get_db)):
    """
    Predict attrition for an employee from the database.

    Uses raw employee data from DB and computes engineered features server-side.
    """
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail=f"Employee {employee_id} not found")

    try:
        model = get_model()

        # Build RAW input data from employee record (no engineered features)
        raw_data = {
            "genre": employee.genre,
            "statut_marital": employee.statut_marital,
            "departement": employee.departement,
            "poste": employee.poste,
            "heure_supplementaires": employee.heure_supplementaires,
            "augementation_salaire_precedente": employee.augementation_salaire_precedente,
            "domaine_etude": employee.domaine_etude,
            "ayant_enfants": employee.ayant_enfants,
            "frequence_deplacement": employee.frequence_deplacement,
            "age": employee.age,
            "revenu_mensuel": employee.revenu_mensuel,
            "nombre_experiences_precedentes": employee.nombre_experiences_precedentes,
            "nombre_heures_travailless": employee.nombre_heures_travailless,
            "annee_experience_totale": employee.annee_experience_totale,
            "annees_dans_l_entreprise": employee.annees_dans_l_entreprise,
            "annees_dans_le_poste_actuel": employee.annees_dans_le_poste_actuel,
            "satisfaction_employee_environnement": employee.satisfaction_employee_environnement,
            "note_evaluation_precedente": employee.note_evaluation_precedente,
            "niveau_hierarchique_poste": employee.niveau_hierarchique_poste,
            "satisfaction_employee_nature_travail": employee.satisfaction_employee_nature_travail,
            "satisfaction_employee_equipe": employee.satisfaction_employee_equipe,
            "satisfaction_employee_equilibre_pro_perso": employee.satisfaction_employee_equilibre_pro_perso,
            "note_evaluation_actuelle": employee.note_evaluation_actuelle,
            "nombre_participation_pee": employee.nombre_participation_pee,
            "nb_formations_suivies": employee.nb_formations_suivies,
            "nombre_employee_sous_responsabilite": employee.nombre_employee_sous_responsabilite,
            "distance_domicile_travail": employee.distance_domicile_travail,
            "niveau_education": employee.niveau_education,
            "annees_depuis_la_derniere_promotion": employee.annees_depuis_la_derniere_promotion,
            "annes_sous_responsable_actuel": employee.annes_sous_responsable_actuel,
        }

        # Compute engineered features server-side
        full_data = feature_engineer.engineer_features(raw_data)

        result = model.predict(full_data)

        # Log to database with employee_id
        db_prediction = log_prediction(
            db=db,
            input_data=full_data,
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"],
            employee_id=employee_id
        )

        # Extract engineered features for response (5 features)
        engineered = EngineeredFeatures(
            ratio_poste_entreprise=full_data["ratio_poste_entreprise"],
            evolution_evaluation=full_data["evolution_evaluation"],
            satisfaction_globale=full_data["satisfaction_globale"],
            salaire_par_experience=full_data["salaire_par_experience"],
            duree_moyenne_poste=full_data["duree_moyenne_poste"],
        )

        return PredictionResponse(
            prediction_id=db_prediction.id,
            employee_id=employee_id,
            result=PredictionOutput(**result),
            engineered_features=engineered,
            timestamp=datetime.now(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/predictions", tags=["Predictions"])
async def list_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get history of predictions from the database."""
    predictions = get_predictions(db, skip=skip, limit=limit)
    return {
        "predictions": [
            {
                "id": p.id,
                "employee_id": p.employee_id,
                "prediction": p.prediction,
                "probability": p.probability,
                "risk_level": p.risk_level,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in predictions
        ],
        "count": len(predictions),
        "skip": skip,
        "limit": limit
    }


@app.get("/predictions/{prediction_id}", tags=["Predictions"])
async def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get a specific prediction by ID."""
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail=f"Prediction {prediction_id} not found")

    return {
        "id": prediction.id,
        "employee_id": prediction.employee_id,
        "prediction": prediction.prediction,
        "probability": prediction.probability,
        "risk_level": prediction.risk_level,
        "input_data": prediction.input_data,
        "model_version": prediction.model_version,
        "created_at": prediction.created_at.isoformat() if prediction.created_at else None
    }


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
