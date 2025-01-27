"""
ML Model loading and prediction
"""

import joblib
import json
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List

# Paths
BASE_PATH = Path(__file__).parent.parent
MODEL_PATH = BASE_PATH / "models" / "lr_pipeline.pkl"
FEATURES_PATH = BASE_PATH / "models" / "features.json"
METADATA_PATH = BASE_PATH / "models" / "model_metadata.json"


class AttritionModel:
    """Wrapper for the trained attrition prediction model."""

    def __init__(self):
        self.model = None
        self.features_info = None
        self.metadata = None
        self._load_model()
        self._load_features()
        self._load_metadata()

    def _load_model(self):
        """Load the trained pipeline."""
        if MODEL_PATH.exists():
            self.model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    def _load_features(self):
        """Load feature information."""
        if FEATURES_PATH.exists():
            with open(FEATURES_PATH, 'r') as f:
                self.features_info = json.load(f)
        else:
            raise FileNotFoundError(f"Features file not found at {FEATURES_PATH}")

    def _load_metadata(self):
        """Load model metadata."""
        if METADATA_PATH.exists():
            with open(METADATA_PATH, 'r') as f:
                self.metadata = json.load(f)

    @property
    def feature_names(self) -> List[str]:
        """Get list of feature names."""
        return self.features_info.get('features', [])

    @property
    def categorical_features(self) -> List[str]:
        """Get list of categorical feature names."""
        return self.features_info.get('categorical_features', [])

    @property
    def numerical_features(self) -> List[str]:
        """Get list of numerical feature names."""
        return self.features_info.get('numerical_features', [])

    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a single prediction.

        Args:
            data: Dictionary with feature values

        Returns:
            Dictionary with prediction, probability, and risk level
        """
        # Create DataFrame with correct column order
        df = pd.DataFrame([data])

        # Ensure columns are in the right order
        df = df[self.feature_names]

        # Get prediction and probability
        prediction = int(self.model.predict(df)[0])
        probability = float(self.model.predict_proba(df)[0][1])

        # Determine risk level (conservative thresholds to reduce false negatives)
        # Baseline attrition is ~16%, so even 20% is above average
        # FN (missed departures) are more costly than FP (extra HR meetings)
        if probability < 0.20:
            risk_level = "low"
        elif probability < 0.45:
            risk_level = "medium"
        else:
            risk_level = "high"

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "risk_level": risk_level,
            "attrition_label": "Oui" if prediction == 1 else "Non"
        }

    def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Make batch predictions.

        Args:
            data_list: List of dictionaries with feature values

        Returns:
            List of prediction results
        """
        return [self.predict(data) for data in data_list]

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information and metrics."""
        return {
            "model_type": self.metadata.get("model_type", "LogisticRegression"),
            "export_date": self.metadata.get("export_date", "unknown"),
            "n_features": len(self.feature_names),
            "metrics": self.metadata.get("metrics", {}),
            "hyperparameters": self.metadata.get("hyperparameters", {})
        }


# Singleton instance
_model_instance = None


def get_model() -> AttritionModel:
    """Get the model instance (singleton pattern)."""
    global _model_instance
    if _model_instance is None:
        _model_instance = AttritionModel()
    return _model_instance
