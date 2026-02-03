import { useState, useEffect } from 'react'
import { Activity, Users, Brain, Database, AlertTriangle, CheckCircle, XCircle, Info, Send, Loader2, Sparkles } from 'lucide-react'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import ModelInfo from './components/ModelInfo'
import EmployeeList from './components/EmployeeList'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [activeTab, setActiveTab] = useState('employees')
  const [modelInfo, setModelInfo] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    checkApiHealth()
    fetchModelInfo()
  }, [])

  const checkApiHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`)
      const data = await res.json()
      setApiStatus(data.status === 'healthy' ? 'connected' : 'degraded')
    } catch (err) {
      setApiStatus('disconnected')
    }
  }

  const fetchModelInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/model/info`)
      const data = await res.json()
      setModelInfo(data)
    } catch (err) {
      console.error('Failed to fetch model info:', err)
    }
  }

  const handlePredict = async (employeeData) => {
    setLoading(true)
    setError(null)
    setPrediction(null)
    setSelectedEmployeeId(null)

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      })

      if (!res.ok) {
        const errData = await res.json()
        let errorMessage = 'Prediction failed'

        if (Array.isArray(errData.detail)) {
          // Validation errors from FastAPI/Pydantic
          errorMessage = errData.detail
            .map(err => `${err.loc?.slice(1).join(' → ') || 'Field'}: ${err.msg}`)
            .join('\n')
        } else if (typeof errData.detail === 'string') {
          errorMessage = errData.detail
        } else if (errData.message) {
          errorMessage = errData.message
        }

        throw new Error(errorMessage)
      }

      const data = await res.json()
      setPrediction(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeePrediction = (predictionData, employeeId) => {
    setPrediction(predictionData)
    setSelectedEmployeeId(employeeId)
    setError(null)
  }

  const tabs = [
    { id: 'employees', label: 'Employés', icon: Database },
    { id: 'predict', label: 'Saisie Manuelle', icon: Activity },
    { id: 'model', label: 'Info Modèle', icon: Info },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="bg-animated" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <header className="max-w-[1800px] mx-auto mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    <span className="gradient-text">Attrition Predictor</span>
                  </h1>
                  <p className="text-slate-400 text-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    TechNova Partners - HR Analytics
                  </p>
                </div>
              </div>

              {/* API Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                apiStatus === 'connected' ? 'status-connected' :
                apiStatus === 'degraded' ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400' :
                apiStatus === 'checking' ? 'status-checking' :
                'status-disconnected'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected' ? 'bg-emerald-400' :
                  apiStatus === 'degraded' ? 'bg-yellow-400' :
                  apiStatus === 'checking' ? 'bg-blue-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                {apiStatus === 'connected' ? 'API Connectée' :
                 apiStatus === 'degraded' ? 'API Dégradée' :
                 apiStatus === 'checking' ? 'Vérification...' :
                 'API Déconnectée'}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="max-w-[1800px] mx-auto mb-6">
          <div className="glass rounded-xl p-1.5 inline-flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'glass-button text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-[1800px] mx-auto">
          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee List */}
              <div className="lg:col-span-2 glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <span>Base de Données Employés</span>
                </h2>
                <EmployeeList onPredictionResult={handleEmployeePrediction} />
              </div>

              {/* Prediction Result */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
                    <Activity className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span>Résultat de Prédiction</span>
                    {selectedEmployeeId && (
                      <span className="block text-sm font-normal text-slate-400">
                        Employé #{selectedEmployeeId}
                      </span>
                    )}
                  </div>
                </h2>

                {!prediction && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-center text-sm">
                      Sélectionnez un employé et cliquez<br />
                      <span className="text-primary font-medium">"Prédire"</span> pour voir les résultats
                    </p>
                  </div>
                )}

                {prediction && (
                  <PredictionResult prediction={prediction} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'predict' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center border border-secondary/30">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <span>Saisie Manuelle Employé</span>
                </h2>
                <PredictionForm onSubmit={handlePredict} loading={loading} />
              </div>

              {/* Results */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center border border-accent/30">
                    <Activity className="w-5 h-5 text-accent" />
                  </div>
                  <span>Résultat de Prédiction</span>
                </h2>

                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse-glow">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <p className="text-sm">Analyse des données employé...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-400 font-medium">Erreur de Prédiction</p>
                      <p className="text-red-300/70 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && !prediction && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Brain className="w-10 h-10 opacity-30" />
                    </div>
                    <p className="text-center text-sm">
                      Remplissez les données et cliquez<br />
                      <span className="text-primary font-medium">"Prédire le Risque d'Attrition"</span>
                    </p>
                  </div>
                )}

                {prediction && !loading && (
                  <PredictionResult prediction={prediction} />
                )}
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <ModelInfo modelInfo={modelInfo} apiUrl={API_URL} />
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-[1800px] mx-auto mt-12 text-center">
          <div className="glass rounded-xl px-6 py-4 inline-block">
            <p className="text-slate-400 text-sm">
              API de Prédiction d'Attrition - <span className="text-primary">Projet 5</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Modèle : <span className="font-mono text-slate-400">LogisticRegression</span> | AUC-ROC : <span className="text-emerald-400 font-mono">80.8%</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
