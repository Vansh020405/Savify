import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { ChevronLeft, TrendingUp, Info, ArrowUpRight, ArrowDownRight, RefreshCw, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { stocks, fetchStockPrice, calculateFutureValue } from '../utils/stockApi'
import { useStore } from '../store/useStore'

const toSafeNumber = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const formatCurrency = (value) => `₹${toSafeNumber(value).toLocaleString('en-IN')}`

const AnimatedCurrency = ({ value, className = '' }) => {
  const safeValue = toSafeNumber(value)
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 16 })
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString('en-IN'))

  useEffect(() => {
    spring.set(safeValue)
  }, [safeValue, spring])

  return (
    <span className={className}>
      ₹<motion.span>{display}</motion.span>
    </span>
  )
}

const Investments = () => {
  const navigate = useNavigate()
  const { appliedMonthlySavings, expenses, user, setUser } = useStore()
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoInvestMsg, setAutoInvestMsg] = useState('')
  const [selectedTenure, setSelectedTenure] = useState(5)
  const [monthlyDepositInput, setMonthlyDepositInput] = useState('0')

  const transactions = Array.isArray(expenses) ? expenses : []
  const expenseTransactions = transactions.filter((entry) => entry?.type === 'expense')
  const hasBehaviorHistory = expenseTransactions.length > 0
  const nudgesMonthlySaving = toSafeNumber(appliedMonthlySavings)

  const totalIncome = transactions
    .filter((entry) => entry?.type === 'income')
    .reduce((sum, entry) => sum + toSafeNumber(entry?.amount), 0)
  const totalExpense = transactions
    .filter((entry) => entry?.type === 'expense')
    .reduce((sum, entry) => sum + toSafeNumber(entry?.amount), 0)
  const balance = Math.max(0, totalIncome - totalExpense)

  const availableSavings = Math.max(0, balance)
  const baseSuggestion = hasBehaviorHistory && availableSavings > 0
    ? Math.max(500, Math.round((availableSavings * 0.2) / 100) * 100)
    : 0
  const suggestedMonthlyInvestment = hasBehaviorHistory
    ? (nudgesMonthlySaving > 0 ? Math.max(baseSuggestion, nudgesMonthlySaving) : baseSuggestion)
    : 0

  const oneYear = calculateFutureValue(suggestedMonthlyInvestment, 1, 0.12)
  const threeYears = calculateFutureValue(suggestedMonthlyInvestment, 3, 0.12)
  const fiveYears = calculateFutureValue(suggestedMonthlyInvestment, 5, 0.12)
  const parsedMonthlyDeposit = Math.max(0, toSafeNumber(monthlyDepositInput))
  const effectiveMonthlyDeposit = parsedMonthlyDeposit > 0 ? parsedMonthlyDeposit : suggestedMonthlyInvestment
  const potentialGrowth = calculateFutureValue(effectiveMonthlyDeposit, selectedTenure, 0.12)
  const totalInvested = effectiveMonthlyDeposit * selectedTenure * 12
  const estimatedGain = Math.max(0, potentialGrowth - totalInvested)

  const tenureOptions = [1, 3, 5]

  const loadData = async () => {
    setLoading(true)
    const results = await Promise.all(
      stocks.slice(0, 5).map(async (s) => {
        const price = await fetchStockPrice(s.symbol)
        return {
          ...s,
          price: {
            current: toSafeNumber(price?.current),
            change: toSafeNumber(price?.change),
            percent: toSafeNumber(price?.percent),
          },
        }
      })
    )
    setStockData(results)
    setLoading(false)
  }

  const handleAutoInvest = () => {
    if (!hasBehaviorHistory || suggestedMonthlyInvestment <= 0) {
      setAutoInvestMsg('Start adding transactions first. Auto Invest activates after spending behavior is detected.')
      return
    }
    setUser({
      autoInvest: {
        enabled: true,
        amount: suggestedMonthlyInvestment,
        source: nudgesMonthlySaving > 0 ? 'nudges+balance' : 'balance',
      },
    })
    setAutoInvestMsg(`Auto Invest enabled for ₹${suggestedMonthlyInvestment.toLocaleString('en-IN')}/month`)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!monthlyDepositInput || toSafeNumber(monthlyDepositInput) === 0) {
      setMonthlyDepositInput(String(suggestedMonthlyInvestment))
    }
  }, [suggestedMonthlyInvestment])

  const bestStockByAI = stockData.length > 0
    ? [...stockData].sort((a, b) => {
        const scoreA = (toSafeNumber(a.avgReturn) * 100) + (toSafeNumber(a?.price?.percent) * 0.8)
        const scoreB = (toSafeNumber(b.avgReturn) * 100) + (toSafeNumber(b?.price?.percent) * 0.8)
        return scoreB - scoreA
      })[0]
    : null

  const bestStockReason = bestStockByAI
    ? `AI Analysis: ${bestStockByAI.name} ranks highest on return quality + recent momentum. Avg return ~${Math.round(toSafeNumber(bestStockByAI.avgReturn) * 100)}% with ${Math.abs(toSafeNumber(bestStockByAI?.price?.percent)).toFixed(2)}% recent move.`
    : 'AI Analysis: Waiting for market data. Using fallback picks for now.'

  return (
    <div className="bg-[#F8F9FB] min-h-screen pb-32">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#F8F9FB]/90 backdrop-blur-xl z-50 px-6 py-5 flex items-center justify-between">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-600"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <h1 className="text-sm font-black text-[#1A1932] uppercase tracking-[0.2em]">Investment Hub</h1>
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={loadData}
          className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-[#6366F1]"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </header>

      <main className="pt-24 px-6 max-w-md mx-auto">
        {/* Your Investment Potential */}
        <div className="mb-6 p-6 bg-[#1A1932] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={100} />
          </div>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Your Investment Potential</p>
          <div className="grid grid-cols-1 gap-3 relative z-10">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
              <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mb-1">Available Savings</p>
              <p className="text-2xl font-black tracking-tight"><AnimatedCurrency value={availableSavings} /></p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
                <p className="text-[9px] text-white/60 font-black uppercase tracking-widest mb-1">Suggested Monthly</p>
                <p className="text-lg font-black"><AnimatedCurrency value={suggestedMonthlyInvestment} /></p>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-300/20 rounded-2xl p-3">
                <p className="text-[9px] text-emerald-200 font-black uppercase tracking-widest mb-1">Future Value (5Y)</p>
                <p className="text-lg font-black text-emerald-200"><AnimatedCurrency value={fiveYears} /></p>
              </div>
            </div>
            {!hasBehaviorHistory && (
              <p className="text-[11px] text-white/70 font-bold">New profile detected: values will stay at ₹0 until spending behavior data is available.</p>
            )}
          </div>
        </div>

        {/* Unified Growth Simulator */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xs font-black text-[#1A1932] uppercase tracking-[0.15em] mb-2">Growth Simulator</h2>
          <p className="text-[11px] text-slate-400 font-semibold mb-4">Choose tenure + monthly deposit to see potential growth.</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {tenureOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedTenure(option)}
                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-colors ${selectedTenure === option ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
              >
                {option}Y
              </button>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Money To Deposit Monthly</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
              <input
                type="number"
                min="0"
                value={monthlyDepositInput}
                onChange={(e) => setMonthlyDepositInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-8 pr-4 text-sm font-black text-[#1A1932] outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
            <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mb-1">Predicted Output</p>
            <p className="text-3xl font-black text-emerald-600 tracking-tight"><AnimatedCurrency value={potentialGrowth} /></p>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">{selectedTenure} year estimate at 12% annual return</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white/80 border border-emerald-100 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Invested</p>
                <p className="text-sm font-black text-[#1A1932]"><AnimatedCurrency value={totalInvested} /></p>
              </div>
              <div className="bg-white/80 border border-emerald-100 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Estimated Gain</p>
                <p className="text-sm font-black text-emerald-600"><AnimatedCurrency value={estimatedGain} /></p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Best Stock Suggestion (AI)</p>
            <p className="text-sm font-black text-[#1A1932] mb-1">{bestStockByAI?.name || 'Nifty 50 ETF'}</p>
            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{bestStockReason}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Trends</h2>
          <LayoutGrid size={16} className="text-slate-300" />
        </div>

        <div className="space-y-4 mb-10">
          <AnimatePresence mode="popLayout">
            {stockData.map((stock, idx) => {
              const symbol = (stock.symbol || '').split('.')[0] || 'NA'
              const isUp = toSafeNumber(stock?.price?.percent) >= 0
              const returnPct = Math.round(toSafeNumber(stock.avgReturn) * 100)

              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 font-black text-xs shadow-inner">
                      {symbol[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#1A1932] group-hover:text-[#6366F1] transition-colors">{stock.name || 'N/A'}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Stable Growth</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded font-black uppercase tracking-widest leading-none">
                          {returnPct || 0}-{(returnPct || 0) + 2}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[#1A1932] mb-0.5">
                      {loading ? formatCurrency(0) : formatCurrency(stock?.price?.current)}
                    </div>
                    <div className={`text-[10px] font-black flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(toSafeNumber(stock?.price?.percent)).toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate('/nudges')}
            className="bg-[#1A1932] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest"
          >
            Invest Now
          </button>
          <button
            type="button"
            onClick={handleAutoInvest}
            className="bg-emerald-500 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest"
          >
            Auto Invest Savings
          </button>
        </div>

        {autoInvestMsg && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <p className="text-xs font-bold text-emerald-700">{autoInvestMsg}</p>
          </div>
        )}

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1]">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[#1A1932] font-black text-xs uppercase tracking-widest mb-2">Savings Connection</p>
              <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                Invest {formatCurrency(effectiveMonthlyDeposit)}/month and this could become{' '}
                <span className="text-emerald-500 font-bold">{formatCurrency(calculateFutureValue(effectiveMonthlyDeposit, 5, 0.12))}</span> in 5 years with steady investing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Investments
