"""
Feature Engineering Module

Computes derived features from raw employee data.
These formulas replicate the data engineering from Project 4.

Note: 5 features (removed faible_satisfaction and surcharge_travail as redundant)
"""

from typing import Dict, Any


class FeatureEngineer:
    """
    Computes engineered features from raw employee data.

    Engineered features (5):
    - ratio_poste_entreprise: Position tenure ratio
    - evolution_evaluation: Performance evolution
    - satisfaction_globale: Average satisfaction score
    - salaire_par_experience: Salary per experience year
    - duree_moyenne_poste: Average position duration

    Removed (redundant):
    - faible_satisfaction: Threshold of satisfaction_globale (model can learn this)
    - surcharge_travail: Same as heure_supplementaires after one-hot encoding
    """

    SATISFACTION_COLUMNS = [
        'satisfaction_employee_environnement',
        'satisfaction_employee_nature_travail',
        'satisfaction_employee_equipe',
        'satisfaction_employee_equilibre_pro_perso'
    ]

    @staticmethod
    def compute_ratio_poste_entreprise(data: Dict[str, Any]) -> float:
        """
        Ratio of years in current position to years in company.
        Formula: annees_dans_le_poste_actuel / (annees_dans_l_entreprise + 1)
        """
        years_position = data.get('annees_dans_le_poste_actuel', 0)
        years_company = data.get('annees_dans_l_entreprise', 0)
        return years_position / (years_company + 1)

    @staticmethod
    def compute_evolution_evaluation(data: Dict[str, Any]) -> float:
        """
        Difference between current and previous performance ratings.
        Formula: note_evaluation_actuelle - note_evaluation_precedente
        """
        current = data.get('note_evaluation_actuelle', 0)
        previous = data.get('note_evaluation_precedente', 0)
        return current - previous

    @classmethod
    def compute_satisfaction_globale(cls, data: Dict[str, Any]) -> float:
        """
        Average of all satisfaction scores.
        Formula: mean(satisfaction_employee_*)
        """
        scores = [data.get(col, 0) for col in cls.SATISFACTION_COLUMNS]
        return sum(scores) / len(scores)

    @staticmethod
    def compute_salaire_par_experience(data: Dict[str, Any]) -> float:
        """
        Monthly salary per year of experience.
        Formula: revenu_mensuel / (annee_experience_totale + 1)
        """
        salary = data.get('revenu_mensuel', 0)
        experience = data.get('annee_experience_totale', 0)
        return salary / (experience + 1)

    @staticmethod
    def compute_duree_moyenne_poste(data: Dict[str, Any]) -> float:
        """
        Average duration per position.
        Formula: annee_experience_totale / (nombre_experiences_precedentes + 1)
        """
        experience = data.get('annee_experience_totale', 0)
        prev_experiences = data.get('nombre_experiences_precedentes', 0)
        return experience / (prev_experiences + 1)

    @classmethod
    def engineer_features(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add all engineered features to raw employee data.

        Args:
            raw_data: Dictionary with raw employee features

        Returns:
            Dictionary with raw + engineered features (5 new features)
        """
        # Create a copy to avoid modifying original
        data = raw_data.copy()

        # Compute and add engineered features (5 features)
        data['ratio_poste_entreprise'] = cls.compute_ratio_poste_entreprise(data)
        data['evolution_evaluation'] = cls.compute_evolution_evaluation(data)
        data['satisfaction_globale'] = cls.compute_satisfaction_globale(data)
        data['salaire_par_experience'] = cls.compute_salaire_par_experience(data)
        data['duree_moyenne_poste'] = cls.compute_duree_moyenne_poste(data)

        return data


# Singleton instance
feature_engineer = FeatureEngineer()
