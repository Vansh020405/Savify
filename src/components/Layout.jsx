import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from './BottomNav'
import AddExpenseModal from './AddExpenseModal'
import { PencilTextureFilter } from './HandDrawnIcon'

const Layout = ({ children, hideNav }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 relative pb-24 shadow-2xl">
      <PencilTextureFilter />
      {/* Background Gradients/Decorations */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-indigo-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[-20%] w-[250px] h-[250px] bg-purple-100/50 rounded-full blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {!hideNav && <BottomNav onAddClick={() => setIsModalOpen(true)} />}

      <AnimatePresence>
        {isModalOpen && (
          <AddExpenseModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Layout
