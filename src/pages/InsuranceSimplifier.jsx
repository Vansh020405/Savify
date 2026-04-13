import { useMemo, useState, useEffect } from 'react'
import { TriangleAlert, CircleDollarSign, Sparkles, Upload, FileText, Loader2 } from 'lucide-react'

const policy = {
  name: 'Health Secure Plus',
  monthlyPremium: 1240,
  coverageAmount: 500000,
}

const coverageItems = [
  { label: 'Hospitalization', status: 'covered', note: 'Room + treatment covered' },
  { label: 'Accident Care', status: 'covered', note: 'Emergency support included' },
  { label: 'Pre-existing Disease', status: 'partial', note: 'Covered after waiting period' },
  { label: 'Maternity', status: 'partial', note: 'Limited sub-limit applies' },
  { label: 'Dental', status: 'not', note: 'Not covered in this plan' },
]

const exclusions = [
  'Dental procedures are excluded unless due to severe accidental injury.',
  'Pre-existing conditions are not claimable during first 24 months.',
  'Consumables (gloves, masks, kits) are paid by you.',
]

const legalToPlain = [
  {
    legal: 'Subject to clause 4.2 and deductible conditions.',
    plain: 'You pay the first part of the bill yourself before insurance starts paying.',
  },
  {
    legal: 'Coverage for PED is admissible post waiting period.',
    plain: 'Pre-existing illness claims start only after waiting period ends.',
  },
  {
    legal: 'Non-medical consumables are excluded from indemnity.',
    plain: 'Items like gloves and masks are not reimbursed.',
  },
]

const scenarioMap = {
  hospitalization: {
    label: 'What if I get hospitalized?',
    bill: 180000,
    coveredRatio: 0.78,
    claimProbability: 0.9,
  },
  accident: {
    label: 'What if accident happens?',
    bill: 120000,
    coveredRatio: 0.72,
    claimProbability: 0.82,
  },
  dental: {
    label: 'What if I need dental treatment?',
    bill: 35000,
    coveredRatio: 0.1,
    claimProbability: 0.18,
  },
}

const formatCurrency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`

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

const InsuranceSimplifier = () => {
  const [selectedScenario, setSelectedScenario] = useState('hospitalization')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const simulation = useMemo(() => {
    const current = scenarioMap[selectedScenario]
    const coveredAmount = current.bill * current.coveredRatio
    const outOfPocket = current.bill - coveredAmount

    return {
      ...current,
      coveredAmount,
      outOfPocket,
      claimSuccessProbability: Math.round(current.claimProbability * 100),
    }
  }, [selectedScenario])

  useEffect(() => {
    if (!isAnalyzing) return

    const timer = setTimeout(() => {
      setAnalysisResult({
        coveredPrice: 420000,
        deductible: 15000,
        waitingPeriod: '24 months',
        summary: 'Covers major hospitalization. Watch for waiting period and consumables exclusions.',
      })
      setIsAnalyzing(false)
    }, 1600)

    return () => clearTimeout(timer)
  }, [isAnalyzing])

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setAnalysisResult(null)
    setIsAnalyzing(true)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-6 py-6 pb-28">
      <header className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Insurance Made Human</p>
        <h1 className="text-4xl font-black tracking-tight text-[#232734] mt-2">Insurance Simplifier</h1>
        <p className="text-sm text-slate-600 mt-2">See what your policy actually does for you in seconds.</p>
      </header>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={16} className="text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Upload & analyze</p>
        </div>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl px-4 py-6 text-center bg-slate-50">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-700">Upload policy PDF or JPG</p>
          <p className="text-xs text-slate-500 mt-1">We read coverage, exclusions, and pricing instantly.</p>
          <label className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#5A5CF0] text-white text-[12px] font-black uppercase tracking-[0.18em] cursor-pointer">
            Select file
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {uploadedFile && (
            <p className="mt-3 text-[11px] text-slate-500 font-semibold">Selected: {uploadedFile.name}</p>
          )}
        </div>

        {(isAnalyzing || analysisResult) && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            {isAnalyzing ? (
              <div className="flex items-center gap-3 text-indigo-700">
                <Loader2 size={18} className="animate-spin" />
                <div>
                  <p className="text-sm font-black">Analyzing policy text</p>
                  <p className="text-xs font-semibold">Extracting coverage, price, and exclusions...</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">Analysis result</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Covered price</p>
                    <p className="text-lg font-black text-indigo-700">{formatCurrency(analysisResult.coveredPrice)}</p>
                  </div>
                  <div className="rounded-xl bg-white border border-indigo-100 p-3">
                    <p className="text-[10px] text-slate-500 font-black uppercase">Deductible</p>
                    <p className="text-lg font-black text-slate-800">{formatCurrency(analysisResult.deductible)}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-white border border-indigo-100 p-3">
                  <p className="text-[10px] text-slate-500 font-black uppercase">Waiting period</p>
                  <p className="text-sm font-black text-slate-800">{analysisResult.waitingPeriod}</p>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700">{analysisResult.summary}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">Policy Summary</p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[11px] text-slate-500 font-bold">Plan</p>
            <p className="text-sm font-black text-slate-800">{policy.name}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">Premium</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(policy.monthlyPremium)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold">Coverage</p>
            <p className="text-lg font-black text-indigo-600">{formatCurrency(policy.coverageAmount)}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Coverage Snapshot</p>
        <div className="space-y-2">
          {coverageItems.map((item) => {
            const style = statusStyles[item.status]
            return (
              <div key={item.label} className={`rounded-xl border p-3 ${style.tile}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wide ${style.badge}`}>
                    {style.text}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{item.note}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <CircleDollarSign size={16} className="text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Scenario Simulator</p>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-3">
          {Object.entries(scenarioMap).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedScenario(key)}
              className={`text-left rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${selectedScenario === key ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-700'}`}
            >
              {value.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] font-black uppercase text-emerald-700">Covered</p>
            <p className="text-lg font-black text-emerald-700">{formatCurrency(simulation.coveredAmount)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3">
            <p className="text-[10px] font-black uppercase text-rose-700">You Pay</p>
            <p className="text-lg font-black text-rose-700">{formatCurrency(simulation.outOfPocket)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
            <p className="text-[10px] font-black uppercase text-slate-600">Claim Success</p>
            <p className="text-lg font-black text-slate-800">{simulation.claimSuccessProbability}%</p>
          </div>
        </div>
      </section>

      <section className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TriangleAlert size={16} className="text-rose-600" />
          <h2 className="text-sm font-black text-rose-700">What You Don't Get</h2>
        </div>
        <ul className="space-y-2">
          {exclusions.map((line) => (
            <li key={line} className="text-xs text-rose-700 font-semibold">• {line}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-indigo-500" />
          <h2 className="text-sm font-black text-slate-800">AI Simplification</h2>
        </div>
        <div className="space-y-2">
          {legalToPlain.map((item) => (
            <div key={item.legal} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-[11px] text-slate-500 line-through">{item.legal}</p>
              <p className="text-xs text-slate-800 font-bold mt-1">{item.plain}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default InsuranceSimplifier
