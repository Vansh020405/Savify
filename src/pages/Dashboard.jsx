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
  const { user, expenses, nudges, applyNudge } = useStore()
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
  const displayWealth = Math.max(0, totalIncome - totalSpentAll).toString()
  
  const displaySpend = totalSpentMonth.toString()
  const monthlyIncome = user.income || totalIncome // fallback
  const percentUsed = monthlyIncome > 0 ? Math.round((totalSpentMonth / monthlyIncome) * 100) : 0
  
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

      {/* Wealth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#6366F1] rounded-[2.5rem] p-8 text-white mb-6 shadow-2xl shadow-indigo-200/50 flex flex-col items-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <span className="text-white/60 text-[9px] font-black tracking-[0.2em] uppercase mb-2">AVAILABLE BALANCE</span>
        <div className="text-[2.8rem] font-bold leading-none mb-8 tracking-tighter flex items-center">
          <span className="text-2xl mr-1.5 opacity-80">₹</span>
          <AnimatedNumber value={displayWealth} />
        </div>
        <div className="flex gap-4 w-full relative z-10">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddIncomeOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors shadow-inner"
          >
            <Plus strokeWidth={3} size={16} /> Add Money
          </motion.button>
        </div>
      </motion.div>

      {/* Monthly Spend Card (Redesigned) */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-[2rem] p-6 mb-4 shadow-sm border border-slate-50 flex flex-col gap-4 group"
      >
        <div className="flex justify-between items-start">
           <div>
             <p className="text-[#A1A1AA] text-[10px] font-black uppercase tracking-widest mb-1">Spent this month</p>
             <p className="text-[#1A1932] text-2xl font-bold tracking-tight">
               ₹<AnimatedNumber value={displaySpend} /> <span className="text-sm text-slate-300 font-medium tracking-normal">/ ₹{monthlyIncome.toLocaleString()}</span>
             </p>
           </div>
           <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
             <Wallet size={18} strokeWidth={2.5} />
           </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentUsed, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full relative ${percentUsed > 80 ? 'bg-rose-500' : 'bg-[#6366F1]'}`}
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
           <Lightbulb size={14} className={percentUsed > 80 ? "text-rose-500" : "text-[#6366F1]"} />
           {percentUsed > 80 ? "Your spending is slightly high." : `You've used ${percentUsed}% of your income.`}
        </div>
      </motion.div>

      

      {/* Nudges Carousel/List */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-black text-[#1A1932] uppercase tracking-[0.15em]">Suggestions</h3>
          <Link to="/nudges" className="text-[#6366F1] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
             Manage <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {nudges.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-6 text-center border border-slate-50 shadow-sm">
                 <p className="text-emerald-500 font-black text-xs uppercase tracking-widest">Growth Path Active</p>
              </div>
            ) : (
              nudges.slice(0, 4).map((nudge) => (
                <motion.div 
                  key={nudge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 relative group hover:shadow-md transition-all"
                >
                  {nudge.type === 'switch' ? (
                    <SwitchNudgeCard 
                      nudge={nudge} 
                      onApply={() => applyNudge(nudge.id)}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-[#6366F1]">
                        <HandDrawnIcon name={nudge.icon || 'star'} size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#1A1932] font-bold text-xs leading-tight mb-1">{nudge.title.split('→')[0]}</p>
                        <p className="text-emerald-500 font-black text-sm">₹{nudge.potentialSaving} savings</p>
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => applyNudge(nudge.id)}
                        className="bg-[#6366F1] text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                      >
                        Apply
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Smart Insight Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-[#FFFCE4]/60 rounded-[2.5rem] p-6 mb-6 border border-[#FFFBDB] relative overflow-hidden"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 bg-[#FFFBDB] rounded-2xl flex items-center justify-center text-[#997C00]">
            <Lightbulb size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[#997C00] text-[9px] font-black uppercase tracking-[0.2em]">Daily Insight</p>
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-violet-100 rounded-full">
                <Bot size={8} className="text-violet-600" />
                <span className="text-[7px] font-black text-violet-600 uppercase tracking-widest">AI</span>
              </div>
            </div>
            <p className={`text-[#1A1932] font-bold text-sm leading-relaxed transition-opacity ${aiLoading ? 'opacity-40' : 'opacity-100'}`}>
              {aiDailyInsight || 'Analyzing your spending patterns...'}
            </p>
          </div>
        </div>
        <Link to="/nudges">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white/80 py-3 rounded-2xl text-[#6366F1] font-black text-[10px] uppercase tracking-widest shadow-sm border border-slate-100/50 flex items-center justify-center gap-2"
          >
            View all {nudges.length} suggestions <ChevronRight size={14} />
          </motion.button>
        </Link>
      </motion.div>

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
