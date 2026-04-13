import { Upload, FileText, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

const flags = [
  { label: 'Low Claim Ratio', tone: 'red', detail: 'Insurer payout ratio below 80%' },
  { label: 'High Waiting Period', tone: 'yellow', detail: '24-month wait for pre-existing' },
  { label: 'Strong Cashless Network', tone: 'green', detail: 'Wide hospital coverage' },
]

const keyInsights = [
  'High waiting period for pre-existing conditions',
  'Low coverage for premium compared to market median',
  'Multiple exclusions for outpatient claims',
]

const toneStyles = {
  red: {
    bg: 'bg-rose-50 border-rose-100',
    text: 'text-rose-700',
    icon: XCircle,
  },
  yellow: {
    bg: 'bg-amber-50 border-amber-100',
    text: 'text-amber-700',
    icon: AlertTriangle,
  },
  green: {
    bg: 'bg-emerald-50 border-emerald-100',
    text: 'text-emerald-700',
    icon: CheckCircle2,
  },
}

const PolicyAnalyzer = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FB] px-6 py-6 pb-28">
      <header className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Policy Analyzer</p>
        <h1 className="text-4xl font-black tracking-tight text-[#232734] mt-2">Instant Policy Verdict</h1>
        <p className="text-sm text-slate-600 mt-2">Upload a policy and get a clear yes or no in seconds.</p>
      </header>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={16} className="text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Upload policy</p>
        </div>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl px-4 py-6 text-center bg-slate-50">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-700">Drag & drop your policy PDF</p>
          <p className="text-xs text-slate-500 mt-1">or choose a file to analyze</p>
          <button className="mt-4 px-4 py-2 rounded-xl bg-[#5A5CF0] text-white text-[12px] font-black uppercase tracking-[0.18em]">
            Upload file
          </button>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Analysis output</p>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">Updated just now</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Policy score</p>
            <p className="text-[30px] font-black text-[#1F2430]">72</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Overall risk</p>
            <p className="text-[16px] font-black text-amber-600">Moderate</p>
          </div>
        </div>

        <div className="grid gap-2">
          {flags.map((flag) => {
            const style = toneStyles[flag.tone]
            const Icon = style.icon
            return (
              <div key={flag.label} className={`rounded-xl border p-3 ${style.bg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={style.text} />
                    <p className={`text-sm font-black ${style.text}`}>{flag.label}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${style.text}`}>{flag.tone}</span>
                </div>
                <p className={`text-xs mt-1 font-semibold ${style.text}`}>{flag.detail}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-2">Verdict</p>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-lg font-black text-emerald-700">Worth it</p>
          <p className="text-xs font-semibold text-emerald-700 mt-1">
            Balanced premium-to-coverage with manageable exclusions. Best if you can handle the waiting period.
          </p>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Key insights</p>
        <div className="space-y-2">
          {keyInsights.map((insight) => (
            <div key={insight} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <p className="text-sm font-semibold text-slate-700">{insight}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default PolicyAnalyzer
