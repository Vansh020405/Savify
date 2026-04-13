import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from './BottomNav'
import AddExpenseModal from './AddExpenseModal'
import { PencilTextureFilter } from './HandDrawnIcon'

const Layout = ({ children, hideNav }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="compact-app min-h-screen max-w-md mx-auto bg-[#F8F9FB] relative pb-20 shadow-2xl overflow-x-hidden">
      <PencilTextureFilter />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
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
