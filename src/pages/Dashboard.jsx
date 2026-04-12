import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Bell, Wallet, Flag, Lightbulb, Coffee, ShoppingBag, Plus, ChevronRight, ArrowRight, Menu, Bot } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Link } from 'react-router-dom'
import { HandDrawnIcon } from '../components/HandDrawnIcon'
import SwitchNudgeCard from '../components/SwitchNudgeCard'
import AddIncomeModal from '../components/AddIncomeModal'
import { useAIDailyInsight } from '../hooks/useAI'

const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString(undefined, { minimumFractionDigits: 0 })
  )

  useEffect(() => {
    spring.set(parseFloat(value.replace(/,/g, '')))
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

const Dashboard = () => {
  const { user, expenses, nudges, appliedMonthlySavings, applyNudge } = useStore()
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false)
  const { insight: aiDailyInsight, loading: aiLoading } = useAIDailyInsight(expenses, user)
  
  // Dynamic Balance Computation
  const currentMonth = new Date().getMonth()
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
  
  // Calculate total spent *this month*
  const totalSpentMonth = expenses.filter(e => {
    if (e.type !== 'expense') return false
    const d = new Date(e.date)
    return d.getMonth() === currentMonth
  }).reduce((sum, e) => sum + e.amount, 0)
  
  // Available Balance is total income minus ALL expenses 
  const totalSpentAll = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const remainingMonthBalance = Math.max(0, user.income - totalSpentMonth)
  
  const displayWealth = Math.max(0, totalIncome - totalSpentAll).toString()
  const displaySpend = totalSpentMonth.toString()
  const displayRemaining = remainingMonthBalance.toString()

  const monthlyIncome = user.income || totalIncome // fallback
  const percentUsed = monthlyIncome > 0 ? Math.round((totalSpentMonth / monthlyIncome) * 100) : 0
  
  const topNudge = nudges.length > 0 ? nudges[0] : null
  
  const recentExpenses = [
    { id: '1', title: 'Blue Tokai Coffee', time: '10:45 AM', amount: '340', icon: Coffee },
    { id: '2', title: 'Uniqlo India', time: 'Work hour', amount: '2490', icon: ShoppingBag }
  ]

  return (
    <div className="bg-[#F8F9FB] min-h-screen p-5 pb-32 font-inter selection:bg-indigo-100">
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-white shadow-sm border border-slate-50 rounded-2xl flex items-center justify-center overflow-hidden"
          >
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Profile" className="w-full h-full object-cover" />
          </motion.div>
          
          <div className="flex flex-col">
            <p className="text-[#3B3A5A] font-black text-sm tracking-tight">
              Hey {user.name} 
            </p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Premium Plan</p>
          </div>
        </div>
        <button className="text-[#76758B] p-1">
          <div className="relative">
            <Bell size={18} strokeWidth={2.5} />
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-0 right-0 w-2 h-2 bg-[#FF5A5F] border-2 border-[#F8F9FB] rounded-full"
            />
          </div>
        </button>
      </div>

      {/* Main Insight Card - Intelligent Direct Action */}
      {topNudge ? (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white border border-rose-100/50 rounded-[2rem] p-5 mb-6 shadow-sm flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex border border-rose-100 items-center justify-center shrink-0">
               <Lightbulb size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">AI Recommendation</p>
              <p className="text-slate-900 font-bold text-sm leading-tight tracking-tight">
                {topNudge.title == 'Switch Suggestion' ? topNudge.description : `You're spending too much on ${topNudge.category}. Switch to a cheaper alternative.`}
              </p>
            </div>
          </div>
          <Link to="/nudges" className="w-full mt-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
             Fix This <ArrowRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <motion.div className="bg-emerald-50 border border-emerald-100/50 rounded-[2rem] p-5 mb-6 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Flag size={20} strokeWidth={2.5} />
             </div>
             <div>
                <p className="text-emerald-800 font-bold text-sm">Finances Optimized</p>
                <p className="text-emerald-600/80 text-[10px] font-black uppercase tracking-widest">No action needed</p>
             </div>
           </div>
        </motion.div>
      )}

      {/* Unified Economy Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#6366F1] rounded-[2.5rem] p-6 text-white mb-6 shadow-2xl shadow-indigo-200/50 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        {/* Total Wealth */}
        <div className="mb-8 flex justify-between items-start relative z-10 w-full">
           <div>
             <span className="text-white/70 text-[10px] font-black tracking-[0.15em] uppercase mb-1 block">Total Balance</span>
             <div className="text-4xl font-black tracking-tighter flex items-center">
                <span className="text-2xl mr-1 opacity-80">₹</span>
                <AnimatedNumber value={displayWealth} />
             </div>
           </div>
           
           <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAddIncomeOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
            >
              <Plus strokeWidth={3} size={20} />
            </motion.button>
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-2 gap-4 relative z-10 bg-indigo-900/40 p-4 rounded-3xl">
           <div>
              <span className="text-white/60 text-[9px] font-black tracking-widest uppercase mb-1 block">Spent Month</span>
              <div className="text-lg font-bold tracking-tight">
                ₹<AnimatedNumber value={displaySpend} />
              </div>
           </div>
           <div>
              <span className="text-white/60 text-[9px] font-black tracking-widest uppercase mb-1 block">Remaining</span>
              <div className="text-lg font-bold tracking-tight">
                ₹<AnimatedNumber value={displayRemaining} />
              </div>
           </div>
        </div>

        {/* Saved via nudges connection */}
        {appliedMonthlySavings > 0 && (
           <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-100 py-2.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
             <Bot size={14} /> Saved via Nudges: ₹{appliedMonthlySavings.toLocaleString()}
           </div>
        )}
      </motion.div>

      {/* Suggested Investment Router - Active Growth Connection */}
      {appliedMonthlySavings > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black text-[#1A1932] uppercase tracking-[0.15em]">Grow Savings</h3>
          </div>
          <Link to="/investments" className="block bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm active:scale-95 transition-all">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                      <TrendingUp size={20} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-[#1A1932] font-bold text-sm tracking-tight">Invest your savings</p>
                      <p className="text-slate-400 text-xs font-medium">Turn ₹{appliedMonthlySavings.toLocaleString()} into wealth</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
             </div>
          </Link>
        </div>
      )}

      {/* Spending Story Header */}
      <div className="mb-4 flex justify-between items-center px-2">
        <h3 className="text-sm font-black text-[#1A1932] uppercase tracking-[0.15em]">Activity</h3>
        <Link to="/transactions" className="text-[#6366F1] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group">
          View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {recentExpenses.map((expense) => (
          <motion.div 
            key={expense.id} 
            whileHover={{ x: 4 }}
            className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
                <expense.icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p className="font-bold text-[#1A1932] text-xs">{expense.title}</p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{expense.time}</p>
              </div>
            </div>
            <p className="font-extrabold text-[#1A1932] text-sm">-₹{expense.amount}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
