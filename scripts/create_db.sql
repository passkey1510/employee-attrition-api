-- Database schema for Employee Attrition Prediction API
-- Project 5 - TechNova Partners
--
-- NOTE: This schema stores RAW employee data only.
-- Engineered features are computed server-side during prediction.

-- Table: employees (raw HR data from P4 test set)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER UNIQUE,
    -- Categorical features
    genre VARCHAR(10),
    statut_marital VARCHAR(50),
    departement VARCHAR(100),
    poste VARCHAR(100),
    heure_supplementaires VARCHAR(10),
    augementation_salaire_precedente FLOAT,
    domaine_etude VARCHAR(100),
    ayant_enfants VARCHAR(10),
    frequence_deplacement VARCHAR(50),
    -- Numerical features
    age INTEGER,
    revenu_mensuel FLOAT,
    nombre_experiences_precedentes INTEGER,
    nombre_heures_travailless INTEGER,
    annee_experience_totale INTEGER,
    annees_dans_l_entreprise INTEGER,
    annees_dans_le_poste_actuel INTEGER,
    satisfaction_employee_environnement INTEGER,
    note_evaluation_precedente INTEGER,
    niveau_hierarchique_poste INTEGER,
    satisfaction_employee_nature_travail INTEGER,
    satisfaction_employee_equipe INTEGER,
    satisfaction_employee_equilibre_pro_perso INTEGER,
    note_evaluation_actuelle INTEGER,
    nombre_participation_pee INTEGER,
    nb_formations_suivies INTEGER,
    nombre_employee_sous_responsabilite INTEGER,
    distance_domicile_travail FLOAT,
    niveau_education INTEGER,
    annees_depuis_la_derniere_promotion INTEGER,
    annes_sous_responsable_actuel INTEGER,
    -- Ground truth (for validation)
    attrition_actual INTEGER,
    -- Dataset flag (train/test)
    dataset_type VARCHAR(10) DEFAULT 'test',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: predictions (log des appels API)
-- Stores input data (raw + computed features) and prediction results
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    input_data JSONB NOT NULL,  -- Contains raw + engineered features
    prediction INTEGER NOT NULL,
    probability FLOAT NOT NULL,
    risk_level VARCHAR(20),
    model_version VARCHAR(50) DEFAULT 'lr_v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_employee_id ON predictions(employee_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);

-- View for prediction statistics
CREATE OR REPLACE VIEW prediction_stats AS
SELECT
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN prediction = 1 THEN 1 END) as attrition_predicted,
    COUNT(CASE WHEN prediction = 0 THEN 1 END) as no_attrition_predicted,
    ROUND(AVG(probability)::numeric, 4) as avg_probability,
    COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
    COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count
FROM predictions;

-- View for employee attrition summary
CREATE OR REPLACE VIEW employee_summary AS
SELECT
    COUNT(*) as total_employees,
    COUNT(CASE WHEN attrition_actual = 1 THEN 1 END) as actual_attrition,
    COUNT(CASE WHEN attrition_actual = 0 THEN 1 END) as actual_stayed,
    ROUND(AVG(age)::numeric, 1) as avg_age,
    ROUND(AVG(revenu_mensuel)::numeric, 0) as avg_salary,
    ROUND(AVG(annees_dans_l_entreprise)::numeric, 1) as avg_tenure
FROM employees;
