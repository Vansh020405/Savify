import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, BadgeCheck, ArrowUpRight, Upload, FileText, Loader2, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency, sipPolicies, protectionPolicies } from '../utils/policyData'
import { analyzePolicyDocument } from '../utils/policyApi'

const PolicyCard = ({ policy, showMaturity }) => (
  <Link
    to={`/insurance/${policy.id}`}
    className="block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm transition-transform active:scale-[0.99]"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">{policy.category}</p>
        <h3 className="text-lg font-black text-slate-900 mt-1">{policy.name}</h3>
        <p className="text-[11px] text-slate-500 font-semibold">{policy.insurer}</p>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-black text-sm">
        {policy.insurer.charAt(0)}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
        <p className="text-[10px] text-slate-500 font-black uppercase">Monthly premium</p>
        <p className="text-sm font-black text-slate-900">{formatCurrency(policy.monthlyPremium)}/mo</p>
      </div>
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
        <p className="text-[10px] text-slate-500 font-black uppercase">{showMaturity ? 'Maturity value' : 'Coverage'}</p>
        <p className="text-sm font-black text-indigo-600">
          {formatCurrency(showMaturity ? policy.maturityAmount : policy.coverageAmount)}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between mt-3">
      <span className="text-[11px] font-bold text-slate-600">{policy.benefitTag}</span>
      {policy.isTopPick && (
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black uppercase">
          <BadgeCheck size={12} />
          Best for you
        </span>
      )}
    </div>

    <p className="mt-3 text-xs text-slate-600 font-semibold">{policy.reason}</p>
    <div className="mt-3 inline-flex items-center gap-2 text-indigo-600 text-[11px] font-black uppercase">
      View details
      <ArrowUpRight size={12} />
    </div>
  </Link>
)

const InsuranceHome = () => {
  const { user } = useStore()
  const profile = user.insuranceProfile || {}
  const age = profile.age || 28
  const city = profile.city || 'Bengaluru'
  const budget = profile.budget || Math.round((user.income || 0) * 0.02)
  const tags = profile.tags || 'Non-smoker · Salaried · No dependents'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')

  const handleScrollToPolicies = () => {
    const target = document.getElementById('policy-feed')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

  return (
    <div className="investments-sip-font min-h-screen bg-[#F8F9FB] px-6 py-6 pb-28">
      <header className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Personalized Insurance</p>
        <h1 className="text-4xl font-black tracking-tight text-[#232734] mt-2">Policy Hub</h1>
        <p className="text-sm text-slate-600 mt-2">Policies picked for your profile, not a generic catalog.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to="/insurance/habits"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5A5CF0] text-white py-3 text-[11px] font-black uppercase tracking-[0.18em] shadow-md shadow-indigo-200"
        >
          Match my habits
          <ArrowUpRight size={12} />
        </Link>
        <button
          type="button"
          onClick={handleScrollToPolicies}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 py-3 text-[11px] font-black uppercase tracking-[0.18em]"
        >
          Find a policy
          <ArrowUpRight size={12} />
        </button>
      </div>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">Your snapshot</p>
            <h2 className="text-lg font-black text-slate-900 mt-1">{user.name}</h2>
          </div>
          <Link to="/profile" className="flex items-center gap-1 text-indigo-600 text-[11px] font-black uppercase">
            <Edit3 size={12} />
            Edit profile
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Age</p>
            <p className="text-sm font-black text-slate-900">{age}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">City</p>
            <p className="text-sm font-black text-slate-900">{city}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Monthly budget</p>
            <p className="text-sm font-black text-indigo-600">{formatCurrency(budget)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Life tags</p>
            <p className="text-xs font-bold text-slate-700">{tags}</p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Upload size={16} className="text-indigo-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Upload policy & check</p>
        </div>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl px-4 py-6 text-center bg-slate-50">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3">
            <FileText size={20} className="text-slate-500" />
          </div>
          <p className="text-sm font-bold text-slate-700">Upload your policy PDF or photo</p>
          <p className="text-xs text-slate-500 mt-1">We will read coverage, exclusions, and waiting periods.</p>
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
                  <p className="text-xs font-semibold">Extracting coverage and exclusions.</p>
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
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">Policy summary</p>
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
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mb-6" id="policy-feed">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">Invest monthly & grow</p>
            <h2 className="text-lg font-black text-slate-900">Savings-focused plans</h2>
          </div>
          <Link to="/insurance/habits" className="text-indigo-600 text-[11px] font-black uppercase flex items-center gap-1">
            Match my habits
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="grid gap-3">
          {sipPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} showMaturity />
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">Protection policies for you</p>
        <h2 className="text-lg font-black text-slate-900 mt-1 mb-3">Cover what matters most</h2>
        <div className="grid gap-3">
          {protectionPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default InsuranceHome
