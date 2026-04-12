import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Wallet, Target, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const slides = [
  {
    title: "Track money without stress",
    description: "We believe finance should feel like a deep breath. Savify handles the heavy lifting so you can focus on living.",
    icon: Wallet,
    color: "bg-indigo-600"
  },
  {
    title: "Set smart saving goals",
    description: "Whether it's a Goa trip or a new laptop, we'll help you reach your dreams faster with automated insights.",
    icon: Target,
    color: "bg-purple-600"
  },
  {
    title: "Rule-based AI nudges",
    description: "Get personalized reminders to spend less on things that don't matter and more on what does.",
    icon: Sparkles,
    color: "bg-indigo-700"
  }
]

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const completeOnboarding = useStore(state => state.completeOnboarding)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      completeOnboarding()
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className={`min-h-screen ${slide.color} text-white flex flex-col p-8 transition-colors duration-500`}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          key={currentSlide}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-48 h-48 bg-white/10 rounded-3xl flex items-center justify-center mb-12 backdrop-blur-md border border-white/20"
        >
          <slide.icon size={80} className="text-white" />
        </motion.div>

        <motion.h1
          key={`h1-${currentSlide}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-6"
        >
          {slide.title}
        </motion.h1>

        <motion.p
          key={`p-${currentSlide}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-lg leading-relaxed px-4"
        >
          {slide.description}
        </motion.p>
      </div>

      <div className="pb-12 space-y-8">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} 
            />
          ))}
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleNext}
            className="w-full bg-white text-indigo-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
          >
            {currentSlide === slides.length - 1 ? 'Start Saving Smarter' : 'Next'}
            <ArrowRight size={20} />
          </button>
          
          <button 
            onClick={completeOnboarding}
            className="w-full py-2 text-white/50 font-bold text-sm tracking-widest uppercase"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
