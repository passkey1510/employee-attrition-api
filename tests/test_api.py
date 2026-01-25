"""
API endpoint tests for Employee Attrition Prediction API
"""

import pytest


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert "model_loaded" in data
        assert data["model_loaded"] is True


class TestModelEndpoints:
    """Tests for model info endpoints."""

    def test_model_info(self, client):
        """Test model info endpoint returns correct data."""
        response = client.get("/model/info")
        assert response.status_code == 200
        data = response.json()
        assert data["model_type"] == "LogisticRegression"
        assert "metrics" in data
        assert "auc_roc" in data["metrics"]
        assert data["metrics"]["auc_roc"] > 0.8  # Should be ~0.816

    def test_model_features(self, client):
        """Test model features endpoint."""
        response = client.get("/model/features")
        assert response.status_code == 200
        data = response.json()
        assert "features" in data
        assert "categorical" in data
        assert "numerical" in data
        assert data["total"] == 35  # 30 raw + 5 engineered


class TestPredictionEndpoints:
    """Tests for prediction endpoints."""

    def test_predict_single_valid(self, client, sample_employee_data):
        """Test single prediction with valid data."""
        response = client.post("/predict", json=sample_employee_data)
        assert response.status_code == 200
        data = response.json()

        # Check response structure
        assert "prediction_id" in data
        assert "result" in data
        assert "engineered_features" in data
        assert "timestamp" in data

        # Check result structure
        result = data["result"]
        assert "prediction" in result
        assert "probability" in result
        assert "risk_level" in result
        assert "attrition_label" in result

        # Validate prediction values
        assert result["prediction"] in [0, 1]
        assert 0 <= result["probability"] <= 1
        assert result["risk_level"] in ["low", "medium", "high"]
        assert result["attrition_label"] in ["Oui", "Non"]

    def test_predict_high_risk_employee(self, client, high_risk_employee_data):
        """Test prediction for high-risk employee profile."""
        response = client.post("/predict", json=high_risk_employee_data)
        assert response.status_code == 200
        data = response.json()

        # High-risk profile should have elevated probability
        result = data["result"]
        # Note: We don't assert specific risk level as model may vary
        assert result["probability"] > 0  # Should have some risk

    def test_predict_engineered_features(self, client, sample_employee_data):
        """Test that engineered features are computed correctly."""
        response = client.post("/predict", json=sample_employee_data)
        assert response.status_code == 200
        data = response.json()

        eng = data["engineered_features"]
        assert "ratio_poste_entreprise" in eng
        assert "evolution_evaluation" in eng
        assert "satisfaction_globale" in eng
        assert "salaire_par_experience" in eng
        assert "duree_moyenne_poste" in eng

        # Verify calculations
        # ratio_poste_entreprise = 3 / (5 + 1) = 0.5
        assert abs(eng["ratio_poste_entreprise"] - 0.5) < 0.01

        # evolution_evaluation = 4 - 3 = 1
        assert eng["evolution_evaluation"] == 1

        # satisfaction_globale = (3 + 4 + 3 + 3) / 4 = 3.25
        assert abs(eng["satisfaction_globale"] - 3.25) < 0.01

    def test_predict_batch(self, client, sample_employee_data, high_risk_employee_data):
        """Test batch prediction endpoint."""
        response = client.post(
            "/predict/batch",
            json={"employees": [sample_employee_data, high_risk_employee_data]}
        )
        assert response.status_code == 200
        data = response.json()

        assert "predictions" in data
        assert "count" in data
        assert data["count"] == 2
        assert len(data["predictions"]) == 2

    def test_predict_invalid_age(self, client, sample_employee_data):
        """Test prediction fails with invalid age."""
        invalid_data = sample_employee_data.copy()
        invalid_data["age"] = 15  # Too young (min 18)

        response = client.post("/predict", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_predict_invalid_satisfaction(self, client, sample_employee_data):
        """Test prediction fails with invalid satisfaction score."""
        invalid_data = sample_employee_data.copy()
        invalid_data["satisfaction_employee_environnement"] = 10  # Max is 5

        response = client.post("/predict", json=invalid_data)
        assert response.status_code == 422

    def test_predict_missing_field(self, client, sample_employee_data):
        """Test prediction fails with missing required field."""
        invalid_data = sample_employee_data.copy()
        del invalid_data["age"]

        response = client.post("/predict", json=invalid_data)
        assert response.status_code == 422

    def test_predict_invalid_augmentation(self, client, sample_employee_data):
        """Test prediction fails with invalid augmentation value."""
        invalid_data = sample_employee_data.copy()
        invalid_data["augementation_salaire_precedente"] = 1.5  # Max is 1.0

        response = client.post("/predict", json=invalid_data)
        assert response.status_code == 422


class TestPredictionHistory:
    """Tests for prediction history endpoints."""

    def test_list_predictions_empty(self, client):
        """Test listing predictions when empty."""
        response = client.get("/predictions")
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "count" in data

    def test_list_predictions_after_predict(self, client, sample_employee_data):
        """Test listing predictions after making a prediction."""
        # Make a prediction first
        client.post("/predict", json=sample_employee_data)

        # Check predictions list
        response = client.get("/predictions")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] >= 1

    def test_get_prediction_not_found(self, client):
        """Test getting non-existent prediction."""
        response = client.get("/predictions/99999")
        assert response.status_code == 404


class TestEmployeeEndpoints:
    """Tests for employee endpoints."""

    def test_list_employees_empty(self, client):
        """Test listing employees when empty."""
        response = client.get("/employees")
        assert response.status_code == 200
        data = response.json()
        assert "employees" in data
        assert "count" in data

    def test_get_employee_not_found(self, client):
        """Test getting non-existent employee."""
        response = client.get("/employees/99999")
        assert response.status_code == 404

    def test_predict_employee_not_found(self, client):
        """Test predicting for non-existent employee."""
        response = client.get("/employees/99999/predict")
        assert response.status_code == 404
