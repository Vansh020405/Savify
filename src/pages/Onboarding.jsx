import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Wallet, Target, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    titleFirst: "Track money",
    titleColor: "without stress",
    description: "We believe finance should feel like a deep breath. Savify handles the heavy lifting so you can focus on living.",
    icon: Wallet,
    imgBg: "bg-[#4B857A]"
  },
  {
    titleFirst: "Set smart",
    titleColor: "saving goals",
    description: "Whether it's a Goa trip or a new laptop, we'll help you reach your dreams faster with automated insights.",
    icon: Target,
    imgBg: "bg-[#D68D6E]"
  },
  {
    titleFirst: "Rule-based",
    titleColor: "AI nudges",
    description: "Get personalized reminders to spend less on things that don't matter and more on what does.",
    icon: Sparkles,
    imgBg: "bg-[#6366F1]"
  }
]

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1932] flex flex-col p-8 transition-colors duration-500 overflow-hidden font-inter">
      {/* Top Graphic Container */}
      <div className="w-full flex justify-center mt-6 mb-10 h-[45%] min-h-[300px]">
        <motion.div
           key={`img-${currentSlide}`}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="w-full max-w-[320px] aspect-square bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center flex-col"
        >
           <div className={`w-full h-full rounded-[1.5rem] ${slide.imgBg} flex flex-col items-center justify-center relative overflow-hidden shadow-inner`}>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.2),transparent)]" />
              <slide.icon size={80} className="text-white drop-shadow-xl" strokeWidth={1.5} />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2"
              >
                 <Sparkles size={14} className="text-[#6366F1]" />
                 <span className="text-[10px] font-black tracking-widest text-[#6366F1] uppercase">Trending Up</span>
              </motion.div>
           </div>
        </motion.div>
      </div>

      {/* Text Content */}
      <div className="flex-1 flex flex-col items-start text-left w-full max-w-[320px] mx-auto">
        <motion.h1
          key={`h1-${currentSlide}`}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[2rem] leading-[1.1] font-bold mb-4 tracking-tight"
        >
          {slide.titleFirst}<br />
          <span className="text-[#6366F1]">{slide.titleColor}</span>
        </motion.h1>

        <motion.p
          key={`p-${currentSlide}`}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8 pr-4"
        >
          {slide.description}
        </motion.p>

        {/* Pagination Dots */}
        <div className="flex justify-start gap-1.5 mb-10 w-full">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-[#6366F1]' : 'w-1.5 bg-[#E2E8F0]'}`} 
            />
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="w-full mt-auto space-y-4 pb-6">
          <AnimatePresence mode="wait">
            {currentSlide < 2 ? (
              <motion.div
                key="next-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex-col flex items-center gap-6"
              >
                <button 
                  onClick={handleNext}
                  className="w-full bg-[#6366F1] hover:bg-[#4f46e5] transition-colors text-white font-bold py-4 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  Next
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setCurrentSlide(2)}
                  className="w-full py-2 text-slate-400 font-bold text-[10px] tracking-[0.15em] uppercase hover:text-slate-600 transition-colors"
                >
                  Skip for now
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="auth-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex-col flex gap-3"
              >
                <button 
                  onClick={() => navigate('/signup')}
                  className="w-full bg-[#6366F1] hover:bg-[#4f46e5] transition-colors text-white font-black text-sm tracking-widest uppercase py-4 rounded-[1.5rem] shadow-lg shadow-indigo-200"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => navigate('/signin')}
                  className="w-full bg-white border border-slate-100 text-[#1A1932] font-black text-sm tracking-widest uppercase py-4 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
