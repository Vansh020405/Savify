import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { ChevronLeft, TrendingUp, Info, ArrowUpRight, ArrowDownRight, RefreshCw, LayoutGrid } from 'lucide-react'
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
  const { appliedMonthlySavings, expenses } = useStore()
  const [stockData, setStockData] = useState([])
  const [loading, setLoading] = useState(true)

  const transactions = Array.isArray(expenses) ? expenses : []
  const savedAmountMonthly = toSafeNumber(appliedMonthlySavings)
  const monthly = savedAmountMonthly || 0

  const totalIncome = transactions
    .filter((entry) => entry?.type === 'income')
    .reduce((sum, entry) => sum + toSafeNumber(entry?.amount), 0)
  const totalExpense = transactions
    .filter((entry) => entry?.type === 'expense')
    .reduce((sum, entry) => sum + toSafeNumber(entry?.amount), 0)
  const totalSavings = Math.max(0, totalIncome - totalExpense)

  const oneYear = monthly > 0 ? calculateFutureValue(monthly, 1, 0.12) : 0
  const threeYears = monthly > 0 ? calculateFutureValue(monthly, 3, 0.12) : 0
  const fiveYears = monthly > 0 ? calculateFutureValue(monthly, 5, 0.12) : 0

  const projectionBars = [
    { label: '1Y', years: 1, value: oneYear },
    { label: '3Y', years: 3, value: threeYears },
    { label: '5Y', years: 5, value: fiveYears },
  ]
  const maxProjection = Math.max(...projectionBars.map((bar) => toSafeNumber(bar.value)), 1)

  const loadData = async () => {
    setLoading(true)
    const results = await Promise.all(
      stocks.slice(0, 3).map(async (s) => {
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

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    console.log('Investments dashboard values', {
      savedAmountMonthly,
      monthly,
      transactionsCount: transactions.length,
      totalIncome,
      totalExpense,
      totalSavings,
      oneYear,
      threeYears,
      fiveYears,
    })
  }, [savedAmountMonthly, monthly, transactions.length, totalIncome, totalExpense, totalSavings, oneYear, threeYears, fiveYears])

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
        {/* Overview */}
        <div className="mb-8 p-6 bg-[#1A1932] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp size={100} />
          </div>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Investment Dashboard</p>
          <div className="text-[11px] text-white/70 font-bold leading-relaxed">
            Invest {formatCurrency(monthly)}/month → {formatCurrency(fiveYears)} in 5 years 📈
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Monthly Investment</p>
            <p className="text-3xl font-black text-[#1A1932]"><AnimatedCurrency value={monthly} />/month</p>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Total Saved So Far</p>
            <p className="text-3xl font-black text-[#1A1932]"><AnimatedCurrency value={totalSavings} /></p>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Future Value (5 Years)</p>
            <p className="text-3xl font-black text-emerald-600"><AnimatedCurrency value={fiveYears} /></p>
          </div>
        </div>

        {/* Growth Projection */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xs font-black text-[#1A1932] uppercase tracking-[0.15em] mb-1">Your money can grow like this 📈</h2>
          <p className="text-[11px] text-slate-400 font-semibold mb-6">Assuming 12% annual return with monthly SIP.</p>

          <div className="space-y-4 mb-5">
            {projectionBars.map((entry) => {
              const width = `${Math.max(8, Math.round((toSafeNumber(entry.value) / maxProjection) * 100))}%`
              const highlight = entry.years === 5
              return (
                <div key={entry.years}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{entry.years} year</p>
                    <p className={`font-black ${highlight ? 'text-2xl text-emerald-600' : 'text-sm text-[#1A1932]'}`}>
                      <AnimatedCurrency value={entry.value} />
                    </p>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={highlight ? 'h-full bg-emerald-500 rounded-full' : 'h-full bg-indigo-500 rounded-full'}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-widest text-center">
            5Y Highlight: {formatCurrency(fiveYears)} potential value
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investment Options</h2>
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

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1]">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[#1A1932] font-black text-xs uppercase tracking-widest mb-2">Savings Connection</p>
              <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                Invest {formatCurrency(monthly)}/month and this could become{' '}
                <span className="text-emerald-500 font-bold">{formatCurrency(fiveYears)}</span> in 5 years with steady investing.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Investments
