import { motion, AnimatePresence } from 'framer-motion'
import { Bell, TrendingUp, Info, TrendingDown, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Link } from 'react-router-dom'
import { HandDrawnIcon } from '../components/HandDrawnIcon'
import { totalPotentialSavings } from '../utils/nudgeEngine'

// Map nudge type → visual theme
const NUDGE_THEME = {
  warning: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    icon: 'bg-rose-100 text-rose-500',
    label: 'text-rose-600',
    badge: 'text-rose-500 bg-rose-100',
    dot: 'bg-rose-400',
  },
  alert: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    icon: 'bg-amber-100 text-amber-500',
    label: 'text-amber-700',
    badge: 'text-amber-600 bg-amber-100',
    dot: 'bg-amber-400',
  },
  good: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: 'bg-emerald-100 text-emerald-600',
    label: 'text-emerald-700',
    badge: 'text-emerald-600 bg-emerald-100',
    dot: 'bg-emerald-400',
  },
}

const Dashboard = () => {
  const { user, expenses, nudges } = useStore()
  
  const totalBalance = expenses
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0) - 
    expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const monthlySpend = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const recentExpenses = expenses.filter(e => e.type === 'expense').slice(0, 3)

  // Savings goal progress — avg across all goals
  const goals = useStore(state => state.goals)
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.current / g.target) * 100, 0) / goals.length)
    : 0

  // Weekly trend: this week vs prior week (for the red chip on monthly spend)
  const thisWeekSpend = expenses
    .filter(e => e.type === 'expense' && new Date(e.date) >= new Date(Date.now() - 7 * 86400000))
    .reduce((s, e) => s + e.amount, 0)
  const lastWeekSpend = expenses
    .filter(e => {
      const d = new Date(e.date)
      const now = Date.now()
      return e.type === 'expense' && d >= new Date(now - 14 * 86400000) && d < new Date(now - 7 * 86400000)
    })
    .reduce((s, e) => s + e.amount, 0)
  const weeklyDeltaPct = lastWeekSpend > 0
    ? Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100)
    : null

  const weeklyTrendLabel = weeklyDeltaPct !== null
    ? weeklyDeltaPct >= 0 ? `↑ ${weeklyDeltaPct}% vs last week` : `↓ ${Math.abs(weeklyDeltaPct)}% vs last week`
    : null
  const weeklyTrendColor = weeklyDeltaPct !== null && weeklyDeltaPct > 0 ? 'text-rose-500' : 'text-emerald-500'

  return (
    <div className="p-6 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-soft" />
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-tight flex items-center">
              Hey {user.name} <HandDrawnIcon name="wave" size={14} className="ml-1 opacity-60" />
            </span>
            <div className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-0.5 rounded-full w-fit mt-1 uppercase tracking-widest">GOLD MEMBER</div>
          </div>
        </div>
        <button className="relative p-2.5 bg-white rounded-full border border-slate-100 shadow-soft">
          <Bell size={18} className="text-secondary" />
          {nudges.filter(n => n.type === 'warning').length > 0 ? (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center">
            </span>
          ) : nudges.length > 0 ? (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
          ) : null}
        </button>
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-gradient rounded-[2.5rem] p-8 text-white mb-8 shadow-2xl shadow-indigo-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={140} />
        </div>
        <span className="text-white/60 text-[10px] font-black tracking-widest uppercase">Current Wealth</span>
        <div className="text-4xl font-extrabold mt-2 mb-8 tracking-tight font-headline">
          {user.currency}{totalBalance.toLocaleString()}
        </div>
        <div className="flex gap-4">
          <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-3 rounded-pill font-bold text-xs transition-colors border border-white/10 uppercase tracking-widest">
            Add Funds
          </button>
          <button className="flex-1 bg-white text-primary py-3 rounded-pill font-bold text-xs shadow-lg active:scale-95 transition-transform uppercase tracking-widest">
            Withdraw
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-neutral">
          <span className="text-secondary text-[10px] font-black uppercase tracking-widest">Monthly Spend</span>
          <div className="text-xl font-extrabold mt-1 text-slate-900">{user.currency}{monthlySpend.toLocaleString()}</div>
          {weeklyTrendLabel && (
            <div className={`mt-4 flex items-center gap-1 ${weeklyTrendColor} text-[9px] font-black`}>
              {weeklyDeltaPct > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span className="uppercase tracking-tighter">{weeklyTrendLabel}</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-neutral">
          <span className="text-secondary text-[10px] font-black uppercase tracking-widest">Avg Goal Progress</span>
          <div className="text-xl font-extrabold mt-1 text-slate-900">{avgGoalProgress}% There</div>
          <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${avgGoalProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-emerald-400 rounded-full shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Top Nudge Card */}
      <AnimatePresence mode="wait">
        {nudges.length > 0 && (() => {
          const top = nudges[0]
          const theme = NUDGE_THEME[top.type] || NUDGE_THEME.alert
          const trendLabel = top.trend
            ? top.trend.direction === 'up'
              ? `↑ Up ${top.trend.pct}% this week`
              : `↓ Down ${top.trend.pct}% this week`
            : null
          return (
            <Link to="/nudges" className="block mb-8" key={top.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[2rem] p-5 border border-slate-100 flex gap-4 items-center shadow-sm"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-slate-50">
                  <HandDrawnIcon name={top.icon || 'star'} size={24} className="text-primary opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest opacity-60">AI Smart Insight</span>
                    {trendLabel && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-primary">{trendLabel}</span>
                    )}
                  </div>
                  <p className="text-slate-900 font-bold text-sm leading-tight tracking-tight">{top.title}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 ml-2" />
              </motion.div>
            </Link>
          )
        })()}
      </AnimatePresence>

      {/* Transaction Feed Header */}
      <div className="mb-4 flex justify-between items-end px-1">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Your spending story</h3>
        <Link to="/transactions" className="text-primary text-[10px] font-black uppercase tracking-widest">View All</Link>
      </div>

      <div className="space-y-4">
        {recentExpenses.map((expense) => (
          <motion.div 
            key={expense.id}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-soft border border-neutral"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center shadow-sm text-slate-600">
                <HandDrawnIcon 
                  name={expense.category === 'Food' ? 'food' : expense.category === 'Shopping' ? 'shopping' : 'travel'} 
                  size={24} 
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm tracking-tight">{expense.title}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{expense.category} • TODAY</p>
              </div>
            </div>
            <p className="font-extrabold text-slate-900">-{user.currency}{expense.amount}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
