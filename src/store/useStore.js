import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateNudges } from '../utils/nudgeEngine'

const today = () => new Date().toISOString()
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

const initialExpenses = [
  { id: 1, title: 'Blue Tokai Coffee', amount: 340, category: 'Food', date: daysAgo(0), type: 'expense' },
  { id: 2, title: 'Uniqlo India', amount: 2490, category: 'Shopping', date: daysAgo(1), type: 'expense' },
  { id: 3, title: 'Uber Central', amount: 520, category: 'Travel', date: daysAgo(2), type: 'expense' },
  { id: 4, title: "Nature's Basket", amount: 1120, category: 'Food', date: daysAgo(3), type: 'expense' },
  { id: 10, title: 'Spotify Premium', amount: 149, category: 'Subscription', date: daysAgo(4), type: 'expense' },
  // Prior week (7–14 days ago) — used for weekly comparison baseline
  { id: 6, title: 'Swiggy Order', amount: 680, category: 'Food', date: daysAgo(8), type: 'expense' },
  { id: 7, title: 'Rapido', amount: 180, category: 'Travel', date: daysAgo(9), type: 'expense' },
  { id: 8, title: 'Amazon', amount: 1200, category: 'Shopping', date: daysAgo(10), type: 'expense' },
  { id: 5, title: 'Salary Credit', amount: 85000, category: 'Income', date: daysAgo(5), type: 'income' },
]

const initialUser = {
  name: 'Vansh',
  income: 50000,
  currency: '₹',
  savingsGoal: 15000,
  isStudent: false, // For smart scholarship/plan detection
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vansh',
}

export const useStore = create(
  persist(
    (set, get) => ({
      user: initialUser,
      expenses: initialExpenses,
      goals: [
        { id: 1, title: 'Goa Trip', target: 50000, current: 15000, category: 'Leisure', icon: 'leisure' },
        { id: 2, title: 'New Laptop', target: 80000, current: 40000, category: 'Tech', icon: 'tech' },
      ],
      // Dynamic nudges — computed from engine, not static
      nudges: generateNudges(initialExpenses, initialUser, []),

      setUser: (userData, wipeLedger = false) => set((state) => {
        const updatedUser = { ...state.user, ...userData }
        const newExpenses = wipeLedger ? [] : state.expenses
        return {
          user: updatedUser,
          expenses: newExpenses,
          nudges: generateNudges(newExpenses, updatedUser, wipeLedger ? [] : state.appliedNudges),
          appliedNudges: wipeLedger ? [] : state.appliedNudges,
          lastSalaryMonth: wipeLedger ? null : state.lastSalaryMonth
        }
      }),

      addExpense: (expense) => set((state) => {
        const newExpenses = [{ ...expense, id: Date.now() }, ...state.expenses]
        return {
          expenses: newExpenses,
          // Auto-recalculate nudges on every new expense
          nudges: generateNudges(newExpenses, state.user, state.appliedNudges),
        }
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
           
           return {
             expenses: newExpenses,
             lastSalaryMonth: currentMonth,
             nudges: generateNudges(newExpenses, state.user, state.appliedNudges)
           }
        } else if (!state.lastSalaryMonth) {
           return { lastSalaryMonth: currentMonth }
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
        return {
          appliedNudges: newAppliedNudges,
          appliedMonthlySavings: state.appliedMonthlySavings + savingsValue,
          nudges: generateNudges(state.expenses, state.user, newAppliedNudges),
          lastAppliedNudge: nudge // For showing success messages
        }
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
