import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowRight, AppWindow, Download, UserPlus, CreditCard, Sparkles, GraduationCap, Lightbulb } from 'lucide-react'
import { useStore } from '../store/useStore'


const SUBSCRIPTION_DATA = [
  {
    name: "Spotify",
    category: "Music",
    plans: { student: 99, individual: 139, family: 229 },
    offer: "Student discount available",
    steps: ["Cancel Spotify Premium in account settings", "Wait for current cycle to end", "Export your playlists using Soundiiz"]
  },
  {
    name: "Apple Music",
    category: "Music",
    plans: { student: 59, individual: 119, family: 179 },
    offer: "Free Apple TV+ with student plan",
    steps: ["Download Apple Music app", "Sign in with Apple ID", "Choose Student or Individual plan", "Import your playlists"]
  },
  {
    name: "YouTube Music",
    category: "Music",
    plans: { student: 59, individual: 119, family: 149 },
    offer: "Included with YouTube Premium",
    steps: ["Open YouTube app", "Go to Premium section", "Join membership", "Access YouTube Music for free"]
  },
  {
    name: "Netflix",
    category: "Entertainment",
    plans: { mobile: 149, basic: 199, standard: 499, premium: 649 },
    offer: "No free tier",
    steps: ["Cancel current Netflix plan", "Switch to Mobile/Basic for lower cost", "Check Amazon Prime for included video"]
  },
  {
    name: "Amazon Prime",
    category: "Entertainment",
    plans: { monthly: 299, yearly: 1499 },
    offer: "Includes Prime Video + Music + Delivery",
    steps: ["Log in to Amazon", "Visit Prime section", "Start 30-day free trial"]
  },
  {
    name: "Swiggy",
    category: "Food",
    plans: { student: 0 },
    offer: "Swiggy One reductions",
    steps: ["Open Swiggy app", "Go to Account Settings", "Suspend Swiggy One auto-renew", "Uninstall app to reduce temptation"]
  },
  {
    name: "Home Cooking",
    category: "Food",
    plans: { student: 0 },
    offer: "Zero service tax or platform fees",
    steps: ["Buy groceries for the week", "Prepare ingredients for 2 days", "Use leftover recipes", "Track savings daily"]
  },
  {
    name: "Uber",
    category: "Transport",
    plans: { student: 0 },
    offer: "Peak pricing detected frequently",
    steps: ["Open Uber app", "Check current active Uber Pass", "Disable auto-renew", "Consider walking for < 1km"]
  },
  {
    name: "Public Transport",
    category: "Transport",
    plans: { student: 0 },
    offer: "Flat rates for all distances",
    steps: ["Download local Metro/Bus app", "Check nearest station route", "Buy a monthly pass for 30% discount", "Enjoy extra reading/music time"]
  }
]

const LOGO_MAP = {
  'Spotify': '/logos/spotify copy.svg',
  'Apple Music': '/logos/apple music.svg',
  'Amazon Prime': '/logos/amazon music.png',
  'YouTube Music': '/logos/youtube music.svg',
  'Gaana': '/logos/gaana.svg',
  'JioSaavn': '/logos/jio saavan.svg',
}

const LogoRenderer = ({ name, className = "w-6 h-6" }) => {
  if (LOGO_MAP[name]) {
    return (
      <img src={LOGO_MAP[name]} alt={name} className={`${className} object-contain`} />
    )
  }
  return null
}

const SwitchGuidanceModal = ({ nudge, onClose }) => {
  const { user, setUser, applyNudge } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isStudentLocal, setIsStudentLocal] = useState(user.isStudent)
  
  const fromName = nudge.switchInfo?.from || "Current App"
  const toName = nudge.switchInfo?.to || "Target App"
  const savings = nudge.switchInfo?.savings || nudge.potentialSaving
  
  const fromData = SUBSCRIPTION_DATA.find(s => s.name === fromName)
  const toData = SUBSCRIPTION_DATA.find(s => s.name === toName)

  // Guided Steps Construction
  const steps = [
    { 
      title: "Cancel Current", 
      desc: `Open ${fromName} and disable auto-renewal in settings.`,
      icon: X,
      color: "bg-rose-50 text-rose-500"
    },
    { 
      title: `Get ${toName}`, 
      desc: `Download ${toName} from the App Store or Play Store.`,
      icon: Download,
      color: "bg-blue-50 text-blue-500"
    },
    { 
      title: "Select Best Plan", 
      desc: isStudentLocal ? "Choose the Student Plan to save max!" : "Pick the plan that fits your needs.",
      icon: UserPlus,
      color: "bg-emerald-50 text-emerald-500"
    }
  ]

  const handleDone = () => {
    applyNudge(nudge.id)
    onClose()
  }

  const handleStudentToggle = () => {
    const newVal = !isStudentLocal
    setIsStudentLocal(newVal)
    setUser({ isStudent: newVal })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-md px-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white rounded-t-[3rem] shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 z-10">
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto w-full p-8 pb-4 hide-scrollbar">
          {/* Header Section */}
          <div className="text-center mb-10 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
               <div className="flex items-center gap-2 text-xl font-bold text-slate-300 line-through">
                 <LogoRenderer name={fromName} className="w-6 h-6 opacity-60" /> {fromName}
               </div>
               <ArrowRight className="text-[#6366F1]" size={18} />
               <div className="flex items-center gap-2 text-3xl font-black text-[#1A1932]">
                 <LogoRenderer name={toName} className="w-10 h-10 rounded-xl shadow-sm" /> {toName}
               </div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 rounded-full border border-emerald-100/50 shadow-sm">
              <span className="text-emerald-600 font-black text-sm">Save ₹{savings}/month</span>
              <Sparkles size={16} className="text-emerald-400" />
            </div>
          </div>

          {/* Student Detection Section */}
          <div className="mb-10 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isStudentLocal ? 'bg-indigo-100 text-[#6366F1]' : 'bg-white text-slate-300 border border-slate-100 shadow-sm'}`}>
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-[#1A1932] font-extrabold text-sm mb-0.5">Are you a student?</p>
                <p className="text-xs text-slate-400 font-medium tracking-tight">Extra savings available</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleStudentToggle}
              className={`w-14 h-7 rounded-full relative transition-colors shadow-inner ${isStudentLocal ? 'bg-[#6366F1]' : 'bg-slate-200'}`}
            >
              <motion.div 
                animate={{ x: isStudentLocal ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>

          {/* Guided Steps */}
          <div className="mb-10 overflow-hidden">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">How to Switch</p>
            <div className="space-y-6">
              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-5"
                >
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${step.color} text-xs font-black shadow-sm`}>
                    {idx + 1}
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-sm font-extrabold text-[#1A1932] mb-1">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Save More Section */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-[#6366F1] uppercase tracking-widest mb-4 px-1 flex items-center gap-2">Save Even More <Lightbulb size={14} className="text-[#6366F1]" /></h3>
            <div className="bg-indigo-50/50 rounded-[1.5rem] p-5 border border-indigo-100/50">
              {isStudentLocal && toData?.plans?.student && (
                <div className="flex items-center justify-between mb-4 last:mb-0">
                  <span className="text-xs font-extrabold text-slate-600">Student Plan Active</span>
                  <span className="text-sm font-black text-emerald-600">₹{toData.plans.student}/mo</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-4 last:mb-0">
                <span className="text-xs font-extrabold text-slate-600">Look for Free Trial</span>
                <span className="text-sm font-black text-emerald-600">1-3 Months</span>
              </div>
              {toData?.offer && (
                 <div className="mt-3 text-[11px] font-bold text-indigo-500 bg-white/80 px-3 py-2.5 rounded-xl flex items-center gap-2">
                   <Sparkles size={12} className="text-indigo-400" /> {toData.offer}
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Buttons - Sticky Bottom */}
        <div className="p-8 pt-4 bg-white border-t border-slate-50 flex flex-col gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleDone}
            className="w-full btn-primary text-sm py-4 rounded-2xl shadow-lg shadow-indigo-100/50"
          >
            Mark as Done & Save
          </motion.button>
          <button 
            onClick={onClose}
            className="w-full bg-slate-50 text-slate-400 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
          >
            Remind me later
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default SwitchGuidanceModal
