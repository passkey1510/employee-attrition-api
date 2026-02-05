/**
 * Translate Pydantic/FastAPI validation error messages to French
 */

// Field name translations
const fieldTranslations = {
  'genre': 'Genre',
  'statut_marital': 'Statut marital',
  'departement': 'Département',
  'poste': 'Poste',
  'heure_supplementaires': 'Heures supplémentaires',
  'augementation_salaire_precedente': 'Augmentation salaire',
  'domaine_etude': "Domaine d'étude",
  'ayant_enfants': 'Ayant enfants',
  'frequence_deplacement': 'Fréquence déplacement',
  'age': 'Âge',
  'revenu_mensuel': 'Revenu mensuel',
  'nombre_experiences_precedentes': 'Expériences précédentes',
  'nombre_heures_travailless': 'Heures travaillées',
  'annee_experience_totale': 'Expérience totale',
  'annees_dans_l_entreprise': "Années dans l'entreprise",
  'annees_dans_le_poste_actuel': 'Années dans le poste',
  'satisfaction_employee_environnement': 'Satisfaction environnement',
  'note_evaluation_precedente': 'Évaluation précédente',
  'niveau_hierarchique_poste': 'Niveau hiérarchique',
  'satisfaction_employee_nature_travail': 'Satisfaction travail',
  'satisfaction_employee_equipe': 'Satisfaction équipe',
  'satisfaction_employee_equilibre_pro_perso': 'Équilibre pro/perso',
  'note_evaluation_actuelle': 'Évaluation actuelle',
  'nombre_participation_pee': 'Participations PEE',
  'nb_formations_suivies': 'Formations suivies',
  'nombre_employee_sous_responsabilite': 'Employés supervisés',
  'distance_domicile_travail': 'Distance domicile-travail',
  'niveau_education': "Niveau d'éducation",
  'annees_depuis_la_derniere_promotion': 'Années depuis promotion',
  'annes_sous_responsable_actuel': 'Années sous responsable'
}

// Error message pattern translations
const errorPatterns = [
  { pattern: /Input should be greater than or equal to (\d+)/i, replacement: 'Doit être supérieur ou égal à $1' },
  { pattern: /Input should be less than or equal to (\d+)/i, replacement: 'Doit être inférieur ou égal à $1' },
  { pattern: /Input should be a valid integer/i, replacement: 'Doit être un nombre entier' },
  { pattern: /Input should be a valid number/i, replacement: 'Doit être un nombre valide' },
  { pattern: /Input should be a valid string/i, replacement: 'Doit être une chaîne de caractères' },
  { pattern: /Field required/i, replacement: 'Champ requis' },
  { pattern: /value is not a valid integer/i, replacement: 'Valeur entière non valide' },
  { pattern: /value is not a valid float/i, replacement: 'Valeur numérique non valide' },
  { pattern: /none is not an allowed value/i, replacement: 'La valeur ne peut pas être vide' },
  { pattern: /ensure this value is greater than or equal to (\d+)/i, replacement: 'La valeur doit être >= $1' },
  { pattern: /ensure this value is less than or equal to (\d+)/i, replacement: 'La valeur doit être <= $1' },
  { pattern: /string does not match regex/i, replacement: 'Format invalide' },
  { pattern: /value could not be parsed to a boolean/i, replacement: 'Valeur booléenne non valide' },
  { pattern: /Prediction failed/i, replacement: 'Échec de la prédiction' },
]

/**
 * Translate a field name to French
 */
export function translateFieldName(fieldName) {
  return fieldTranslations[fieldName] || fieldName
}

/**
 * Translate an error message to French
 */
export function translateErrorMessage(message) {
  let translated = message

  for (const { pattern, replacement } of errorPatterns) {
    if (pattern.test(translated)) {
      translated = translated.replace(pattern, replacement)
      break
    }
  }

  return translated
}

/**
 * Parse and translate FastAPI/Pydantic validation errors
 */
export function parseValidationErrors(errData) {
  if (Array.isArray(errData.detail)) {
    return errData.detail
      .map(err => {
        const fieldPath = err.loc?.slice(1) || []
        const fieldName = fieldPath.map(f => translateFieldName(f)).join(' → ') || 'Champ'
        const message = translateErrorMessage(err.msg)
        return `${fieldName}: ${message}`
      })
      .join('\n')
  }

  if (typeof errData.detail === 'string') {
    return translateErrorMessage(errData.detail)
  }

  if (errData.message) {
    return translateErrorMessage(errData.message)
  }

  return 'Échec de la prédiction'
}
