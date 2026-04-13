import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Upload, FileText, Loader2, ShieldCheck } from 'lucide-react'
import { analyzePolicyDocument } from '../utils/policyApi'
import { formatCurrency, getPolicyById } from '../utils/policyData'

const statusStyles = {
  covered: {
    tile: 'bg-emerald-50 border-emerald-100',
    badge: 'bg-emerald-600 text-white',
    text: 'Covered',
  },
  partial: {
    tile: 'bg-amber-50 border-amber-100',
    badge: 'bg-amber-500 text-white',
    text: 'Partial',
  },
  not: {
    tile: 'bg-rose-50 border-rose-100',
    badge: 'bg-rose-600 text-white',
    text: 'Not covered',
  },
}

const InsurancePolicyDetail = () => {
  const { policyId } = useParams()
  const navigate = useNavigate()
  const [selectedScenario, setSelectedScenario] = useState('hospitalization')
  const [expandedItem, setExpandedItem] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')

  const policy = useMemo(() => getPolicyById(policyId), [policyId])
  const scenario = policy?.scenarios?.[selectedScenario]

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setIsReading(true)
    setAnalysisError('')
    setAnalysisResult(null)

    try {
      const result = await analyzePolicyDocument(file)
      setAnalysisResult(result)
    } catch (error) {
      setAnalysisError('Could not read this document - try a clearer photo or PDF.')
    } finally {
      setIsReading(false)
    }
  }

  if (!policy) {
    return (
      <div className="investments-sip-font min-h-screen bg-[#F8F9FB] px-6 py-6">
        <button type="button" onClick={() => navigate('/insurance')} className="text-indigo-600 text-sm font-bold">Back</button>
        <p className="mt-6 text-slate-700 font-bold">Policy not found.</p>
      </div>
    )
  }

  const showComparison = analysisResult && analysisResult.planName && analysisResult.planName !== policy.name

  return (
    <div className="investments-sip-font min-h-screen bg-[#F8F9FB] px-6 py-6 pb-36">
      <header className="mb-6">
        <button type="button" onClick={() => navigate('/insurance')} className="flex items-center gap-2 text-indigo-600 text-[12px] font-black uppercase">
          <ArrowLeft size={14} />
          Back to feed
        </button>
        <div className="mt-4">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">{policy.category}</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">{policy.name}</h1>
          <p className="text-[12px] text-slate-600 font-semibold mt-1">{policy.insurer}</p>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-[10px] text-slate-500 font-black uppercase">Coverage / maturity</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {formatCurrency(policy.coverageAmount || policy.maturityAmount)}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-[10px] text-slate-500 font-black uppercase">Monthly premium</p>
          <p className="text-sm font-black text-slate-900">{formatCurrency(policy.monthlyPremium)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-[10px] text-slate-500 font-black uppercase">Coverage amount</p>
          <p className="text-sm font-black text-slate-900">{formatCurrency(policy.coverageAmount || policy.maturityAmount)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-[10px] text-slate-500 font-black uppercase">Policy term</p>
          <p className="text-sm font-black text-slate-900">{policy.policyTerm} yr</p>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Coverage breakdown</p>
        <div className="space-y-2">
          {policy.coverageBreakdown.map((item) => {
            const style = statusStyles[item.status]
            const isOpen = expandedItem === item.label
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setExpandedItem(isOpen ? null : item.label)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${style.tile}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wide ${style.badge}`}>
                    {style.text}
                  </span>
                </div>
                {isOpen && (
                  <p className="text-xs text-slate-700 mt-2 font-semibold">{item.note}</p>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Scenario simulator</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(policy.scenarios).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedScenario(key)}
              className={`text-[11px] font-bold rounded-xl border px-2 py-2 ${selectedScenario === key ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
            >
              {value.title}
            </button>
          ))}
        </div>
        {scenario && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <p className="text-[10px] font-black uppercase text-emerald-700">Insurer pays</p>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(scenario.insurerPays)}</p>
            </div>
            <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
              <p className="text-[10px] font-black uppercase text-slate-600">You receive</p>
              <p className="text-lg font-black text-slate-800">{formatCurrency(scenario.youReceive)}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Condition to know</p>
              <p className="text-xs font-semibold text-slate-700">{scenario.condition}</p>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={16} className="text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Upload your current policy</p>
        </div>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl px-4 py-6 text-center bg-slate-50">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-700">Upload your current policy PDF or photo</p>
          <p className="text-xs text-slate-500 mt-1">We read coverage, exclusions, and pricing instantly.</p>
          <label className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#5A5CF0] text-white text-[12px] font-black uppercase tracking-[0.18em] cursor-pointer">
            Upload file
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
          {uploadedFile && (
            <p className="mt-3 text-[11px] text-slate-500 font-semibold">Selected: {uploadedFile.name}</p>
          )}
        </div>

        {(isReading || analysisResult || analysisError) && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            {isReading && (
              <div className="flex items-center gap-3 text-indigo-700 animate-pulse">
                <Loader2 size={18} className="animate-spin" />
                <div>
                  <p className="text-sm font-black">Reading your policy...</p>
                  <p className="text-xs font-semibold">Extracting coverage, exclusions, and waiting periods.</p>
                </div>
              </div>
            )}
            {analysisError && (
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={16} />
                <p className="text-xs font-semibold">{analysisError}</p>
              </div>
            )}
            {analysisResult && (
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">
                    Here's what your policy actually does
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Plan</p>
                    <p className="text-sm font-black text-slate-900">{analysisResult.planName || 'Unknown plan'}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{analysisResult.insurer || 'Unknown insurer'}</p>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Monthly premium</p>
                    <p className="text-sm font-black text-slate-900">
                      {analysisResult.monthlyPremium ? formatCurrency(analysisResult.monthlyPremium) : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Coverage amount</p>
                    <p className="text-sm font-black text-slate-900">
                      {analysisResult.coverageAmount ? formatCurrency(analysisResult.coverageAmount) : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Policy term</p>
                    <p className="text-sm font-black text-slate-900">{analysisResult.policyTerm || '—'}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Top covered</p>
                    <ul className="mt-2 space-y-1">
                      {(analysisResult.topCovered || []).map((item) => (
                        <li key={item} className="text-xs font-semibold text-slate-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Top exclusions</p>
                    <ul className="mt-2 space-y-1">
                      {(analysisResult.topExclusions || []).map((item) => (
                        <li key={item} className="text-xs font-semibold text-slate-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Waiting periods</p>
                    <ul className="mt-2 space-y-1">
                      {(analysisResult.waitingPeriods || []).map((item) => (
                        <li key={item} className="text-xs font-semibold text-slate-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Three things to know</p>
                    <ul className="mt-2 space-y-1">
                      {(analysisResult.threeThingsToKnow || []).map((item) => (
                        <li key={item} className="text-xs font-semibold text-slate-700">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {showComparison && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Your current plan vs this plan
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase">Premium</p>
                        <p className="text-xs font-black text-slate-800">
                          {analysisResult.monthlyPremium ? formatCurrency(analysisResult.monthlyPremium) : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase">Coverage</p>
                        <p className="text-xs font-black text-slate-800">
                          {analysisResult.coverageAmount ? formatCurrency(analysisResult.coverageAmount) : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2">
                        <p className="text-[10px] text-indigo-500 font-black uppercase">This plan</p>
                        <p className="text-xs font-black text-indigo-700">{formatCurrency(policy.coverageAmount || policy.maturityAmount)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="sticky bottom-24">
        <Link
          to="/insurance/habits"
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5A5CF0] text-white py-3 text-[12px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200"
        >
          See all policies that match your daily habits
        </Link>
      </div>
    </div>
  )
}

export default InsurancePolicyDetail
