import { useState, useEffect } from 'react'
import { Users, Search, ChevronLeft, ChevronRight, Play, Loader2, UserCheck, UserX, Database, Filter } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function EmployeeList({ onPredictionResult }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(null)
  const [search, setSearch] = useState('')
  const [datasetFilter, setDatasetFilter] = useState('') // '', 'train', 'test'
  const [page, setPage] = useState(0)
  const [error, setError] = useState(null)
  const limit = 10

  useEffect(() => {
    fetchEmployees()
  }, [page, datasetFilter])

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = `${API_URL}/employees?skip=${page * limit}&limit=${limit}`
      if (datasetFilter) {
        url += `&dataset_type=${datasetFilter}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setEmployees(data.employees || [])
    } catch (err) {
      setError('Échec du chargement des employés')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const predictEmployee = async (employeeId) => {
    setPredicting(employeeId)
    try {
      const res = await fetch(`${API_URL}/employees/${employeeId}/predict`)
      const data = await res.json()
      if (onPredictionResult) {
        onPredictionResult(data, employeeId)
      }
    } catch (err) {
      console.error('Prediction failed:', err)
    } finally {
      setPredicting(null)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.employee_id.toString().includes(search) ||
    emp.departement?.toLowerCase().includes(search.toLowerCase()) ||
    emp.poste?.toLowerCase().includes(search.toLowerCase())
  )

  const getRiskBadge = (attritionActual) => {
    if (attritionActual === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
          <UserX className="w-3 h-3" />
          Parti
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        <UserCheck className="w-3 h-3" />
        Resté
      </span>
    )
  }

  const getDatasetBadge = (datasetType) => {
    if (datasetType === 'train') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
          <Database className="w-3 h-3" />
          Train
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
        <Database className="w-3 h-3" />
        Test
        </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par ID, département, poste..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm"
          />
        </div>

        {/* Dataset Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={datasetFilter}
            onChange={(e) => { setDatasetFilter(e.target.value); setPage(0); }}
            className="glass-input rounded-xl pl-10 pr-8 py-3 text-white text-sm appearance-none cursor-pointer min-w-[140px]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2rem' }}
          >
            <option value="" className="bg-slate-900">Toutes les Données</option>
            <option value="train" className="bg-slate-900">Jeu d'Entraînement</option>
            <option value="test" className="bg-slate-900">Jeu de Test</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-slate-500 text-sm">Chargement des employés...</p>
        </div>
      ) : (
        <>
          {/* Employee Table */}
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left glass-table">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Âge</th>
                  <th className="px-4 py-3 font-medium">Département</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Poste</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Salaire</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    className="group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-white font-mono text-sm bg-white/5 px-2 py-0.5 rounded">
                        #{emp.employee_id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getDatasetBadge(emp.dataset_type)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {emp.age} <span className="text-slate-500">ans</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-300 text-sm">{emp.departement}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-slate-400 text-sm truncate max-w-[150px] block">
                        {emp.poste}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-slate-300 font-mono text-sm">
                        {emp.revenu_mensuel?.toLocaleString()}<span className="text-slate-500">EUR</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getRiskBadge(emp.attrition_actual)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => predictEmployee(emp.employee_id)}
                        disabled={predicting === emp.employee_id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-button text-white text-sm rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {predicting === emp.employee_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span>Prédire</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredEmployees.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm">Aucun employé trouvé</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-slate-500 text-sm">
              Page <span className="text-slate-300 font-medium">{page + 1}</span>
              <span className="mx-2">·</span>
              <span className="text-slate-300">{employees.length}</span> employés
              {datasetFilter && (
                <span className="ml-2 text-slate-400">
                  (jeu {datasetFilter === 'train' ? "d'entraînement" : 'de test'})
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2.5 rounded-lg glass-input hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={employees.length < limit}
                className="p-2.5 rounded-lg glass-input hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
