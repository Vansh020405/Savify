import React, { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  RefreshCw, 
  ChevronLeft, 
  Lightbulb, 
  Wallet, 
  ArrowRight, 
  ArrowRightLeft, 
  X, 
  Sparkles, 
  Check, 
  ChevronDown,
  Bot
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from '../components/HandDrawnIcon'
import { totalPotentialSavings } from '../utils/nudgeEngine'
import { Link, useNavigate } from 'react-router-dom'
import SwitchNudgeCard from '../components/SwitchNudgeCard'
import InvestmentSuggestion from '../components/InvestmentSuggestion'
import { useAINudge } from '../hooks/useAI'

const CompactNudgeCard = ({ nudge, onDismiss, onApply }) => {
  const isYellow = nudge.type === 'alert' || nudge.type === 'warning'
  const { aiText, loading: aiLoading } = useAINudge(nudge)
  
  // States: 'idle' | 'confirming' | 'applied'
  const [status, setStatus] = React.useState('idle')

  const handleApplyClick = () => setStatus('confirming')
  
  const handleConfirmYes = () => {
    setStatus('applied')
    // Delay store update so user sees it change to applied
    setTimeout(() => {
      onApply(nudge.id)
    }, 1500)
  }

  // Visual styling based on status
  const isApplied = status === 'applied'
  const cardBgClass = isApplied 
    ? 'bg-slate-50 border-slate-100 opacity-60 scale-[0.98]' 
    : isYellow ? 'bg-[#FFFCE4]/60 border-[#FFFBDB]' : 'bg-white border-slate-100 shadow-sm'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={isApplied ? {} : { scale: 1.01 }}
      className={`rounded-[2rem] p-5 mb-4 border flex items-start gap-4 transition-all duration-300 relative group ${cardBgClass}`}
    >
      <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl ${
        isApplied ? 'bg-slate-200 text-slate-400' : isYellow ? 'bg-[#FFFBDB] text-[#997C00]' : 'bg-indigo-50 text-[#6366F1]'
      }`}>
        {isApplied ? <Check size={24} /> : <HandDrawnIcon name={nudge.icon || 'star'} size={24} />}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <p className={`${isApplied ? 'text-slate-400' : isYellow ? 'text-[#CCB44F]' : 'text-[#6366F1]'} text-[11px] font-black uppercase tracking-[0.18em]`}>
              {nudge.type === 'switch' ? 'Optimize' : 'Insight'}
            </p>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isApplied ? 'bg-slate-200 text-slate-400' : 'bg-violet-50 text-violet-500'}`}>
              <Bot size={8} />
              <span className="text-[8px] font-black uppercase tracking-widest">AI</span>
            </div>
          </div>
          {!isApplied && status !== 'confirming' && (
            <button onClick={() => onDismiss(nudge.id)} className="text-slate-200 hover:text-slate-400 p-1">
              <X size={16} />
            </button>
          )}
        </div>
        
        <p className={`font-black text-[18px] leading-tight mb-2 ${isApplied ? 'text-slate-500 line-through' : 'text-[#1A1932]'}`}>
          {nudge.title.split('—')[0]}
        </p>

        {/* AI-enhanced description */}
        <p className={`text-[14px] leading-relaxed font-medium mb-3 transition-opacity ${isApplied ? 'text-slate-400' : 'text-slate-500'} ${aiLoading ? 'opacity-50' : 'opacity-100'}`}>
          {aiText}
        </p>

        <div className={`flex items-center gap-2 mb-4 ${isApplied ? 'opacity-50 filter grayscale' : ''}`}>
           <span className="text-emerald-500 font-black text-2xl savings-glow">Save ₹{nudge.potentialSaving || '400'}</span>
           
        </div>
        
        {/* Buttons State Machine */}
        <div className="mt-2">
          {status === 'idle' && (
            <div className="flex gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyClick}
                className="flex-1 bg-[#6366F1] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
              >
                Apply Fix
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => onDismiss(nudge.id)}
                className="px-5 bg-slate-50 text-slate-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Later
              </motion.button>
            </div>
          )}

          {status === 'confirming' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-100/50"
            >
              <p className="text-[#6366F1] font-bold text-xs text-center mb-3">Have you done this? 🤔</p>
              <div className="flex gap-2">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmYes}
                  className="flex-1 bg-[#6366F1] text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm"
                >
                  Yes, Done!
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatus('idle')}
                  className="px-4 bg-white text-slate-500 py-2.5 rounded-lg border border-slate-100 font-black text-[10px] uppercase tracking-widest"
                >
                  Not Yet
                </motion.button>
              </div>
            </motion.div>
          )}

          {status === 'applied' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full bg-emerald-100/50 text-emerald-600 border border-emerald-200/50 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Check size={14} strokeWidth={3} /> Applied
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const Nudges = () => {
  const { user, nudges, dismissNudge, applyNudge, refreshNudges, appliedMonthlySavings, appliedNudges, lastAppliedNudge } = useStore()
  const navigate = useNavigate()
  const totalSavings = totalPotentialSavings(nudges)
  const [expandedNudgeId, setExpandedNudgeId] = React.useState(null)
  const [showToast, setShowToast] = React.useState(false)

  React.useEffect(() => {
    if (lastAppliedNudge) {
      setShowToast(true)
      const timer = setTimeout(() => setShowToast(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastAppliedNudge])

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32">
      {/* Compact Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#F8F9FB]/90 backdrop-blur-xl z-50 px-6 py-5 flex items-center justify-between">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-600"
        >
          <ChevronLeft size={20} />
        </motion.button>
        <h1 className="text-base font-black text-[#1A1932] uppercase tracking-[0.18em]">Optimization</h1>
        <motion.button 
          whileTap={{ rotate: 180 }}
          onClick={refreshNudges} 
          className="w-10 h-10 text-[#6366F1] flex items-center justify-center"
        >
          <RefreshCw size={18} />
        </motion.button>
      </header>

      <main className="pt-24 px-6 max-w-md mx-auto">
        {/* Savings Focus */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#6366F1] rounded-[2.5rem] p-8 text-white mb-10 shadow-2xl shadow-indigo-200 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-white/60 text-[11px] font-black tracking-[0.24em] uppercase mb-4">POTENTIAL GROWTH</span>
            <div className="text-4xl font-black mb-2 tracking-tighter">₹{totalSavings.toLocaleString()}</div>
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
               Next 30 Days <ArrowRight size={12} />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        </motion.div>

        <div className="space-y-4 mb-12">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.18em] mb-4 px-2">Active Nudges</h2>
          <AnimatePresence mode="popLayout">
            {nudges.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-500 shadow-inner">
                   <HandDrawnIcon name="star" size={32} />
                </div>
                <h3 className="text-sm font-black text-[#1A1932] opacity-60 uppercase tracking-widest">System Optimal</h3>
              </div>
            ) : (
              nudges.map((nudge) => {
                if (nudge.type === 'switch') {
                   return (
                     <motion.div 
                       key={nudge.id} 
                       layout
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -100 }}
                       className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 mb-4 group"
                     >
                        <SwitchNudgeCard nudge={nudge} onApply={() => applyNudge(nudge.id)} />
                     </motion.div>
                   )
                }
                return (
                  <CompactNudgeCard 
                    key={nudge.id} 
                    nudge={nudge} 
                    onDismiss={dismissNudge}
                    onApply={applyNudge}
                  />
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Applied Changes Section */}
        {appliedNudges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.18em] mb-6 px-2">Applied Optimizations</h2>
            <div className="space-y-3">
              {appliedNudges.map((nudge) => (
                <motion.div 
                  key={nudge.id}
                  layout
                  onClick={() => setExpandedNudgeId(expandedNudgeId === nudge.id ? null : nudge.id)}
                  className="bg-white/40 rounded-3xl p-5 border border-slate-100 shadow-sm transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                        <Check size={18} strokeWidth={3} />
                      </div>
                      <div>
                        <p className="font-black text-[#1A1932] text-sm mb-0.5">{nudge.title.split('→')[0]}</p>
                        <p className="text-emerald-500 font-extrabold text-xs">SAVE ₹{nudge.potentialSaving || 99} AMOUNT / MO</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedNudgeId === nudge.id ? 180 : 0 }}
                    >
                       <ChevronDown size={14} className="text-slate-300" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedNudgeId === nudge.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-slate-50"
                      >
                         <p className="text-slate-500 text-sm leading-relaxed font-medium">
                           {nudge.description}
                         </p>
                         <div className="mt-3 py-2 px-3 bg-emerald-50/50 rounded-xl inline-flex items-center gap-2">
                           <Sparkles size={12} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Growth Path Active</span>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Growth Tip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50/50 rounded-[2rem] p-6 mb-8 border border-indigo-100/50"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#6366F1] shadow-sm">
              <Lightbulb size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[#6366F1] text-[10px] font-black uppercase tracking-[0.18em] mb-1">Smart Tip</p>
              <p className="text-[#1A1932] font-bold text-sm leading-relaxed">
                Your saved money could grow by <span className="text-[#6366F1]">12% yearly</span> if invested in stocks instead of sitting idle.
              </p>
            </div>
          </div>
          <Link to="/investments">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="w-full bg-[#6366F1] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              Start Growing <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Investment Suggestion Layer */}
        <InvestmentSuggestion monthlySaving={appliedMonthlySavings} />
      </main>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && lastAppliedNudge && (
          <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-[#1A1932] text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-full max-w-sm pointer-events-auto"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <p className="font-extrabold text-sm mb-0.5 relative z-10">
                  Awesome! Optimization Applied 🎉
                </p>
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest relative z-10">
                  + ₹{lastAppliedNudge.potentialSaving || 0} Added to Monthly Savings
                </p>
              </div>
              
              {/* Confetti effect background blur block - just for styling vibe */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                 <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full mix-blend-screen" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Nudges
