import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight, ShieldCheck, Zap, ChevronRight, Bot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateFutureValue } from '../utils/stockApi'
import { useAIInvestmentInsight } from '../hooks/useAI'

const STOCKS = [
  { name: 'Nifty 50 ETF', provider: 'Index Fund', icon: Zap, color: '#6366F1' },
  { name: 'Reliance Ind.', provider: 'Large Cap', icon: ShieldCheck, color: '#0056A1' },
]

const AnimatedValue = ({ value }) => {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (start === end) return
    
    let totalDuration = 1000
    let increment = end / (totalDuration / 16)
    
    let timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>₹{display.toLocaleString()}</span>
}

const InvestmentSuggestion = ({ monthlySaving }) => {
  if (!monthlySaving || monthlySaving === 0) return null

  // Growth estimates (12% CAGR)
  const threeYears = calculateFutureValue(monthlySaving, 3, 0.12)
  const fiveYears = calculateFutureValue(monthlySaving, 5, 0.12)
  
  const { insight: aiInsight, loading: aiLoading } = useAIInvestmentInsight(monthlySaving, threeYears, fiveYears)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 mb-12"
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-[10px] font-black text-[#1A1932] uppercase tracking-[0.2em]">Grow Your Savings 📈</h2>
        <Link to="/investments" className="text-[#6366F1] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
           View Dashboard <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Projection Card */}
      <div className="bg-[#1A1932] rounded-[2.5rem] p-8 text-white mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
           <TrendingUp size={120} strokeWidth={2.5} />
        </div>
        
        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">ESTIMATED FUTURE VALUE</p>
        
        <div className="grid grid-cols-2 gap-8 relative z-10">
          <div>
            <p className="text-white/40 text-[9px] font-bold uppercase mb-1">IN 3 YEARS</p>
            <div className="text-2xl font-black text-emerald-400 savings-glow transition-all">
              <AnimatedValue value={threeYears} />
            </div>
          </div>
          <div>
            <p className="text-white/40 text-[9px] font-bold uppercase mb-1">IN 5 YEARS</p>
            <div className="text-[2.2rem] font-black text-emerald-400 tracking-tighter savings-glow leading-none">
              <AnimatedValue value={fiveYears} />
            </div>
          </div>
        </div>

        {/* AI Insight Strip */}
        {aiInsight && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-start gap-2.5 bg-white/8 rounded-2xl p-3.5"
          >
            <div className="w-6 h-6 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={12} className="text-violet-300" />
            </div>
            <p className={`text-[11px] text-white/70 font-medium leading-relaxed transition-opacity ${aiLoading ? 'opacity-40' : 'opacity-100'}`}>
              {aiInsight}
            </p>
          </motion.div>
        )}

        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
           <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">historical average*</span>
           <Link to="/investments">
             <motion.button 
               whileTap={{ scale: 0.95 }}
               className="bg-[#6366F1] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
             >
                Start Investing
             </motion.button>
           </Link>
        </div>
      </div>

    </motion.div>
  )
}

export default InvestmentSuggestion
