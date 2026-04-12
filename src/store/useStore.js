import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateNudges } from '../utils/nudgeEngine'

const today = () => new Date().toISOString()
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

const initialExpenses = []

const initialUser = {
  name: 'Vansh',
  income: 50000,
  currency: '₹',
  savingsGoal: 15000,
  isStudent: false, // For smart scholarship/plan detection
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vansh',
  preferences: {
    musicApp: 'Spotify',
    paysOttSeparately: true,
    spendPreference: 'food',
  },
}

const syncToFirebase = (state) => {
  if (!state.user?.name) return
  fetch(`https://savify-a6546-default-rtdb.firebaseio.com/users/${state.user.name}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: state.user,
      expenses: state.expenses,
      appliedNudges: state.appliedNudges,
      appliedMonthlySavings: state.appliedMonthlySavings,
      lastSalaryMonth: state.lastSalaryMonth
    })
  }).catch(err => console.error("Firebase Sync Error:", err))
}

export const useStore = create(
  persist(
    (set, get) => ({
      user: initialUser,
      expenses: initialExpenses,
      goals: [],
      // Dynamic nudges — computed from engine, not static
      nudges: generateNudges(initialExpenses, initialUser, []),

      setUser: (userData, wipeLedger = false) => set((state) => {
        const updatedUser = { ...state.user, ...userData }
        const newExpenses = wipeLedger ? [] : state.expenses
        
        const newState = {
          user: updatedUser,
          expenses: newExpenses,
          nudges: generateNudges(newExpenses, updatedUser, wipeLedger ? [] : state.appliedNudges),
          appliedNudges: wipeLedger ? [] : state.appliedNudges,
          appliedMonthlySavings: wipeLedger ? 0 : state.appliedMonthlySavings,
          lastSalaryMonth: wipeLedger ? null : state.lastSalaryMonth
        }

        syncToFirebase({ ...state, ...newState })
        return newState
      }),

      addExpense: (expense) => set((state) => {
        const newExpenses = [{ ...expense, id: Date.now() }, ...state.expenses]
        const newState = {
          expenses: newExpenses,
          // Auto-recalculate nudges on every new expense
          nudges: generateNudges(newExpenses, state.user, state.appliedNudges),
        }
        syncToFirebase({ ...state, ...newState })
        return newState
      }),

      lastSalaryMonth: null,
      
      checkAndAddMonthlySalary: () => set((state) => {
        if (!state.isOnboarded) return state
        
        const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
        if (state.lastSalaryMonth && state.lastSalaryMonth !== currentMonth && state.user.income > 0) {
           const newExpenses = [{
             id: Date.now(),
             title: 'Monthly Salary Auto-Credit',
             amount: state.user.income,
             category: 'Income',
             type: 'income',
             date: new Date().toISOString()
           }, ...state.expenses]
           
           const newState = {
             expenses: newExpenses,
             lastSalaryMonth: currentMonth,
             nudges: generateNudges(newExpenses, state.user, state.appliedNudges)
           }
           syncToFirebase({ ...state, ...newState })
           return newState
        } else if (!state.lastSalaryMonth) {
           const newState = { lastSalaryMonth: currentMonth }
           syncToFirebase({ ...state, ...newState })
           return newState
        }
        return state
      }),

      // Manual reset/trigger — useful for refreshes or testing
      refreshNudges: () => set((state) => ({
        nudges: generateNudges(state.expenses, state.user, []),
        appliedNudges: [],
        appliedMonthlySavings: 0
      })),

      completeOnboarding: () => set({ isOnboarded: true }),
      logout: () => set({ isOnboarded: false }),

      addGoal: (goal) => set((state) => ({
        goals: [{ ...goal, id: Date.now() }, ...state.goals],
      })),

      appliedMonthlySavings: 0,
      appliedNudges: [],
      
      applyNudge: (nudgeId) => set((state) => {
        const nudge = state.nudges.find(n => n.id === nudgeId)
        if (!nudge) return {} // Guard
        const savingsValue = nudge.potentialSaving || 0
        const newAppliedNudges = [nudge, ...state.appliedNudges]
        const newState = {
          appliedNudges: newAppliedNudges,
          appliedMonthlySavings: state.appliedMonthlySavings + savingsValue,
          nudges: generateNudges(state.expenses, state.user, newAppliedNudges),
          lastAppliedNudge: nudge // For showing success messages
        }
        syncToFirebase({ ...state, ...newState })
        return newState
      }),

      dismissNudge: (nudgeId) => set((state) => ({
        nudges: state.nudges.filter(n => n.id !== nudgeId),
      })),

      isOnboarded: false,
    }),
    {
      name: 'savify-storage',
    }
  )
)
