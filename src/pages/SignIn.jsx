import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Wallet } from 'lucide-react'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const completeOnboarding = useStore(state => state.completeOnboarding)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock login, just let them in
    if (email && password) {
      completeOnboarding()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 flex flex-col p-8 items-center justify-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
      >
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
          <Wallet size={32} />
        </div>
        
        <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-slate-500 font-medium mb-8 text-sm">Sign in to sync your smart assistant.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#6366F1] text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl active:scale-95 transition-transform mt-4 shadow-lg shadow-indigo-100"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold text-slate-400">
          Don't have an account? <Link to="/signup" className="text-indigo-500">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default SignIn
