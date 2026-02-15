import { useState } from 'react'
import { Send, Loader2, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Shield, TrendingUp } from 'lucide-react'

// Example profiles for different risk levels
const exampleProfiles = {
  highRisk: {
    label: 'Risque Élevé',
    description: 'Susceptible de partir',
    icon: AlertTriangle,
    color: 'red',
    data: {
      genre: 'M',
      statut_marital: 'Celibataire',
      departement: 'Commercial',
      poste: 'Representant Commercial',
      heure_supplementaires: 'Oui',
      augementation_salaire_precedente: '11 %',
      domaine_etude: 'Autre',
      ayant_enfants: 'N',
      frequence_deplacement: 'Frequent',
      age: 28,
      revenu_mensuel: 2500,
      nombre_experiences_precedentes: 4,
      nombre_heures_travailless: 90,
      annee_experience_totale: 5,
      annees_dans_l_entreprise: 2,
      annees_dans_le_poste_actuel: 2,
      satisfaction_employee_environnement: 1,
      note_evaluation_precedente: 3,
      niveau_hierarchique_poste: 1,
      satisfaction_employee_nature_travail: 2,
      satisfaction_employee_equipe: 2,
      satisfaction_employee_equilibre_pro_perso: 1,
      note_evaluation_actuelle: 2,
      nombre_participation_pee: 0,
      nb_formations_suivies: 0,
      nombre_employee_sous_responsabilite: 0,
      distance_domicile_travail: 25,
      niveau_education: 3,
      annees_depuis_la_derniere_promotion: 2,
      annes_sous_responsable_actuel: 2
    }
  },
  mediumRisk: {
    label: 'Risque Modéré',
    description: 'Incertain',
    icon: TrendingUp,
    color: 'amber',
    data: {
      genre: 'F',
      statut_marital: 'Marie(e)',
      departement: 'R&D',
      poste: 'Developpeur',
      heure_supplementaires: 'Non',
      augementation_salaire_precedente: '13 %',
      domaine_etude: 'Developpement',
      ayant_enfants: 'Y',
      frequence_deplacement: 'Occasionnel',
      age: 32,
      revenu_mensuel: 4500,
      nombre_experiences_precedentes: 2,
      nombre_heures_travailless: 80,
      annee_experience_totale: 8,
      annees_dans_l_entreprise: 4,
      annees_dans_le_poste_actuel: 2,
      satisfaction_employee_environnement: 3,
      note_evaluation_precedente: 3,
      niveau_hierarchique_poste: 2,
      satisfaction_employee_nature_travail: 3,
      satisfaction_employee_equipe: 3,
      satisfaction_employee_equilibre_pro_perso: 3,
      note_evaluation_actuelle: 3,
      nombre_participation_pee: 1,
      nb_formations_suivies: 2,
      nombre_employee_sous_responsabilite: 0,
      distance_domicile_travail: 15,
      niveau_education: 4,
      annees_depuis_la_derniere_promotion: 2,
      annes_sous_responsable_actuel: 3
    }
  },
  lowRisk: {
    label: 'Risque Faible',
    description: 'Susceptible de rester',
    icon: Shield,
    color: 'emerald',
    data: {
      genre: 'M',
      statut_marital: 'Marie(e)',
      departement: 'R&D',
      poste: 'Senior Manager',
      heure_supplementaires: 'Non',
      augementation_salaire_precedente: '18 %',
      domaine_etude: 'Data & IA',
      ayant_enfants: 'Y',
      frequence_deplacement: 'Aucun',
      age: 42,
      revenu_mensuel: 12000,
      nombre_experiences_precedentes: 2,
      nombre_heures_travailless: 75,
      annee_experience_totale: 18,
      annees_dans_l_entreprise: 10,
      annees_dans_le_poste_actuel: 4,
      satisfaction_employee_environnement: 4,
      note_evaluation_precedente: 4,
      niveau_hierarchique_poste: 4,
      satisfaction_employee_nature_travail: 5,
      satisfaction_employee_equipe: 4,
      satisfaction_employee_equilibre_pro_perso: 4,
      note_evaluation_actuelle: 5,
      nombre_participation_pee: 3,
      nb_formations_suivies: 6,
      nombre_employee_sous_responsabilite: 5,
      distance_domicile_travail: 8,
      niveau_education: 5,
      annees_depuis_la_derniere_promotion: 1,
      annes_sous_responsable_actuel: 2
    }
  }
}

// Only RAW features - engineered features are computed server-side
const defaultEmployee = {
  // Categorical
  genre: 'M',
  statut_marital: 'Marie(e)',
  departement: 'Commercial',
  poste: 'Representant Commercial',
  heure_supplementaires: 'Non',
  augementation_salaire_precedente: '13 %',  // String format as expected by model
  domaine_etude: 'Infra & Cloud',
  ayant_enfants: 'Y',
  frequence_deplacement: 'Occasionnel',
  // Numerical
  age: 35,
  revenu_mensuel: 5000,
  nombre_experiences_precedentes: 2,
  nombre_heures_travailless: 80,
  annee_experience_totale: 10,
  annees_dans_l_entreprise: 5,
  annees_dans_le_poste_actuel: 3,
  satisfaction_employee_environnement: 3,
  note_evaluation_precedente: 3,
  niveau_hierarchique_poste: 2,
  satisfaction_employee_nature_travail: 4,
  satisfaction_employee_equipe: 3,
  satisfaction_employee_equilibre_pro_perso: 3,
  note_evaluation_actuelle: 4,
  nombre_participation_pee: 1,
  nb_formations_suivies: 3,
  nombre_employee_sous_responsabilite: 0,
  distance_domicile_travail: 10,
  niveau_education: 3,
  annees_depuis_la_derniere_promotion: 1,
  annes_sous_responsable_actuel: 3
}

const selectOptions = {
  genre: ['M', 'F'],
  statut_marital: ['Celibataire', 'Marie(e)', 'Divorce(e)'],
  departement: ['Commercial', 'Consulting', 'R&D', 'RH'],
  poste: ['Representant Commercial', 'Assistant de Direction', 'Senior Manager', 'Consultant', 'Developpeur'],
  heure_supplementaires: ['Oui', 'Non'],
  domaine_etude: ['Infra & Cloud', 'Data & IA', 'Developpement', 'Gestion de Projet', 'Autre'],
  ayant_enfants: ['Y', 'N'],
  frequence_deplacement: ['Aucun', 'Occasionnel', 'Frequent'],
  augementation_salaire_precedente: ['11 %', '12 %', '13 %', '14 %', '15 %', '16 %', '17 %', '18 %', '19 %', '20 %', '21 %', '22 %', '23 %', '24 %', '25 %']
}

const fieldGroups = [
  {
    title: 'Informations Personnelles',
    icon: '👤',
    fields: ['genre', 'age', 'statut_marital', 'ayant_enfants', 'niveau_education', 'domaine_etude']
  },
  {
    title: 'Poste & Carrière',
    icon: '💼',
    fields: ['departement', 'poste', 'niveau_hierarchique_poste', 'revenu_mensuel', 'annee_experience_totale', 'nombre_experiences_precedentes']
  },
  {
    title: 'Ancienneté',
    icon: '🏢',
    fields: ['annees_dans_l_entreprise', 'annees_dans_le_poste_actuel', 'annees_depuis_la_derniere_promotion', 'annes_sous_responsable_actuel']
  },
  {
    title: 'Conditions de Travail',
    icon: '⚙️',
    fields: ['heure_supplementaires', 'nombre_heures_travailless', 'frequence_deplacement', 'distance_domicile_travail', 'nombre_employee_sous_responsabilite']
  },
  {
    title: 'Satisfaction & Évaluation',
    icon: '📊',
    fields: ['satisfaction_employee_environnement', 'satisfaction_employee_nature_travail', 'satisfaction_employee_equipe', 'satisfaction_employee_equilibre_pro_perso', 'note_evaluation_precedente', 'note_evaluation_actuelle']
  },
  {
    title: 'Rémunération & Formation',
    icon: '📋',
    fields: ['augementation_salaire_precedente', 'nombre_participation_pee', 'nb_formations_suivies']
  }
]

const fieldLabels = {
  genre: 'Genre',
  age: 'Âge',
  statut_marital: 'Statut Marital',
  ayant_enfants: 'Enfants',
  niveau_education: 'Niveau Éducation (1-5)',
  domaine_etude: "Domaine d'Étude",
  departement: 'Département',
  poste: 'Poste',
  niveau_hierarchique_poste: 'Niveau Hiérarchique (1-5)',
  revenu_mensuel: 'Salaire Mensuel (€)',
  annee_experience_totale: 'Expérience Totale (ans)',
  nombre_experiences_precedentes: 'Expériences Précédentes',
  annees_dans_l_entreprise: "Années dans l'Entreprise",
  annees_dans_le_poste_actuel: 'Années au Poste Actuel',
  annees_depuis_la_derniere_promotion: 'Années Depuis Promotion',
  annes_sous_responsable_actuel: 'Années Sous Manager Actuel',
  heure_supplementaires: 'Heures Supplémentaires',
  nombre_heures_travailless: 'Heures Travaillées/Mois',
  frequence_deplacement: 'Fréquence Déplacements',
  distance_domicile_travail: 'Distance Domicile-Travail (km)',
  nombre_employee_sous_responsabilite: 'Employés Sous Responsabilité',
  satisfaction_employee_environnement: 'Satisfaction Environnement (1-5)',
  satisfaction_employee_nature_travail: 'Satisfaction Travail (1-5)',
  satisfaction_employee_equipe: 'Satisfaction Équipe (1-5)',
  satisfaction_employee_equilibre_pro_perso: 'Équilibre Vie Pro/Perso (1-5)',
  note_evaluation_precedente: 'Évaluation Précédente (1-5)',
  note_evaluation_actuelle: 'Évaluation Actuelle (1-5)',
  augementation_salaire_precedente: 'Dernière Augmentation',
  nombre_participation_pee: 'Participations PEE',
  nb_formations_suivies: 'Formations Suivies'
}

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(defaultEmployee)
  const [expandedGroups, setExpandedGroups] = useState(['Informations Personnelles'])
  const [activeProfile, setActiveProfile] = useState(null)

  const loadProfile = (profileKey) => {
    setFormData(exampleProfiles[profileKey].data)
    setActiveProfile(profileKey)
  }

  const toggleGroup = (title) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(g => g !== title)
        : [...prev, title]
    )
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Convert percentage string to decimal before sending
    const dataToSend = {
      ...formData,
      augementation_salaire_precedente: parseFloat(formData.augementation_salaire_precedente) / 100
    }
    onSubmit(dataToSend)
  }

  const renderField = (field) => {
    const isSelect = selectOptions[field]
    const label = fieldLabels[field] || field

    if (isSelect) {
      return (
        <div key={field} className="space-y-1.5">
          <label className="text-slate-400 text-xs font-medium">{label}</label>
          <select
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full glass-input rounded-lg px-3 py-2 text-white text-sm cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2rem' }}
          >
            {selectOptions[field].map(opt => (
              <option key={opt} value={opt} className="bg-slate-900">{opt}</option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div key={field} className="space-y-1.5">
        <label className="text-slate-400 text-xs font-medium">{label}</label>
        <input
          type="number"
          value={formData[field]}
          onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
          className="w-full glass-input rounded-lg px-3 py-2 text-white text-sm"
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Example Profiles */}
      <div className="glass-card rounded-xl p-4">
        <div className="text-slate-400 text-xs font-medium mb-3">Charger un Profil Exemple</div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(exampleProfiles).map(([key, profile]) => {
            const Icon = profile.icon
            const isActive = activeProfile === key
            const colorClasses = {
              red: isActive ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'hover:bg-red-500/10 hover:border-red-500/30',
              amber: isActive ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'hover:bg-amber-500/10 hover:border-amber-500/30',
              emerald: isActive ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'hover:bg-emerald-500/10 hover:border-emerald-500/30'
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => loadProfile(key)}
                className={`p-3 rounded-lg border border-white/10 transition-all cursor-pointer ${colorClasses[profile.color]} ${!isActive && 'text-slate-300'}`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isActive ? '' : 'text-slate-400'}`} />
                <div className="text-xs font-medium">{profile.label}</div>
                <div className="text-[10px] text-slate-500">{profile.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {fieldGroups.map(group => (
        <div key={group.title} className="glass-card rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleGroup(group.title)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-white font-medium text-sm flex items-center gap-2">
              <span className="text-base">{group.icon}</span>
              {group.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{group.fields.length} champs</span>
              {expandedGroups.includes(group.title) ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>
          {expandedGroups.includes(group.title) && (
            <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3 border-t border-white/5">
              {group.fields.map(renderField)}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full glass-button text-white font-semibold py-3.5 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyse en cours...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Prédire le Risque d'Attrition</span>
          </>
        )}
      </button>
    </form>
  )
}
