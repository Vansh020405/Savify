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
      nudges: generateNudges(initialExpenses, initialUser),

      setUser: (userData) => set((state) => {
        const updatedUser = { ...state.user, ...userData }
        return {
          user: updatedUser,
          nudges: generateNudges(state.expenses, updatedUser),
        }
      }),

      addExpense: (expense) => set((state) => {
        const newExpenses = [{ ...expense, id: Date.now() }, ...state.expenses]
        return {
          expenses: newExpenses,
          // Auto-recalculate nudges on every new expense
          nudges: generateNudges(newExpenses, state.user),
        }
      }),

      // Manual trigger — useful for refreshes or testing
      refreshNudges: () => set((state) => ({
        nudges: generateNudges(state.expenses, state.user),
      })),

      completeOnboarding: () => set({ isOnboarded: true }),

      addGoal: (goal) => set((state) => ({
        goals: [{ ...goal, id: Date.now() }, ...state.goals],
      })),

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
