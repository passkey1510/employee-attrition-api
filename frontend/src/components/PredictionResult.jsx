import { AlertTriangle, CheckCircle, Shield, TrendingUp, Clock, Lightbulb, Calculator } from 'lucide-react'

export default function PredictionResult({ prediction }) {
  const { result, timestamp, engineered_features } = prediction
  const { prediction: pred, probability, risk_level, attrition_label } = result

  const getRiskConfig = () => {
    switch (risk_level) {
      case 'high':
        return {
          icon: AlertTriangle,
          bgClass: 'risk-high',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/20',
          bgLight: 'bg-red-500/10',
          accentColor: '#EF4444',
          label: 'Risque Élevé',
          description: 'Action immédiate recommandée',
          recommendations: [
            'Planifier une réunion RH urgente',
            'Évaluer la charge de travail et le stress',
            'Discuter des opportunités de carrière',
            'Revoir le package de rémunération'
          ]
        }
      case 'medium':
        return {
          icon: TrendingUp,
          bgClass: 'risk-medium',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/20',
          bgLight: 'bg-amber-500/10',
          accentColor: '#F59E0B',
          label: 'Risque Modéré',
          description: 'Surveillance recommandée',
          recommendations: [
            'Planifier des points réguliers',
            'Surveiller la satisfaction au travail',
            'Proposer des formations',
            'Maintenir une communication ouverte'
          ]
        }
      default:
        return {
          icon: Shield,
          bgClass: 'risk-low',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/20',
          bgLight: 'bg-emerald-500/10',
          accentColor: '#10B981',
          label: 'Risque Faible',
          description: 'Employé stable',
          recommendations: [
            'Continuer les bonnes pratiques',
            'Reconnaître les contributions',
            'Maintenir l\'équilibre vie pro/perso',
            'Encourager le développement'
          ]
        }
    }
  }

  const config = getRiskConfig()
  const Icon = config.icon
  const probabilityPercent = (probability * 100).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Main Result Card */}
      <div className={`${config.bgClass} rounded-2xl p-5 text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold block">{config.label}</span>
                <span className="text-white/70 text-sm">{config.description}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">{probabilityPercent}%</div>
            <div className="text-white/60 text-xs">Probabilité d'Attrition</div>
          </div>
        </div>
      </div>

      {/* Probability Gauge */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Risque Faible</span>
          <span>Risque Élevé</span>
        </div>
        <div className="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 transition-all duration-500"
            style={{
              left: `calc(${probability * 100}% - 10px)`,
              borderColor: config.accentColor
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-1.5">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${config.bgLight} ${config.borderColor} border rounded-xl p-3`}>
          <div className="text-slate-500 text-xs mb-1">Prédiction</div>
          <div className={`text-base font-bold ${config.textColor}`}>
            {attrition_label === 'Oui' ? 'Susceptible de Partir' : 'Susceptible de Rester'}
          </div>
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="text-slate-500 text-xs mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Horodatage
          </div>
          <div className="text-white font-mono text-xs">
            {new Date(timestamp).toLocaleString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className={`${config.bgLight} ${config.borderColor} border rounded-xl p-4`}>
        <h3 className={`${config.textColor} font-semibold text-sm mb-3 flex items-center gap-2`}>
          <Lightbulb className="w-4 h-4" />
          Recommandations
        </h3>
        <ul className="space-y-2">
          {config.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm">
              <CheckCircle className={`w-4 h-4 ${config.textColor} mt-0.5 flex-shrink-0`} />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Computed Features (Server-side) */}
      {engineered_features && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            Features Calculées (Côté Serveur)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-slate-500">Ratio Poste/Entreprise</div>
              <div className="text-white font-mono">{engineered_features.ratio_poste_entreprise?.toFixed(2)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-slate-500">Évolution Évaluation</div>
              <div className="text-white font-mono">{engineered_features.evolution_evaluation}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-slate-500">Satisfaction Globale</div>
              <div className="text-white font-mono">{engineered_features.satisfaction_globale?.toFixed(2)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-slate-500">Salaire/Expérience</div>
              <div className="text-white font-mono">{engineered_features.salaire_par_experience?.toFixed(0)} EUR</div>
            </div>
            <div className="col-span-2 bg-white/5 rounded-lg p-2">
              <div className="text-slate-500">Durée Moyenne au Poste</div>
              <div className="text-white font-mono">{engineered_features.duree_moyenne_poste?.toFixed(1)} ans</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
