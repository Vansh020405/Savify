import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { HandDrawnIcon } from './HandDrawnIcon'

const categories = [
  { id: 'Food', icon: 'food', color: 'bg-orange-100 text-orange-600' },
  { id: 'Travel', icon: 'travel', color: 'bg-blue-100 text-blue-600' },
  { id: 'Shopping', icon: 'shopping', color: 'bg-pink-100 text-pink-600' },
  { id: 'Bills', icon: 'receipt', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'Other', icon: 'star', color: 'bg-slate-100 text-slate-600' },
]

const AddExpenseModal = ({ onClose }) => {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Food')
  const [note, setNote] = useState('')
  const addExpense = useStore(state => state.addExpense)

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

        <form onSubmit={handleSubmit}>
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

          <div className="mb-8">
            <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4 block">Select Category</span>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  <HandDrawnIcon name={cat.icon} size={20} />
                  <span className="font-semibold text-sm">{cat.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-4 block">Add Note</span>
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for?"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full btn-primary text-lg"
          >
            Add Expense
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default AddExpenseModal
