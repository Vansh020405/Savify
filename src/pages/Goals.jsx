import { motion } from 'framer-motion'
import { Plus, Bell } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from '../components/HandDrawnIcon'

const Goals = () => {
  const { user, goals } = useStore()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
          <span className="text-slate-400 text-xs font-bold flex items-center">
            Hey {user.name} <HandDrawnIcon name="wave" size={14} className="ml-1 opacity-60" />
          </span>
        </div>
        <Bell size={20} className="text-slate-400" />
      </div>

      <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Your Goals</h1>
      <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-8 uppercase tracking-widest flex items-center gap-2">
         <HandDrawnIcon name="star" size={10} /> YOU'RE 30% THERE <HandDrawnIcon name="star" size={10} />
      </div>

      <div className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100
          
          return (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-50 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-600">
                  <HandDrawnIcon name={goal.icon} size={32} />
                </div>
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{goal.category}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{goal.title}</h3>
              <p className="text-slate-400 text-xs font-medium mb-8">Planning the ultimate coastal getaway.</p>
              
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-900">{user.currency}{(goal.current / 1000).toFixed(0)}k</span>
                  <span className="text-slate-300 text-sm font-bold">/ {user.currency}{(goal.target / 1000).toFixed(0)}k</span>
                </div>
                <span className="text-sm font-black text-indigo-600">{progress.toFixed(0)}%</span>
              </div>
              
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary" 
                />
              </div>
            </motion.div>
          )
        })}

        {/* Add Goal Empty State */}
        <div className="bg-slate-100/50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-4">
              <Plus size={24} />
            </div>
            <p className="text-slate-400 font-bold text-sm mb-1">Dreaming of something else?</p>
            <p className="text-slate-300 text-xs">Create a new saving goal today.</p>
        </div>

        {/* Editorial Insight */}
        <div className="bg-primary-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden mt-8">
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest block mb-4">Editorial Digest</span>
            <h2 className="text-2xl font-black mb-4 leading-tight">The Art of the Small Win.</h2>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
               Saving is a narrative of consistency, not just the final total. Every ₹500 you set aside today is a page in your future story.
            </p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
               Read More
            </button>
        </div>
      </div>
    </div>
  )
}

export default Goals
