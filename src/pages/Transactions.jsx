import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Bell, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from '../components/HandDrawnIcon'
import { buildIntelligenceSnapshot } from '../utils/intelligenceEngine'

const Transactions = () => {
  const { user, expenses } = useStore()
  const [searchQuery, setSearchQuery] = useState('')

  // ── Computed metrics ──────────────────────────────────────────────────
  const allExpenses = expenses.filter(e => e.type === 'expense')
  const monthlyOutflow = allExpenses.reduce((s, e) => s + e.amount, 0)

  const now = Date.now()
  const thisWeekSpend = allExpenses
    .filter(e => new Date(e.date) >= new Date(now - 7 * 86400000))
    .reduce((s, e) => s + e.amount, 0)
  const lastWeekSpend = allExpenses
    .filter(e => {
      const d = new Date(e.date)
      return d >= new Date(now - 14 * 86400000) && d < new Date(now - 7 * 86400000)
    })
    .reduce((s, e) => s + e.amount, 0)
  const weeklyDelta    = thisWeekSpend - lastWeekSpend
  const weeklyDeltaPct = lastWeekSpend > 0 ? Math.round((weeklyDelta / lastWeekSpend) * 100) : null
  const trendUp        = weeklyDeltaPct !== null && weeklyDelta > 0

  // Max for bar scaling
  const barMax = Math.max(thisWeekSpend, lastWeekSpend, 1)
  const intelligence = buildIntelligenceSnapshot(expenses, user)
  const anomalyMap = intelligence.anomalies
  const anomalyCount = Object.keys(anomalyMap).length
  const activeSpendDays = new Set(allExpenses.map((e) => new Date(e.date).toDateString())).size
  const averageDailySpend = activeSpendDays > 0 ? Math.round(monthlyOutflow / activeSpendDays) : 0

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return expenses
    return expenses.filter((exp) => {
      const titleMatch = (exp.title || '').toLowerCase().includes(query)
      const categoryMatch = (exp.category || '').toLowerCase().includes(query)
      return titleMatch || categoryMatch
    })
  }, [expenses, searchQuery])

  const groupedExpenses = filteredExpenses.reduce((acc, exp) => {
    const date = new Date(exp.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!acc[date]) acc[date] = []
    acc[date].push(exp)
    return acc
  }, {})

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
          <span className="text-secondary text-xs font-bold uppercase tracking-tight flex items-center">
            Hey {user.name} <HandDrawnIcon name="wave" size={14} className="ml-1 opacity-60" />
          </span>
        </div>
        <Bell size={20} className="text-secondary" />
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Transactions</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-50 relative overflow-hidden">
          <span className="text-secondary text-[10px] font-black uppercase tracking-widest block mb-1">Monthly Outflow</span>
          <div className="text-2xl font-black text-slate-900">{user.currency}{monthlyOutflow.toLocaleString()}</div>
        </div>
        <div className={`rounded-3xl p-5 border text-white ${
          intelligence.predictions.weeklyDeltaPct !== null && intelligence.predictions.weeklyDeltaPct > 0
            ? 'bg-rose-500 border-rose-400 shadow-xl shadow-rose-100'
            : 'bg-indigo-500 border-indigo-400 shadow-xl shadow-indigo-100'
        }`}>
          <span className="text-white/70 text-[10px] font-black uppercase tracking-widest block mb-1">AI Forecast</span>
          <div className="text-sm font-black leading-tight">
            Avg Daily: {user.currency}{averageDailySpend.toLocaleString()}
          </div>
          <div className="text-[11px] font-bold text-white/90 mt-1">
            Predicted Next Week: {user.currency}{intelligence.predictions.predictedNextWeekSpend.toLocaleString()}
          </div>
        </div>
      </div>

      {anomalyCount > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <p className="text-xs font-bold text-amber-800">{anomalyCount} unusual transaction{anomalyCount > 1 ? 's' : ''} detected this cycle. Review flagged entries below.</p>
        </div>
      )}

      {/* Weekly Comparison Strip */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-50 mb-8 relative overflow-hidden">
        <div className="flex justify-between items-start mb-8">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Weekly Comparison</span>
          {weeklyDeltaPct !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              trendUp ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {trendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                {trendUp ? '+' : ''}{weeklyDeltaPct}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-50">Spending This Week</p>
            <div className="flex items-baseline gap-1.5">
               <span className="text-3xl font-black text-[#1A1932] tracking-tighter">{user.currency}{thisWeekSpend.toLocaleString()}</span>
               <div className={`w-2 h-2 rounded-full ${trendUp ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} />
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Last Week</p>
            <p className="text-lg font-bold text-slate-300 tracking-tight">{user.currency}{lastWeekSpend.toLocaleString()}</p>
          </div>
        </div>
        
        <p className="mt-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
           {trendUp ? 'Spending is high 🍔' : 'Great saving 🥗'} vs last week
        </p>
      </div>

      {/* Pill Search Bar */}
      <div className="mb-8">
        <div className="bg-white rounded-pill border border-slate-100 px-6 flex items-center gap-3 shadow-soft">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full py-4 text-sm font-medium outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedExpenses).length === 0 ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-50/50 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No results</p>
            <p className="text-slate-400 text-[11px] mt-2">Try another title or category keyword.</p>
          </div>
        ) : Object.entries(groupedExpenses).map(([date, items]) => (
          <div key={date}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest">{date}</h3>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{items.length} ITEMS</span>
            </div>
            
            <div className="space-y-4">
              {items.map((exp) => (
                <motion.div 
                  key={exp.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-soft border border-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-slate-600">
                       <HandDrawnIcon 
                        name={exp.category === 'Food' ? 'coffee' : exp.category === 'Shopping' ? 'shopping' : 'travel'} 
                        size={24} 
                       />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm tracking-tight">{exp.title}</p>
                      <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{exp.category} • {new Date(exp.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      {anomalyMap[exp.id]?.isAnomaly && (
                        <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mt-1">Unusual spend detected</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={exp.type === 'income' ? 'font-black text-emerald-500' : 'font-black text-slate-900'}>
                      {exp.type === 'income' ? '+' : '-'}{user.currency}{exp.amount.toLocaleString()}
                    </p>
                    <ChevronRight size={16} className="text-slate-200" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Transactions
