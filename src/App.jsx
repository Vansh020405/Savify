import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Profile from './pages/Profile'
import Nudges from './pages/Nudges'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Onboarding from './pages/Onboarding'
import Investments from './pages/Investments'
import InsuranceHome from './pages/InsuranceHome'
import InsuranceHabits from './pages/InsuranceHabits'
import InsurancePolicyDetail from './pages/InsurancePolicyDetail'
import PolicyAnalyzer from './pages/PolicyAnalyzer'
import { useStore } from './store/useStore'
import { useEffect } from 'react'

function App() {
  const { isOnboarded, checkAndAddMonthlySalary } = useStore()
  const location = useLocation()

  useEffect(() => {
    if (isOnboarded) {
      checkAndAddMonthlySalary()
    }
  }, [isOnboarded, checkAndAddMonthlySalary])

  if (!isOnboarded) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </AnimatePresence>
    )
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/nudges" element={<Nudges />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/insurance" element={<InsuranceHome />} />
          <Route path="/insurance/habits" element={<InsuranceHabits />} />
          <Route path="/insurance/:policyId" element={<InsurancePolicyDetail />} />
          <Route path="/policy-analyzer" element={<PolicyAnalyzer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
