import { useState, useEffect } from 'react'
import { Brain, BarChart3, Settings, List, RefreshCw, ExternalLink, Zap, Target, TrendingUp, Award } from 'lucide-react'

export default function ModelInfo({ modelInfo, apiUrl }) {
  const [features, setFeatures] = useState(null)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const res = await fetch(`${apiUrl}/model/features`)
      const data = await res.json()
      setFeatures(data)
    } catch (err) {
      console.error('Failed to fetch features:', err)
    }
  }

  if (!modelInfo) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-slate-400">Chargement des informations du modèle...</p>
      </div>
    )
  }

  const metrics = modelInfo.metrics || {}

  const metricCards = [
    { label: 'AUC-ROC', value: metrics.auc_roc, icon: Target, color: 'from-emerald-500 to-teal-500', highlight: true },
    { label: 'F1-Score', value: metrics.f1_score, icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: 'Rappel', value: metrics.recall, icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
    { label: 'Précision', value: metrics.precision, icon: Award, color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Model Overview */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span>Aperçu du Modèle</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-4 border-l-4 border-primary">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Type de Modèle</div>
            <div className="text-white text-xl font-bold">{modelInfo.model_type}</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Features</div>
            <div className="text-white text-xl font-bold">{modelInfo.n_features}</div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Date d'Export</div>
            <div className="text-white text-sm font-mono">
              {new Date(modelInfo.export_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <span>Métriques de Performance</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metricCards.map(metric => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className={`rounded-xl p-4 relative overflow-hidden ${
                  metric.highlight
                    ? `bg-gradient-to-br ${metric.color}`
                    : 'glass-card'
                }`}
              >
                {metric.highlight && (
                  <>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                  </>
                )}
                <div className="relative">
                  <div className={`flex items-center gap-2 text-xs mb-2 ${metric.highlight ? 'text-white/80' : 'text-slate-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {metric.label}
                  </div>
                  <div className={`text-2xl font-bold font-mono ${metric.highlight ? 'text-white' : 'text-white'}`}>
                    {metric.value ? `${(metric.value * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  {/* Mini progress bar */}
                  <div className={`h-1 rounded-full mt-3 ${metric.highlight ? 'bg-white/30' : 'bg-white/10'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        metric.highlight ? 'bg-white' : `bg-gradient-to-r ${metric.color}`
                      }`}
                      style={{ width: `${(metric.value || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Accuracy */}
        <div className="mt-4 glass-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Exactitude Globale</span>
            <span className="text-white font-mono font-bold">
              {metrics.accuracy ? `${(metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500"
              style={{ width: `${(metrics.accuracy || 0) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hyperparameters */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center border border-secondary/30">
            <Settings className="w-5 h-5 text-secondary" />
          </div>
          <span>Hyperparamètres</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(modelInfo.hyperparameters || {}).map(([key, value]) => (
            <div key={key} className="glass-card rounded-xl p-3">
              <div className="text-slate-500 text-xs mb-1">{key}</div>
              <div className="text-white font-mono text-sm truncate">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      {features && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
              <List className="w-5 h-5 text-violet-400" />
            </div>
            <span>Features</span>
            <span className="text-slate-500 text-sm font-normal">({features.total} au total)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorical */}
            <div>
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Catégorielles ({features.categorical?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.categorical?.map(feat => (
                  <span
                    key={feat}
                    className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-violet-300 text-xs font-mono"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Numerical */}
            <div>
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Numériques ({features.numerical?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {features.numerical?.slice(0, 12).map(feat => (
                  <span
                    key={feat}
                    className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-300 text-xs font-mono"
                  >
                    {feat}
                  </span>
                ))}
                {features.numerical?.length > 12 && (
                  <span className="px-2.5 py-1 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-400 text-xs">
                    +{features.numerical.length - 12} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Documentation Link */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Documentation API</h3>
            <p className="text-slate-500 text-sm mt-1">
              Explorer l'API complète avec Swagger UI
            </p>
          </div>
          <a
            href={`${apiUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 glass-button text-white rounded-xl cursor-pointer transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ouvrir Swagger</span>
          </a>
        </div>
      </div>
    </div>
  )
}
