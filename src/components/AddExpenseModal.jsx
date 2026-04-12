import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from './HandDrawnIcon'
import { predictCategoryFromText } from '../utils/intelligenceEngine'


const AddExpenseModal = ({ onClose }) => {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [detectedCategory, setDetectedCategory] = useState(null)
  const { addExpense, expenses, user } = useStore()

  // Calculate current savings
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalSpent = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const currentSavings = totalIncome - totalSpent
  const inputAmount = parseFloat(amount || '0')
  const newSavings = currentSavings - inputAmount
  const savingsGoal = Number(user.savingsGoal) || 0

  const weeklyWindow = Date.now() - 7 * 86400000
  const thisWeekIncome = expenses
    .filter(e => e.type === 'income' && new Date(e.date).getTime() >= weeklyWindow)
    .reduce((s, e) => s + e.amount, 0)
  const thisWeekSpend = expenses
    .filter(e => e.type === 'expense' && new Date(e.date).getTime() >= weeklyWindow)
    .reduce((s, e) => s + e.amount, 0)
  const thisWeekSavings = thisWeekIncome - thisWeekSpend

  const goalDate = user.goalTargetDate ? new Date(user.goalTargetDate) : null
  const daysLeft = goalDate && goalDate.getTime() > Date.now() ? Math.ceil((goalDate.getTime() - Date.now()) / 86400000) : 0
  const recoverWindowDays = daysLeft > 0 ? Math.max(1, Math.min(30, daysLeft)) : 30
  const dailyRecoveryNeed = inputAmount > 0 ? Math.ceil(inputAmount / recoverWindowDays) : 0

  const activeCategory = selectedCategory
  const activeCategoryLower = activeCategory.toLowerCase()
  const weekCategoryCount = expenses.filter(e => {
    if (e.type !== 'expense') return false
    if (e.category !== activeCategory) return false
    return new Date(e.date).getTime() >= weeklyWindow
  }).length

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthCategorySpend = expenses.filter(e => {
    if (e.type !== 'expense') return false
    if (e.category !== activeCategory) return false
    return new Date(e.date).getTime() >= monthStart.getTime()
  }).reduce((s, e) => s + e.amount, 0)

  const progressIfSkip = savingsGoal > 0 ? Math.round((Math.max(0, currentSavings) / savingsGoal) * 100) : 0
  const progressIfSpend = savingsGoal > 0 ? Math.round((Math.max(0, newSavings) / savingsGoal) * 100) : 0
  const progressPointDifference = Math.max(0, progressIfSkip - progressIfSpend)
  const monthlySavingsPace = Math.max(1, (user.income || 0) * 0.2)
  const daysEarlierIfSkipped = inputAmount > 0 ? Math.ceil(inputAmount / (monthlySavingsPace / 30)) : 0
  const investedInOneYear = Math.round(inputAmount * 1.12)
  const hasRequiredInputs = inputAmount > 0 && note.trim().length > 0

  const ordinalSuffix = (n) => {
    const rem100 = n % 100
    if (rem100 >= 11 && rem100 <= 13) return `${n}th`
    switch (n % 10) {
      case 1:
        return `${n}st`
      case 2:
        return `${n}nd`
      case 3:
        return `${n}rd`
      default:
        return `${n}th`
    }
  }

  const handleNoteChange = (val) => {
    setNote(val)
    if (!val.trim()) {
      setDetectedCategory(null)
      return
    }

    const prediction = predictCategoryFromText({
      text: val,
      amount: inputAmount,
      timestamp: Date.now(),
      expenses,
    })

    if (prediction?.category) {
      setSelectedCategory(prediction.category)
      setDetectedCategory(`${prediction.category} (${Math.round((prediction.confidence || 0) * 100)}%)`)
    } else {
      setDetectedCategory(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount) return
    
    addExpense({
      title: note || selectedCategory,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date().toISOString(),
      type: 'expense'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-[75vh] max-h-[75vh] bg-white rounded-t-[3rem] p-8 pb-6 shadow-2xl relative flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Expense</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-1 pb-3">
            <div className="flex flex-col items-center mb-8">
              <span className="text-sm text-slate-400 font-medium uppercase tracking-widest mb-2">Enter Amount</span>
              <div className="flex items-center">
                <span className="text-4xl font-bold text-slate-900 mr-2">₹</span>
                <input 
                  type="number" 
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-5xl font-bold text-slate-900 w-full bg-transparent outline-none placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="mb-6 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest block">Add Note</span>
                {detectedCategory && (
                  <motion.span 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg"
                  >
                    Detected: {detectedCategory} ✨
                  </motion.span>
                )}
              </div>
              <input 
                type="text" 
                value={note}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="What was this for? (e.g. 250 swiggy)"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#6366F1]/20 outline-none font-medium transition-all"
              />
            </div>

            <AnimatePresence>
              {hasRequiredInputs && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 w-full"
                >
                  <div className="mb-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Smart Insight</p>
                    <p className="text-xs font-bold text-[#1A1932] leading-relaxed">
                      This will be your {ordinalSuffix(weekCategoryCount + 1)} {activeCategoryLower} expense this week.
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      You have already spent ₹{monthCategorySpend.toLocaleString()} on {activeCategoryLower} this month.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 w-full">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">If You Spend ₹{inputAmount.toLocaleString()}</p>
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-700 font-bold">Remaining balance: <span className="text-[#1A1932]">₹{Math.max(0, newSavings).toLocaleString()}</span></p>
                        <p className="text-xs text-slate-700 font-bold">Reduction in this week's savings: <span className="text-rose-600">₹{inputAmount.toLocaleString()}</span></p>
                        <p className="text-xs text-slate-700 font-bold">Extra effort to recover: <span className="text-rose-600">₹{dailyRecoveryNeed}/day</span> for {recoverWindowDays} days</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">If You Skip This</p>
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-700 font-bold">Money saved instantly: <span className="text-emerald-600">₹{inputAmount.toLocaleString()}</span></p>
                        <p className="text-xs text-slate-700 font-bold">Improved goal progress: <span className="text-emerald-600">+{progressPointDifference}%</span> vs spending</p>
                        <p className="text-xs text-slate-700 font-bold">Extra available savings: <span className="text-emerald-600">₹{inputAmount.toLocaleString()}</span></p>
                        <p className="text-xs text-slate-700 font-bold">Potentially reach goal earlier: <span className="text-emerald-600">~{daysEarlierIfSkipped} days</span></p>

                        <div className="mt-2 rounded-xl border border-emerald-200 bg-white/80 p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Investment Angle</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <TrendingUp size={14} className="text-emerald-600" />
                            <span>Skip this and invest ₹{inputAmount.toLocaleString()}</span>
                          </div>
                          <p className="text-emerald-700 text-lg font-black mt-1">₹{investedInOneYear.toLocaleString()} in 1 year</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[#1A1932] font-black text-xs text-center px-4">Better choice: Skip this today and stay on track</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
            <button 
              type="submit"
              className="w-full btn-primary text-sm py-4"
            >
              Continue Anyway
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
            >
              Avoid This Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddExpenseModal
