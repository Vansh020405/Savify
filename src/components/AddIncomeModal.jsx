import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const AddIncomeModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState('Salary')
  const [showSmartInsight, setShowSmartInsight] = useState(false)
  const [addedAmount, setAddedAmount] = useState(0)
  
  const addExpense = useStore(state => state.addExpense)

  const handleAdd = () => {
    if (!amount || isNaN(amount) || amount <= 0) return

    addExpense({
      title: source,
      amount: parseFloat(amount),
      category: 'Income',
      type: 'income',
      date: new Date().toISOString()
    })

    setAddedAmount(parseFloat(amount))
    setShowSmartInsight(true)
    setAmount('')
    
    // Auto-close insight after 4s
    setTimeout(() => {
      setShowSmartInsight(false)
      onClose()
    }, 4500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        {!showSmartInsight ? (
          <>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Plus size={24} strokeWidth={3} />
            </div>
            
            <h2 className="text-2xl font-black text-[#1A1932] mb-1">Add Money</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Boost your balance</p>
            
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-2xl font-black text-[#1A1932] outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="mb-8">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Source Type</label>
               <div className="grid grid-cols-2 gap-2">
                 {['Salary', 'Bonus', 'Gift', 'Other'].map(type => (
                   <button
                     key={type}
                     onClick={() => setSource(type)}
                     className={`py-3 rounded-xl text-xs font-bold transition-colors ${source === type ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                   >
                     {type}
                   </button>
                 ))}
               </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="w-full bg-[#1A1932] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Add To Balance
            </motion.button>
          </>
        ) : (
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center py-6"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
               <Sparkles size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-[#1A1932] mb-2">You received ₹{addedAmount}! 🎉</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
              Consider saving or investing this amount to reach your goals faster.
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
            >
              Got it
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default AddIncomeModal
