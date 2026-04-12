import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SwitchGuidanceModal from './SwitchGuidanceModal'

const LOGO_MAP = {
  'Spotify': '/logos/spotify copy.svg',
  'Apple Music': '/logos/apple music.svg',
  'Amazon Prime': '/logos/amazon music.png',
  'YouTube Music': '/logos/youtube music.svg',
  'Gaana': '/logos/gaana.svg',
  'JioSaavn': '/logos/jio saavan.svg',
}

const LogoRenderer = ({ name }) => {
  if (LOGO_MAP[name]) {
    return (
      <img src={LOGO_MAP[name]} alt={name} className="w-full h-full object-contain drop-shadow-sm" />
    )
  }
  // Fallback for non-music/misc apps (Netflix, Swiggy, Uber, etc.)
  return (
    <span className="font-black text-xl text-slate-700 bg-slate-100 w-full h-full flex justify-center items-center rounded-2xl">{name.charAt(0)}</span>
  )
}

const SwitchNudgeCard = ({ nudge, onApply }) => {
  const [showGuidance, setShowGuidance] = useState(false)
  const switchInfo = nudge?.switchInfo || {
    from: 'Spotify',
    to: 'Apple Music',
    savings: 99,
  }

  const { from, to, savings } = switchInfo

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center"
      >
        <div className="flex items-center justify-center gap-6 mb-4 pt-2">
          {/* 'From' Logo */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-white overflow-hidden p-2"
          >
            <LogoRenderer name={from} />
          </motion.div>
          
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className="text-slate-300" size={20} />
          </motion.div>
          
          {/* 'To' Logo */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-md overflow-hidden p-2"
          >
            <LogoRenderer name={to} />
          </motion.div>
        </div>

        <p className="text-[#1A1932] font-bold text-sm tracking-tight mb-1">Switch to {to}</p>
        
        <div className="mb-5">
          <span className="text-emerald-500 font-black text-lg savings-glow">₹{savings} saved</span>
          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest block mt-0.5">every single month</span>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGuidance(true)}
          className="w-full bg-[#6366F1] text-white py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-600"
        >
          Switch & Save
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showGuidance && (
          <SwitchGuidanceModal 
            nudge={nudge}
            onClose={() => setShowGuidance(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default SwitchNudgeCard
