"""
Pytest fixtures for API testing
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db


# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency with test database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_employee_data():
    """Sample valid employee data for testing."""
    return {
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


@pytest.fixture
def high_risk_employee_data():
    """Employee data likely to have high attrition risk."""
    return {
        "genre": "M",
        "statut_marital": "Celibataire",
        "departement": "Commercial",
        "poste": "Representant Commercial",
        "heure_supplementaires": "Oui",  # High risk factor
        "augementation_salaire_precedente": 0.11,  # Low raise
        "domaine_etude": "Marketing",
        "ayant_enfants": "N",
        "frequence_deplacement": "Frequent",  # High risk factor
        "age": 25,  # Young
        "revenu_mensuel": 2500,  # Low salary
        "nombre_experiences_precedentes": 3,
        "nombre_heures_travailless": 80,
        "annee_experience_totale": 3,
        "annees_dans_l_entreprise": 1,  # New employee
        "annees_dans_le_poste_actuel": 1,
        "satisfaction_employee_environnement": 1,  # Low satisfaction
        "note_evaluation_precedente": 3,
        "niveau_hierarchique_poste": 1,
        "satisfaction_employee_nature_travail": 2,
        "satisfaction_employee_equipe": 2,
        "satisfaction_employee_equilibre_pro_perso": 1,  # Low work-life balance
        "note_evaluation_actuelle": 3,
        "nombre_participation_pee": 0,
        "nb_formations_suivies": 1,
        "nombre_employee_sous_responsabilite": 0,
        "distance_domicile_travail": 25,
        "niveau_education": 2,
        "annees_depuis_la_derniere_promotion": 0,
        "annes_sous_responsable_actuel": 1
    }
