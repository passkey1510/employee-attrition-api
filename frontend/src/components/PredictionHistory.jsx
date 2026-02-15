import { useState, useEffect } from 'react'
import { Loader2, Clock, AlertTriangle, Shield, TrendingUp, RefreshCw } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const riskConfig = {
  high: { label: 'Élevé', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  medium: { label: 'Modéré', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  low: { label: 'Faible', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
}

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const limit = 20

  const fetchPredictions = async (skip = 0) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/predictions?skip=${skip}&limit=${limit}`)
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const data = await res.json()
      setPredictions(data.predictions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions(page * limit)
  }, [page])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm">Chargement de l'historique...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">
          {predictions.length} prédiction{predictions.length > 1 ? 's' : ''}
          {page > 0 && ` (page ${page + 1})`}
        </p>
        <button
          onClick={() => fetchPredictions(page * limit)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rafraîchir
        </button>
      </div>

      {/* Table */}
      {predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Clock className="w-10 h-10 opacity-30 mb-4" />
          <p className="text-sm">Aucune prédiction enregistrée</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">ID</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Employé</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Risque</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Probabilité</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Prédiction</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => {
                const risk = riskConfig[p.risk_level] || riskConfig.low
                const Icon = risk.icon
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-slate-300 font-mono">#{p.id}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {p.employee_id ? `#${p.employee_id}` : <span className="text-slate-500 italic">Manuel</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${risk.bg}`}>
                        <Icon className={`w-3 h-3 ${risk.color}`} />
                        <span className={risk.color}>{risk.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono ${risk.color}`}>
                        {(p.probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={p.prediction === 1 ? 'text-red-400' : 'text-emerald-400'}>
                        {p.prediction === 1 ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-xs">{formatDate(p.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        <span className="text-slate-500 text-sm">Page {page + 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={predictions.length < limit}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>
      </div>
    </div>
  )
}
