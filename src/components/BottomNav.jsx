import { Home, History, Plus, Target, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const BottomNav = ({ onAddClick }) => {
  const location = useLocation()
  
  const navItems = [
    { icon: Home, label: 'HOME', path: '/' },
    { icon: History, label: 'HISTORY', path: '/transactions' },
    { icon: null, label: '', path: '#' }, // Spacer for FAB
    { icon: Target, label: 'GOALS', path: '/goals' },
    { icon: User, label: 'PROFILE', path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 nav-blur px-8 pb-2 flex items-center justify-between z-40">
      {navItems.map((item, index) => {
        if (!item.icon) return <div key={index} className="w-12 h-12" />
        
        const isActive = location.pathname === item.path
        const Icon = item.icon
        
        return (
          <Link 
            key={index} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-primary scale-110" : "text-slate-400"
            )}
          >
            <div className={cn(
               "p-2 rounded-full transition-colors",
               isActive ? "bg-indigo-50" : "bg-transparent"
            )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
          </Link>
        )
      })}
      
      {/* FAB */}
      <button 
        onClick={onAddClick}
        className="absolute left-1/2 -top-6 -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 active:scale-90 transition-transform z-50 border-4 border-neutral"
      >
        <Plus size={32} />
      </button>
    </div>
  )
}

export default BottomNav
