"""
Database connection and models for PostgreSQL

NOTE: This schema stores RAW employee data only.
Engineered features are computed server-side during prediction.
"""

import os
from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/attrition_db"
)

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Employee(Base):
    """
    Employee table model - stores RAW HR data only.
    Engineered features are computed on-the-fly during prediction.
    """
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, unique=True, index=True)

    # Categorical features
    genre = Column(String(10))
    statut_marital = Column(String(50))
    departement = Column(String(100))
    poste = Column(String(100))
    heure_supplementaires = Column(String(10))
    augementation_salaire_precedente = Column(Float)
    domaine_etude = Column(String(100))
    ayant_enfants = Column(String(10))
    frequence_deplacement = Column(String(50))

    # Numerical features
    age = Column(Integer)
    revenu_mensuel = Column(Float)
    nombre_experiences_precedentes = Column(Integer)
    nombre_heures_travailless = Column(Integer)
    annee_experience_totale = Column(Integer)
    annees_dans_l_entreprise = Column(Integer)
    annees_dans_le_poste_actuel = Column(Integer)
    satisfaction_employee_environnement = Column(Integer)
    note_evaluation_precedente = Column(Integer)
    niveau_hierarchique_poste = Column(Integer)
    satisfaction_employee_nature_travail = Column(Integer)
    satisfaction_employee_equipe = Column(Integer)
    satisfaction_employee_equilibre_pro_perso = Column(Integer)
    note_evaluation_actuelle = Column(Integer)
    nombre_participation_pee = Column(Integer)
    nb_formations_suivies = Column(Integer)
    nombre_employee_sous_responsabilite = Column(Integer)
    distance_domicile_travail = Column(Float)
    niveau_education = Column(Integer)
    annees_depuis_la_derniere_promotion = Column(Integer)
    annes_sous_responsable_actuel = Column(Integer)

    # Ground truth (for validation)
    attrition_actual = Column(Integer)
    # Dataset flag (train/test)
    dataset_type = Column(String(10), default='test')
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    """
    Prediction log table model.
    Stores input data (raw + computed features) and prediction results.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True)
    input_data = Column(JSON, nullable=False)  # Contains raw + engineered features
    prediction = Column(Integer, nullable=False)
    probability = Column(Float, nullable=False)
    risk_level = Column(String(20))
    model_version = Column(String(50), default="lr_v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def log_prediction(
    db: Session,
    input_data: dict,
    prediction: int,
    probability: float,
    risk_level: str,
    employee_id: Optional[int] = None
) -> Prediction:
    """Log a prediction to the database."""
    db_prediction = Prediction(
        employee_id=employee_id,
        input_data=input_data,
        prediction=prediction,
        probability=probability,
        risk_level=risk_level
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


def get_employee_by_id(db: Session, employee_id: int) -> Optional[Employee]:
    """Get an employee by their ID."""
    return db.query(Employee).filter(Employee.employee_id == employee_id).first()


def get_employees(db: Session, skip: int = 0, limit: int = 100, dataset_type: Optional[str] = None):
    """Get a list of employees with optional filtering by dataset_type."""
    query = db.query(Employee)
    if dataset_type:
        query = query.filter(Employee.dataset_type == dataset_type)
    return query.offset(skip).limit(limit).all()


def get_predictions(db: Session, skip: int = 0, limit: int = 100):
    """Get a list of predictions."""
    return db.query(Prediction).order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()
