import { motion, AnimatePresence } from 'framer-motion'
import { Bell, RefreshCw, ChevronLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from '../components/HandDrawnIcon'
import { totalPotentialSavings } from '../utils/nudgeEngine'
import { Link } from 'react-router-dom'

const NudgeCard = ({ nudge, index, onDismiss }) => {
  return (
    <motion.div
      key={nudge.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-slate-50 text-2xl">
          <HandDrawnIcon name={nudge.icon || 'star'} size={24} className="text-primary opacity-80" />
        </div>
        <div className="flex-1">
          <h3 className="text-[17px] font-black text-slate-900 leading-tight mb-1">{nudge.title}</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">{nudge.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="flex-1 py-3.5 px-6 rounded-full bg-primary-gradient text-white font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          Accept
        </button>
        <button
          onClick={() => onDismiss(nudge.id)}
          className="flex-1 py-3.5 px-6 rounded-full bg-slate-50 text-slate-500 font-bold text-sm active:scale-95 transition-all"
        >
          Ignore
        </button>
      </div>
    </motion.div>
  )
}

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner">
      <HandDrawnIcon name="star" size={40} />
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">System All Green</h3>
    <p className="text-slate-400 text-sm font-medium px-12 leading-relaxed">No red flags detected. Your behavioral patterns are currently optimal for wealth growth.</p>
  </motion.div>
)

const Nudges = () => {
  const { user, nudges, dismissNudge, refreshNudges } = useStore()
  const totalSavings = totalPotentialSavings(nudges)

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Fixed Header */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-50">
        <div className="flex justify-between items-center px-6 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-soft">
              <img className="w-full h-full object-cover" src={user.avatar} alt="User" />
            </Link>
            <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">Smart Nudges</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
               onClick={refreshNudges}
               className="p-2 text-primary hover:bg-slate-50 rounded-full transition-colors"
            >
              <RefreshCw size={18} className="opacity-40" />
            </button>
            <button className="text-primary p-2 relative">
              <div className="bg-indigo-600 rounded-lg p-1.5 shadow-lg shadow-indigo-100 active:scale-95 transition-transform">
                <Bell size={18} className="text-white fill-white" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 pb-40 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-[2.5rem] p-10 bg-primary-gradient text-white shadow-2xl shadow-indigo-100"
          >
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">AI Insights</span>
              <h2 className="text-3xl font-black mt-3 leading-[1.15] tracking-tight">Your spending story is evolving.</h2>
              <p className="text-sm mt-5 opacity-80 max-w-[85%] font-medium leading-relaxed">
                We've identified {nudges.length} new ways to keep your wealth growing this month.
              </p>
            </div>
            {/* Decorative pattern */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-4 right-8 opacity-10">
               <HandDrawnIcon name="star" size={100} />
            </div>
          </motion.div>
        </section>

        {/* Nudge List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {nudges.length === 0 ? (
              <EmptyState />
            ) : (
              nudges.map((nudge, index) => (
                <NudgeCard
                  key={nudge.id}
                  nudge={nudge}
                  index={index}
                  onDismiss={dismissNudge}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        {totalSavings > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-[2rem] p-8 shadow-soft border border-slate-50"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-3">Total Potential Savings</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalSavings.toLocaleString()}</span>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black mb-1 flex items-center gap-1 border border-emerald-100/50">
                +12% <span className="text-[8px] opacity-70">VS LAST MONTH</span>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Bottom Nav Simulation - In real app this is in Layout.jsx, 
          but adding padding to ensure it fits the design if Layout isn't used here */}
    </div>
  )
}

export default Nudges
