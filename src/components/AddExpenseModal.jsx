import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from './HandDrawnIcon'


const AddExpenseModal = ({ onClose }) => {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [detectedCategory, setDetectedCategory] = useState(null)
  const { addExpense, expenses } = useStore()

  // Calculate current savings
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalSpent = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const currentSavings = totalIncome - totalSpent
  const newSavings = currentSavings - parseFloat(amount || '0')

  const CATEGORY_KEYWORDS = {
    Food: ['swiggy', 'zomato', 'food', 'lunch', 'dinner', 'coffee', 'starbucks', 'maggi', 'restaurant', 'meal'],
    Travel: ['uber', 'ola', 'rapido', 'train', 'metro', 'petrol', 'fuel', 'auto', 'flight'],
    Shopping: ['amazon', 'flipkart', 'myntra', 'zara', 'shopping', 'clothes', 'shoes', 'gadget'],
    Bills: ['recharge', 'electricity', 'rent', 'wifi', 'subscription', 'broadband', 'jio']
  }

  const handleNoteChange = (val) => {
    setNote(val)
    const lowerVal = val.toLowerCase()
    
    let found = null
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => lowerVal.includes(keyword))) {
        found = cat
        break
      }
    }

    if (found) {
      setSelectedCategory(found)
      setDetectedCategory(found)
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
        className="w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Expense</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="flex flex-col items-center mb-10">
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
            
            {/* Direct Impact Metric (No box) */}
            <AnimatePresence>
              {amount && parseFloat(amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex flex-col items-center"
                >
                  <p className="text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Impact Detected</p>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">New Savings</p>
                      <p className="text-lg font-black text-[#1A1932]">₹{Math.max(0, newSavings).toLocaleString()}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Goal Delay</p>
                      <p className="text-lg font-black text-rose-600">
                        +{Math.ceil(parseFloat(amount) / ((useStore.getState().user.income * 0.2) / 30))} Days
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[#1A1932] font-black text-xs text-center px-4">
                    {parseFloat(amount) > 5000 ? "This choice heavily delays your future 🚧" : "A quick breath before you spend? 😊"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-10 relative">
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

          <div className="flex flex-col gap-3">
            <button 
              type="submit"
              className="w-full btn-primary text-sm py-4"
            >
              Confirm Purchase
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors"
            >
              Wait, I'll pass
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddExpenseModal
