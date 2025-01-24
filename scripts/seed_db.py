"""
Seed the database with employee data from CSV

Note: CSV may contain engineered features from P4, but we only store RAW data.
Engineered features are computed on-the-fly during prediction.
"""

import os
import pandas as pd
from sqlalchemy import create_engine, text
from pathlib import Path

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/attrition_db"
)

# Path to CSV
CSV_PATH = Path(__file__).parent.parent / "data" / "employees.csv"

# Engineered features to drop (computed on-the-fly in API)
ENGINEERED_FEATURES = [
    'ratio_poste_entreprise',
    'evolution_evaluation',
    'satisfaction_globale',
    'salaire_par_experience',
    'duree_moyenne_poste',
    # These were removed as redundant but might still be in old CSVs
    'faible_satisfaction',
    'surcharge_travail',
]


def seed_employees():
    """Load employees from CSV into PostgreSQL."""
    print(f"Connecting to database...")
    engine = create_engine(DATABASE_URL)

    print(f"Reading CSV from {CSV_PATH}...")
    if not CSV_PATH.exists():
        print(f"ERROR: CSV file not found at {CSV_PATH}")
        return False

    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} employees from CSV")

    # Drop engineered features (stored in CSV but computed on-the-fly in API)
    cols_to_drop = [col for col in ENGINEERED_FEATURES if col in df.columns]
    if cols_to_drop:
        print(f"Dropping engineered features: {cols_to_drop}")
        df = df.drop(columns=cols_to_drop)

    # Check if data already exists
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM employees"))
        count = result.scalar()
        if count > 0:
            print(f"Database already contains {count} employees. Skipping seed.")
            return True

    # Insert data
    print("Inserting employees into database...")
    df.to_sql(
        "employees",
        engine,
        if_exists="append",
        index=False,
        method="multi"
    )

    # Verify
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM employees"))
        count = result.scalar()
        print(f"Successfully inserted {count} employees")

    return True


if __name__ == "__main__":
    success = seed_employees()
    exit(0 if success else 1)
