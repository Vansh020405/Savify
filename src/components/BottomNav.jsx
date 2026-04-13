import { Home, History, Plus, TrendingUp, Shield } from 'lucide-react'
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
    { icon: Plus, label: '', path: null, isAction: true },
    { icon: TrendingUp, label: 'INVEST', path: '/investments' },
    { icon: Shield, label: 'INSURE', path: '/insurance' },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-[72px] bg-white border border-slate-100 px-2 flex items-center justify-around z-40 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      {navItems.map((item, index) => {
        if (item.isAction) {
          return (
            <button 
              key={index}
              onClick={onAddClick}
              className="w-12 h-12 bg-[#6366F1] rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-transform"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          )
        }

        const isActive = location.pathname === item.path
        const Icon = item.icon
        
        return (
          <Link 
            key={index} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all min-w-[56px]",
              isActive ? "text-[#6366F1]" : "text-[#76758B]"
            )}
          >
            <div className={cn(
               "p-2 rounded-full transition-colors",
               isActive ? "bg-indigo-50" : "bg-transparent"
            )}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[7px] font-black tracking-[0.05em] uppercase",
               isActive ? "text-[#6366F1]" : "text-[#A1A1AA]"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default BottomNav
