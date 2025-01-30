"""
Tests for ML model and feature engineering modules
"""

import pytest
from app.model import get_model, AttritionModel
from app.feature_engineering import FeatureEngineer, feature_engineer


class TestAttritionModel:
    """Tests for the AttritionModel class."""

    def test_model_loads_successfully(self):
        """Test that model loads without errors."""
        model = get_model()
        assert model is not None
        assert model.model is not None

    def test_model_singleton(self):
        """Test that get_model returns singleton instance."""
        model1 = get_model()
        model2 = get_model()
        assert model1 is model2

    def test_model_has_features(self):
        """Test that model has feature names."""
        model = get_model()
        assert len(model.feature_names) > 0
        assert len(model.categorical_features) > 0
        assert len(model.numerical_features) > 0

    def test_model_feature_count(self):
        """Test correct number of features."""
        model = get_model()
        # 30 raw + 5 engineered = 35 features
        assert len(model.feature_names) == 35

    def test_model_predict_returns_valid_structure(self):
        """Test that prediction returns correct structure."""
        model = get_model()

        # Create sample data with all required features
        sample_data = {
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
            "annes_sous_responsable_actuel": 3,
            # Engineered features
            "ratio_poste_entreprise": 0.5,
            "evolution_evaluation": 1,
            "satisfaction_globale": 3.25,
            "salaire_par_experience": 454.55,
            "duree_moyenne_poste": 3.33,
        }

        result = model.predict(sample_data)

        assert "prediction" in result
        assert "probability" in result
        assert "risk_level" in result
        assert "attrition_label" in result

    def test_model_predict_valid_values(self):
        """Test that prediction returns valid values."""
        model = get_model()

        sample_data = {
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
            "annes_sous_responsable_actuel": 3,
            "ratio_poste_entreprise": 0.5,
            "evolution_evaluation": 1,
            "satisfaction_globale": 3.25,
            "salaire_par_experience": 454.55,
            "duree_moyenne_poste": 3.33,
        }

        result = model.predict(sample_data)

        assert result["prediction"] in [0, 1]
        assert 0 <= result["probability"] <= 1
        assert result["risk_level"] in ["low", "medium", "high"]
        assert result["attrition_label"] in ["Oui", "Non"]

    def test_model_info(self):
        """Test that model info returns correct data."""
        model = get_model()
        info = model.get_model_info()

        assert info["model_type"] == "LogisticRegression"
        assert "export_date" in info
        assert "n_features" in info
        assert "metrics" in info
        assert "hyperparameters" in info


class TestFeatureEngineer:
    """Tests for the FeatureEngineer class."""

    def test_compute_ratio_poste_entreprise(self):
        """Test ratio_poste_entreprise calculation."""
        data = {
            "annees_dans_le_poste_actuel": 3,
            "annees_dans_l_entreprise": 5
        }
        result = FeatureEngineer.compute_ratio_poste_entreprise(data)
        # 3 / (5 + 1) = 0.5
        assert abs(result - 0.5) < 0.01

    def test_compute_ratio_poste_entreprise_zero_tenure(self):
        """Test ratio when employee is new."""
        data = {
            "annees_dans_le_poste_actuel": 0,
            "annees_dans_l_entreprise": 0
        }
        result = FeatureEngineer.compute_ratio_poste_entreprise(data)
        # 0 / (0 + 1) = 0
        assert result == 0

    def test_compute_evolution_evaluation(self):
        """Test evolution_evaluation calculation."""
        data = {
            "note_evaluation_actuelle": 4,
            "note_evaluation_precedente": 3
        }
        result = FeatureEngineer.compute_evolution_evaluation(data)
        assert result == 1

    def test_compute_evolution_evaluation_negative(self):
        """Test negative evolution (decline in performance)."""
        data = {
            "note_evaluation_actuelle": 2,
            "note_evaluation_precedente": 4
        }
        result = FeatureEngineer.compute_evolution_evaluation(data)
        assert result == -2

    def test_compute_satisfaction_globale(self):
        """Test satisfaction_globale calculation."""
        data = {
            "satisfaction_employee_environnement": 3,
            "satisfaction_employee_nature_travail": 4,
            "satisfaction_employee_equipe": 3,
            "satisfaction_employee_equilibre_pro_perso": 2
        }
        result = FeatureEngineer.compute_satisfaction_globale(data)
        # (3 + 4 + 3 + 2) / 4 = 3.0
        assert abs(result - 3.0) < 0.01

    def test_compute_salaire_par_experience(self):
        """Test salaire_par_experience calculation."""
        data = {
            "revenu_mensuel": 5000,
            "annee_experience_totale": 10
        }
        result = FeatureEngineer.compute_salaire_par_experience(data)
        # 5000 / (10 + 1) = 454.545...
        assert abs(result - 454.545) < 1

    def test_compute_salaire_par_experience_no_experience(self):
        """Test salary ratio for new employee."""
        data = {
            "revenu_mensuel": 3000,
            "annee_experience_totale": 0
        }
        result = FeatureEngineer.compute_salaire_par_experience(data)
        # 3000 / (0 + 1) = 3000
        assert result == 3000

    def test_compute_duree_moyenne_poste(self):
        """Test duree_moyenne_poste calculation."""
        data = {
            "annee_experience_totale": 10,
            "nombre_experiences_precedentes": 3
        }
        result = FeatureEngineer.compute_duree_moyenne_poste(data)
        # 10 / (3 + 1) = 2.5
        assert abs(result - 2.5) < 0.01

    def test_engineer_features_adds_all(self):
        """Test that engineer_features adds all 5 engineered features."""
        raw_data = {
            "genre": "M",
            "age": 35,
            "revenu_mensuel": 5000,
            "annee_experience_totale": 10,
            "annees_dans_l_entreprise": 5,
            "annees_dans_le_poste_actuel": 3,
            "nombre_experiences_precedentes": 2,
            "note_evaluation_actuelle": 4,
            "note_evaluation_precedente": 3,
            "satisfaction_employee_environnement": 3,
            "satisfaction_employee_nature_travail": 4,
            "satisfaction_employee_equipe": 3,
            "satisfaction_employee_equilibre_pro_perso": 3,
        }

        result = feature_engineer.engineer_features(raw_data)

        # Check all engineered features are present
        assert "ratio_poste_entreprise" in result
        assert "evolution_evaluation" in result
        assert "satisfaction_globale" in result
        assert "salaire_par_experience" in result
        assert "duree_moyenne_poste" in result

    def test_engineer_features_preserves_raw(self):
        """Test that engineer_features preserves raw data."""
        raw_data = {
            "genre": "M",
            "age": 35,
            "revenu_mensuel": 5000,
            "annee_experience_totale": 10,
            "annees_dans_l_entreprise": 5,
            "annees_dans_le_poste_actuel": 3,
            "nombre_experiences_precedentes": 2,
            "note_evaluation_actuelle": 4,
            "note_evaluation_precedente": 3,
            "satisfaction_employee_environnement": 3,
            "satisfaction_employee_nature_travail": 4,
            "satisfaction_employee_equipe": 3,
            "satisfaction_employee_equilibre_pro_perso": 3,
        }

        result = feature_engineer.engineer_features(raw_data)

        # Original values preserved
        assert result["genre"] == "M"
        assert result["age"] == 35
        assert result["revenu_mensuel"] == 5000

    def test_engineer_features_does_not_modify_original(self):
        """Test that engineer_features doesn't modify original dict."""
        raw_data = {"age": 35, "revenu_mensuel": 5000}
        original_keys = set(raw_data.keys())

        feature_engineer.engineer_features(raw_data)

        # Original dict unchanged
        assert set(raw_data.keys()) == original_keys
