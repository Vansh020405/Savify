import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Wallet, GraduationCap } from 'lucide-react'

const SignUp = () => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [income, setIncome] = useState('')
  const [isStudent, setIsStudent] = useState(false)
  const [currentBalance, setCurrentBalance] = useState('')
  const [includesSalary, setIncludesSalary] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [pendingSignupData, setPendingSignupData] = useState(null)
  const [musicApp, setMusicApp] = useState('Spotify')
  const [paysOttSeparately, setPaysOttSeparately] = useState('yes')
  const [spendPreference, setSpendPreference] = useState('food')
  const completeOnboarding = useStore(state => state.completeOnboarding)
  const setUser = useStore(state => state.setUser)
  const addExpense = useStore(state => state.addExpense)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !password || (!income && !isStudent)) return
    
    const numIncome = Number(income) || 0
    const numBalance = Number(currentBalance) || 0

    let finalInitialBalance = numBalance
    if (!includesSalary && numIncome > 0) {
      finalInitialBalance += numIncome
    }

    setPendingSignupData({
      name,
      password,
      income: numIncome,
      isStudent,
      finalInitialBalance,
    })
    setShowSurvey(true)
  }

  const handleSurveySubmit = (e) => {
    e.preventDefault()
    if (!pendingSignupData) return

    setUser({
      name: pendingSignupData.name,
      password: pendingSignupData.password,
      income: pendingSignupData.income,
      isStudent: pendingSignupData.isStudent,
      preferences: {
        musicApp,
        paysOttSeparately: paysOttSeparately === 'yes',
        spendPreference,
      },
    }, true)

    // Log the initial calculated balance
    if (pendingSignupData.finalInitialBalance > 0) {
      addExpense({
        title: 'Initial Balance + Salary',
        amount: pendingSignupData.finalInitialBalance,
        category: 'Income',
        type: 'income',
        date: new Date().toISOString()
      })
    }

    completeOnboarding()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 flex flex-col p-5 items-center justify-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-white p-6 rounded-[2.2rem] shadow-sm border border-slate-100 mt-4"
      >
        <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
          <Wallet size={28} />
        </div>
        
        <h1 className="text-2xl font-black mb-1.5 tracking-tight">Sign Up</h1>
        <p className="text-slate-500 font-medium mb-6 text-sm">Welcome to your smart financial assistant.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Alex"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Monthly Income</label>
            <input 
              type="number" 
              required
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="₹0"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Current Account Balance</label>
            <input 
              type="number" 
              required
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="₹0"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 p-1">
             <button
              type="button"
              onClick={() => setIncludesSalary(!includesSalary)}
              className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${includesSalary ? 'bg-[#6366F1]' : 'bg-slate-200'}`}
             >
               <motion.div 
                 animate={{ x: includesSalary ? 18 : 3 }}
                 className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
               />
             </button>
             <p className="text-slate-500 font-bold text-xs">Does this balance include your monthly salary?</p>
          </div>
          
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isStudent ? 'bg-indigo-100 text-[#6366F1]' : 'bg-white text-slate-300 border border-slate-100'}`}>
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-[#1A1932] font-bold text-xs">Are you a student?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsStudent(!isStudent)}
              className={`w-12 h-6 shrink-0 rounded-full relative transition-colors ${isStudent ? 'bg-[#6366F1]' : 'bg-slate-200'}`}
            >
              <motion.div 
                animate={{ x: isStudent ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#6366F1] text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-2xl active:scale-95 transition-transform mt-2 shadow-lg shadow-indigo-100"
          >
            Continue
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-slate-400">
          Already have an account? <Link to="/signin" className="text-indigo-500">Sign In</Link>
        </p>
      </motion.div>

      {showSurvey && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm p-6 flex items-center justify-center z-50">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm bg-white p-7 rounded-[2rem] shadow-xl border border-slate-100"
          >
            <h2 className="text-xl font-black mb-1 tracking-tight text-[#1A1932]">Quick Personalization</h2>
            <p className="text-slate-500 text-xs font-medium mb-6">Answer 3 questions so Savify can suggest better app-switch nudges.</p>

            <form onSubmit={handleSurveySubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Which music app do you use?</label>
                <select
                  value={musicApp}
                  onChange={(e) => setMusicApp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3.5 font-bold text-sm outline-none focus:border-indigo-500 transition-colors"
                >
                  <option>Spotify</option>
                  <option>Apple Music</option>
                  <option>YouTube Music</option>
                  <option>Gaana</option>
                  <option>JioSaavn</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Do you pay for all OTTs separately?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaysOttSeparately('yes')}
                    className={`rounded-xl py-3 text-xs font-black uppercase tracking-wider border transition-colors ${paysOttSeparately === 'yes' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaysOttSeparately('no')}
                    className={`rounded-xl py-3 text-xs font-black uppercase tracking-wider border transition-colors ${paysOttSeparately === 'no' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Do you like spending more on food or shopping?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpendPreference('food')}
                    className={`rounded-xl py-3 text-xs font-black uppercase tracking-wider border transition-colors ${spendPreference === 'food' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                  >
                    Food
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpendPreference('shopping')}
                    className={`rounded-xl py-3 text-xs font-black uppercase tracking-wider border transition-colors ${spendPreference === 'shopping' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                  >
                    Shopping
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#6366F1] text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-2xl active:scale-95 transition-transform mt-2 shadow-lg shadow-indigo-100"
              >
                Create Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SignUp
