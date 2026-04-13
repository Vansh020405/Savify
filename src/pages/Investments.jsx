import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, RefreshCw, AlertTriangle, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { fetchMarketSummary } from '../utils/marketApi'

const formatCurrency = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`
const toSafeNumber = (value) => Number(value) || 0

const getRiskTier = (ratio) => {
  if (ratio >= 1) return 'Aggressive'
  if (ratio >= 0.5) return 'Moderate'
  return 'Conservative'
}

const getAllocation = (safeAmount, monthsCovered, riskTier) => {
  if (safeAmount <= 0) {
    return [
      { key: 'cash', label: 'Hold as cash buffer', percent: 100, tone: 'bg-slate-200' },
    ]
  }

  const needsEmergency = monthsCovered < 6
  const emergencyPct = needsEmergency ? 60 : 0
  let sipPct = riskTier === 'Conservative' ? 25 : riskTier === 'Moderate' ? 30 : 20
  let moderatePct = riskTier === 'Conservative' ? 10 : riskTier === 'Moderate' ? 20 : 30
  let cashPct = riskTier === 'Conservative' ? 5 : riskTier === 'Moderate' ? 10 : 15

  if (needsEmergency) {
    const remaining = 40
    const total = sipPct + moderatePct + cashPct
    sipPct = Math.round((sipPct / total) * remaining)
    moderatePct = Math.round((moderatePct / total) * remaining)
    cashPct = remaining - sipPct - moderatePct
  }

  const segments = [
    needsEmergency && { key: 'emergency', label: 'Emergency top-up', percent: emergencyPct, tone: 'bg-amber-400' },
    { key: 'sip', label: 'Safe SIP (index fund)', percent: sipPct, tone: 'bg-emerald-500' },
    { key: 'moderate', label: 'Moderate pick', percent: moderatePct, tone: 'bg-indigo-500' },
    { key: 'cash', label: 'Hold as cash buffer', percent: cashPct, tone: 'bg-slate-300' },
  ].filter(Boolean)

  return segments
}

const getFitBadge = ({ changePercent, trend }, riskTier) => {
  const absMove = Math.abs(changePercent)
  const isWeak = trend === 'down' || absMove > 3

  if (riskTier === 'Conservative') {
    return isWeak ? { label: 'Hold off', tone: 'text-rose-700 bg-rose-50' } : { label: 'Fits your profile', tone: 'text-emerald-700 bg-emerald-50' }
  }
  if (riskTier === 'Moderate') {
    return absMove > 4 || trend === 'down'
      ? { label: 'Too volatile for now', tone: 'text-amber-700 bg-amber-50' }
      : { label: 'Fits your profile', tone: 'text-emerald-700 bg-emerald-50' }
  }
  return absMove > 6 && trend === 'down'
    ? { label: 'Hold off', tone: 'text-rose-700 bg-rose-50' }
    : { label: 'Fits your profile', tone: 'text-emerald-700 bg-emerald-50' }
}

const buildSparkline = (trend, seed) => {
  const base = trend === 'up'
    ? [30, 38, 44, 52, 64]
    : trend === 'down'
      ? [62, 54, 46, 38, 32]
      : [42, 45, 40, 44, 41]
  const jitter = (seed % 7) - 3
  return base.map((value, index) => Math.max(18, value + jitter + (index % 2 === 0 ? 2 : -1)))
}

const Investments = () => {
  const { user, expenses, investmentLog, addInvestment, setUser } = useStore()
  const profile = user.investmentProfile || {}
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [draftProfile, setDraftProfile] = useState({
    income: profile.income || '',
    expenses: profile.expenses || '',
    savings: profile.savings || '',
  })
  const [expandedSplit, setExpandedSplit] = useState(null)
  const [marketData, setMarketData] = useState([])
  const [isLoadingMarket, setIsLoadingMarket] = useState(true)
  const [marketError, setMarketError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [expandedTicker, setExpandedTicker] = useState(null)

  const derivedProfile = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const incomeEntries = expenses.filter((entry) => entry.type === 'income')
    const expenseEntries = expenses.filter((entry) => entry.type === 'expense')

    const monthlyIncomeEntries = incomeEntries
      .filter((entry) => {
        const date = new Date(entry.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, entry) => sum + toSafeNumber(entry.amount), 0)

    const monthlyExpenseEntries = expenseEntries
      .filter((entry) => {
        const date = new Date(entry.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, entry) => sum + toSafeNumber(entry.amount), 0)

    const totalIncome = incomeEntries.reduce((sum, entry) => sum + toSafeNumber(entry.amount), 0)
    const totalExpense = expenseEntries.reduce((sum, entry) => sum + toSafeNumber(entry.amount), 0)
    const netSavings = Math.max(0, totalIncome - totalExpense)

    return {
      income: user.income || monthlyIncomeEntries || 0,
      expenses: monthlyExpenseEntries || 0,
      savings: netSavings || user.savingsGoal || 0,
    }
  }, [expenses, user.income, user.savingsGoal])

  const isProfileEmpty = !profile.income && !profile.expenses && !profile.savings
  const hasDerivedProfile = derivedProfile.income > 0 || derivedProfile.expenses > 0 || derivedProfile.savings > 0

  useEffect(() => {
    if (isProfileEmpty && hasDerivedProfile) {
      setUser({ investmentProfile: derivedProfile })
      setDraftProfile({
        income: derivedProfile.income,
        expenses: derivedProfile.expenses,
        savings: derivedProfile.savings,
      })
    }
  }, [derivedProfile, hasDerivedProfile, isProfileEmpty, setUser])

  const income = Number(profile.income) || derivedProfile.income
  const fixedExpenses = Number(profile.expenses) || derivedProfile.expenses
  const savings = Number(profile.savings) || derivedProfile.savings
  const isProfileComplete = income > 0 && fixedExpenses >= 0 && savings >= 0

  const safeAmount = Math.max(0, income - fixedExpenses - income * 0.2)
  const monthsCovered = fixedExpenses > 0 ? savings / fixedExpenses : 0
  const bufferRatio = fixedExpenses > 0 ? savings / (fixedExpenses * 6) : 0
  const riskTier = getRiskTier(bufferRatio)
  const allocation = getAllocation(safeAmount, monthsCovered, riskTier)

  const investedThisMonth = investmentLog
    .filter((entry) => {
      const date = new Date(entry.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, entry) => sum + (entry.amount || 0), 0)

  const marketMap = useMemo(() => {
    return marketData.reduce((acc, item) => {
      acc[item.ticker] = item
      return acc
    }, {})
  }, [marketData])

  const investmentsWithValue = investmentLog.map((entry) => {
    const currentPrice = marketMap[entry.ticker]?.price || entry.price
    const currentValue = entry.units * currentPrice
    const gain = currentValue - entry.amount
    const gainPct = entry.amount ? (gain / entry.amount) * 100 : 0
    return { ...entry, currentValue, gain, gainPct }
  })

  const totalInvested = investmentsWithValue.reduce((sum, entry) => sum + entry.amount, 0)
  const totalCurrent = investmentsWithValue.reduce((sum, entry) => sum + entry.currentValue, 0)
  const totalGain = totalCurrent - totalInvested
  const totalGainPct = totalInvested ? (totalGain / totalInvested) * 100 : 0

  const loadMarketData = async () => {
    setIsLoadingMarket(true)
    setMarketError('')
    try {
      const result = await fetchMarketSummary()
      setMarketData(result || [])
      setLastUpdated(new Date())
    } catch (error) {
      setMarketError('Unable to refresh market data right now.')
    } finally {
      setIsLoadingMarket(false)
    }
  }

  useEffect(() => {
    loadMarketData()
  }, [])

  const summaryMessage = useMemo(() => {
    if (monthsCovered < 3) return 'Build your emergency fund first before investing.'
    if (safeAmount < 500) return 'Tight month - stick to SIPs only.'
    return "You have room to invest. Here's what makes sense right now."
  }, [monthsCovered, safeAmount])

  const handleSaveProfile = () => {
    const cleaned = {
      income: Number(draftProfile.income) || 0,
      expenses: Number(draftProfile.expenses) || 0,
      savings: Number(draftProfile.savings) || 0,
    }
    setUser({ investmentProfile: cleaned })
    setIsEditingProfile(false)
  }

  const handleInvest = (instrument, amount) => {
    if (!instrument || amount <= 0) return
    addInvestment({
      ticker: instrument.ticker,
      name: instrument.name,
      amount,
      price: instrument.price,
      units: amount / instrument.price,
      date: new Date().toISOString(),
    })
  }

  const riskInsights = useMemo(() => {
    const insights = []
    marketData.forEach((item) => {
      if (item.changePercent <= -2) {
        insights.push({
          label: `${item.name} is dropping today - wait`,
          detail: `Down ${item.changePercent.toFixed(2)}% today.`
        })
      }
      if (item.trend === 'down') {
        insights.push({
          label: `${item.name} had a weak week`,
          detail: '5-day trend is negative.'
        })
      }
      if (safeAmount > 0 && item.price > safeAmount * 0.3) {
        insights.push({
          label: `${item.name} is too large for your budget`,
          detail: 'Single buy would exceed 30% of your safe amount.'
        })
      }
    })
    if (insights.length === 0) {
      insights.push({
        label: 'All tracked instruments are within normal range.',
        detail: 'No action needed right now.'
      })
    }
    return insights.slice(0, 4)
  }, [marketData, safeAmount])

  return (
    <div className="bg-[#F8F9FB] min-h-screen pb-28">
      <header className="sticky top-0 z-20 px-6 py-4 bg-[#F8F9FB]/85 backdrop-blur-lg border-b border-[#EEF1F4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#5A5CF0] text-white flex items-center justify-center text-[11px] font-black">S</div>
            <p className="text-[22px] font-black tracking-tight text-[#5A5CF0]">Sanctuary Invest</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black uppercase text-slate-600">
            {riskTier} risk
          </div>
        </div>
      </header>

      <main className="px-6 pt-6">
        <div className="mb-6">
          <p className="text-[9px] text-[#7A7BEA] font-extrabold uppercase tracking-[0.2em] mb-2">Personalized cockpit</p>
          <h1 className="text-[36px] leading-[0.95] font-black tracking-tight text-[#2D3337] mb-2">Your investment dashboard</h1>
          <p className="text-sm text-[#6A7075] max-w-[320px]">Real-time signals mapped to your money.</p>
        </div>

        {!isProfileComplete && !hasDerivedProfile && (
          <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Step 1 of 3</p>
            <h2 className="text-lg font-black text-slate-900 mt-2">Tell us your money baseline</h2>
            <div className="grid gap-3 mt-4">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">Monthly income</p>
                <input
                  type="number"
                  value={draftProfile.income}
                  onChange={(event) => setDraftProfile((prev) => ({ ...prev, income: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  placeholder="₹"
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">Fixed monthly expenses</p>
                <input
                  type="number"
                  value={draftProfile.expenses}
                  onChange={(event) => setDraftProfile((prev) => ({ ...prev, expenses: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  placeholder="₹"
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">Current savings buffer</p>
                <input
                  type="number"
                  value={draftProfile.savings}
                  onChange={(event) => setDraftProfile((prev) => ({ ...prev, savings: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  placeholder="₹"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="mt-5 w-full rounded-2xl bg-[#5A5CF0] text-white py-3 text-[11px] font-black uppercase tracking-[0.18em]"
            >
              Save profile
            </button>
          </section>
        )}

        {hasDerivedProfile && (
          <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Synced from your activity</p>
                <h2 className="text-lg font-black text-slate-900 mt-2">Money baseline</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="flex items-center gap-2 text-indigo-600 text-[11px] font-black uppercase"
              >
                <Pencil size={12} />
                {isEditingProfile ? 'Close' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Income</p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(income)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Expenses</p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(fixedExpenses)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Savings buffer</p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(savings)}</p>
              </div>
            </div>

            {isEditingProfile && (
              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase">Monthly income</p>
                  <input
                    type="number"
                    value={draftProfile.income}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, income: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase">Fixed monthly expenses</p>
                  <input
                    type="number"
                    value={draftProfile.expenses}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, expenses: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase">Current savings buffer</p>
                  <input
                    type="number"
                    value={draftProfile.savings}
                    onChange={(event) => setDraftProfile((prev) => ({ ...prev, savings: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="mt-2 w-full rounded-2xl bg-[#5A5CF0] text-white py-3 text-[11px] font-black uppercase tracking-[0.18em]"
                >
                  Save profile
                </button>
              </div>
            )}
          </section>
        )}

        {isProfileComplete && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[12px] font-black text-[#2D3337] uppercase tracking-[0.18em]">Your money at a glance</h2>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Based on your profile</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Safe to invest</p>
                <p className={`text-sm font-black ${safeAmount >= 1000 ? 'text-emerald-600' : 'text-amber-600'}`}>{formatCurrency(safeAmount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Emergency fund</p>
                <p className="text-[12px] font-black text-slate-900">{monthsCovered.toFixed(1)} of 6 months</p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (monthsCovered / 6) * 100)}%` }} />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">Already invested</p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(investedThisMonth)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">{summaryMessage}</p>
          </section>
        )}

        {isProfileComplete && (
          <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">What to do now</p>
                <h2 className="text-lg font-black text-slate-900 mt-1">Split {formatCurrency(safeAmount)} like this</h2>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Based on your profile</span>
            </div>
            <div className="mt-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                {allocation.map((segment) => (
                  <div key={segment.key} className={segment.tone} style={{ width: `${segment.percent}%` }} />
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {allocation.map((segment) => (
                  <button
                    key={segment.key}
                    type="button"
                    onClick={() => setExpandedSplit(expandedSplit === segment.key ? null : segment.key)}
                    className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-800">{segment.label}</p>
                      <p className="text-sm font-black text-slate-700">{segment.percent}%</p>
                    </div>
                    {expandedSplit === segment.key && (
                      <p className="mt-2 text-xs font-semibold text-slate-600">
                        {segment.key === 'emergency' && 'Your emergency fund is below 6 months, so prioritize safety.'}
                        {segment.key === 'sip' && 'Index SIPs keep volatility low while you build wealth.'}
                        {segment.key === 'moderate' && 'Allocate a controlled amount to a single strong pick.'}
                        {segment.key === 'cash' && 'Keep some cash ready for surprises or better entries.'}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[12px] font-black text-[#2D3337] uppercase tracking-[0.18em]">Live market cards</h3>
              <p className="text-[10px] text-slate-500 font-bold">Based on your profile</p>
            </div>
            <button
              type="button"
              onClick={loadMarketData}
              className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase"
            >
              <RefreshCw size={12} className={isLoadingMarket ? 'animate-spin' : ''} />
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Refresh'}
            </button>
          </div>

          {isLoadingMarket && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-indigo-700 text-xs font-semibold animate-pulse">
              Refreshing market data...
            </div>
          )}

          {marketError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700 text-xs font-semibold">
              {marketError}
            </div>
          )}

          <div className="grid gap-3 mt-3">
            {marketData.map((item) => {
              const fit = getFitBadge(item, riskTier)
              const sparkline = buildSparkline(item.trend, item.ticker.length)
              const moderatePct = allocation.find((segment) => segment.key === 'moderate')?.percent || 0
              const suggestedAmount = Math.max(0, Math.floor((safeAmount * moderatePct) / 100 / 100) * 100)
              const shares = item.price > 0 ? Math.floor(suggestedAmount / item.price) : 0
              const actionLine = suggestedAmount >= 500
                ? `Your budget allows ${formatCurrency(suggestedAmount)} here - that buys ${shares} shares`
                : 'Budget is tight - skip new buys this month.'

              return (
                <motion.article
                  key={item.ticker}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">{item.ticker}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${fit.tone}`}>
                      {fit.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                      <p className="text-[10px] text-slate-500 font-black uppercase">Live price</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                      <p className="text-[10px] text-slate-500 font-black uppercase">Today</p>
                      <p className={`text-xl font-black ${item.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-end gap-1">
                    {sparkline.map((height, index) => (
                      <div key={`${item.ticker}-${index}`} className="w-3 rounded-full bg-indigo-200" style={{ height: `${height}px` }} />
                    ))}
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-600">{actionLine}</p>

                  <button
                    type="button"
                    onClick={() => setExpandedTicker(expandedTicker === item.ticker ? null : item.ticker)}
                    className="mt-3 text-indigo-600 text-[11px] font-black uppercase flex items-center gap-2"
                  >
                    {expandedTicker === item.ticker ? 'Hide details' : 'See details'}
                    <ArrowUpRight size={12} />
                  </button>

                  {expandedTicker === item.ticker && (
                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-700">{item.headline}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-2">52-week range (est.)</p>
                      <p className="text-[11px] font-semibold text-slate-700">
                        {formatCurrency(item.price * 0.7)} - {formatCurrency(item.price * 1.2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleInvest(item, suggestedAmount)}
                        disabled={suggestedAmount <= 0}
                        className="mt-3 w-full rounded-xl bg-[#5A5CF0] text-white py-2 text-[11px] font-black uppercase tracking-[0.18em] disabled:opacity-40"
                      >
                        Confirm invest
                      </button>
                    </div>
                  )}
                </motion.article>
              )
            })}
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.16em]">Investment log</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">Your investment activity</h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Based on your profile</span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-600">You've invested {formatCurrency(totalInvested)} total.</p>
            <p className="text-sm font-black text-slate-900">
              Current value: {formatCurrency(totalCurrent)} ({totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} / {totalGainPct.toFixed(2)}%)
            </p>
          </div>

          {investmentLog.length === 0 && (
            <p className="mt-4 text-xs font-semibold text-slate-600">Make your first investment above and it will appear here.</p>
          )}

          {investmentLog.length > 0 && (
            <div className="mt-4 grid gap-2">
              {investmentsWithValue.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900">{entry.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatCurrency(entry.amount)}</p>
                      <p className={`text-[11px] font-bold ${entry.gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.gain >= 0 ? '+' : ''}{formatCurrency(entry.gain)} ({entry.gainPct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Current value: {formatCurrency(entry.currentValue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-black text-[#2D3337] uppercase tracking-[0.18em]">Avoid right now</h3>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">Based on your profile</span>
          </div>
          <div className="grid gap-3">
            {riskInsights.map((insight, index) => (
              <div key={`${insight.label}-${index}`} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-black text-rose-700">{insight.label}</p>
                  <AlertTriangle size={14} className="text-rose-600" />
                </div>
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{insight.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Investments
