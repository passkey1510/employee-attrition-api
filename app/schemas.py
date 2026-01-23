"""
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class EmployeeInput(BaseModel):
    """
    Input schema for employee data (raw features only).

    HR provides only the raw employee information.
    Engineered features are computed server-side.
    """

    # Categorical features
    genre: str = Field(..., description="Genre (M/F)")
    statut_marital: str = Field(..., description="Statut marital")
    departement: str = Field(..., description="Departement")
    poste: str = Field(..., description="Poste occupe")
    heure_supplementaires: str = Field(..., description="Heures supplementaires (Oui/Non)")
    augementation_salaire_precedente: float = Field(..., ge=0, le=1, description="Augmentation salaire precedente (ex: 0.13 pour 13%)")
    domaine_etude: str = Field(..., description="Domaine d'etude")
    ayant_enfants: str = Field(..., description="Ayant enfants (Y/N)")
    frequence_deplacement: str = Field(..., description="Frequence de deplacement")

    # Numerical features
    age: int = Field(..., ge=18, le=70, description="Age de l'employe")
    revenu_mensuel: float = Field(..., ge=0, description="Revenu mensuel")
    nombre_experiences_precedentes: int = Field(..., ge=0, description="Nombre d'experiences precedentes")
    nombre_heures_travailless: int = Field(..., ge=0, description="Nombre d'heures travaillees")
    annee_experience_totale: int = Field(..., ge=0, description="Annees d'experience totale")
    annees_dans_l_entreprise: int = Field(..., ge=0, description="Annees dans l'entreprise")
    annees_dans_le_poste_actuel: int = Field(..., ge=0, description="Annees dans le poste actuel")
    satisfaction_employee_environnement: int = Field(..., ge=1, le=5, description="Satisfaction environnement (1-5)")
    note_evaluation_precedente: int = Field(..., ge=1, le=5, description="Note evaluation precedente")
    niveau_hierarchique_poste: int = Field(..., ge=1, le=5, description="Niveau hierarchique")
    satisfaction_employee_nature_travail: int = Field(..., ge=1, le=5, description="Satisfaction nature travail (1-5)")
    satisfaction_employee_equipe: int = Field(..., ge=1, le=5, description="Satisfaction equipe (1-5)")
    satisfaction_employee_equilibre_pro_perso: int = Field(..., ge=1, le=5, description="Satisfaction equilibre pro/perso (1-5)")
    note_evaluation_actuelle: int = Field(..., ge=1, le=5, description="Note evaluation actuelle")
    nombre_participation_pee: int = Field(..., ge=0, description="Nombre participation PEE")
    nb_formations_suivies: int = Field(..., ge=0, description="Nombre de formations suivies")
    nombre_employee_sous_responsabilite: int = Field(..., ge=0, description="Nombre d'employes sous responsabilite")
    distance_domicile_travail: float = Field(..., ge=0, description="Distance domicile-travail (km)")
    niveau_education: int = Field(..., ge=1, le=5, description="Niveau d'education")
    annees_depuis_la_derniere_promotion: int = Field(..., ge=0, description="Annees depuis derniere promotion")
    annes_sous_responsable_actuel: int = Field(..., ge=0, description="Annees sous responsable actuel")

    # Note: Engineered features are computed server-side:
    # - ratio_poste_entreprise
    # - evolution_evaluation
    # - satisfaction_globale
    # - faible_satisfaction
    # - surcharge_travail
    # - salaire_par_experience
    # - duree_moyenne_poste

    class Config:
        json_schema_extra = {
            "example": {
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
            }
        }


class EngineeredFeatures(BaseModel):
    """Computed features (5 features, computed server-side)."""
    ratio_poste_entreprise: float
    evolution_evaluation: float
    satisfaction_globale: float
    salaire_par_experience: float
    duree_moyenne_poste: float


class PredictionOutput(BaseModel):
    """Output schema for prediction."""

    prediction: int = Field(..., description="Prediction (0=Non, 1=Oui)")
    probability: float = Field(..., ge=0, le=1, description="Probabilite d'attrition")
    risk_level: RiskLevel = Field(..., description="Niveau de risque")
    attrition_label: str = Field(..., description="Label (Oui/Non)")


class PredictionResponse(BaseModel):
    """Full prediction response with metadata."""

    prediction_id: Optional[int] = Field(None, description="ID de la prediction (si sauvegardee)")
    employee_id: Optional[int] = Field(None, description="ID de l'employe (si fourni)")
    result: PredictionOutput
    engineered_features: Optional[EngineeredFeatures] = Field(None, description="Features calculees")
    timestamp: datetime = Field(default_factory=datetime.now)


class BatchPredictionRequest(BaseModel):
    """Request for batch predictions."""

    employees: List[EmployeeInput]


class BatchPredictionResponse(BaseModel):
    """Response for batch predictions."""

    predictions: List[PredictionResponse]
    count: int


class ModelInfo(BaseModel):
    """Model information schema."""

    model_type: str
    export_date: str
    n_features: int
    metrics: dict
    hyperparameters: dict


class HealthCheck(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str
    model_loaded: bool
