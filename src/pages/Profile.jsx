import { motion } from 'framer-motion'
import { Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

const ProfileItem = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-soft border border-slate-50 active:bg-slate-50 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <p className="font-bold text-slate-900 text-sm">{value}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-200" />
  </div>
)

const Profile = () => {
  const { user } = useStore()

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Profile</h1>

      {/* User Info */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-xl" />
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white">
            <Settings size={14} />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Savify Platinum Member</p>
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-50 mb-10 flex justify-around">
        <div className="text-center">
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest block mb-1">Income</span>
            <span className="text-lg font-black text-slate-900">₹{user.income.toLocaleString()}</span>
        </div>
        <div className="w-px h-10 bg-slate-100 self-center" />
        <div className="text-center">
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest block mb-1">Savings</span>
            <span className="text-lg font-black text-emerald-500">₹15,000</span>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        <ProfileItem 
          icon={CreditCard} 
          label="Payment Methods" 
          value="Primary: HDFC Bank" 
          color="bg-indigo-50 text-indigo-500" 
        />
        <ProfileItem 
          icon={Shield} 
          label="Security" 
          value="FaceID + PIN" 
          color="bg-purple-50 text-purple-500" 
        />
        <ProfileItem 
          icon={HelpCircle} 
          label="Contact Support" 
          value="24/7 Priority" 
          color="bg-amber-50 text-amber-500" 
        />
      </div>

      <button className="w-full mt-10 p-5 rounded-[2rem] bg-rose-50 text-rose-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
        <LogOut size={18} />
        Logout Session
      </button>
    </div>
  )
}

export default Profile
