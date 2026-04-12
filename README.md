# Savify ✨

**Savify** is a premium, AI-driven personal financial assistant designed to bring clarity and intelligence to your money without the stress. Built with cutting-edge React patterns and a mobile-first philosophy, Savify completely automates balance tracking, predicts your spending habits, and actively guides you toward financial independence.

## 🚀 Key Features

- **Proactive AI Decision Engine**: Every expense you add calculates *instantaneous* impacts against your savings capacity and visually warns you if an impulsive purchase will delay your long-term goals.
- **Smart Automated Ledger**: Define your income once during onboarding. Savify invisibly tracks month-to-month rollovers, auto-crediting your salary and dynamically updating available balances.
- **Guided "Switch Nudges"**: Uses intelligent state machines to suggest replacing bad financial habits with better ones (e.g., swapping Uber for public transit). Features interactive modals teaching users how much they save.
- **Investments Tracker**: Recommends SIP allocations and models 1-to-5 year wealth projections based on compound growth logic immediately after you lock in daily savings.
- **Ultra-Premium Native Feel**: Crafted entirely from scratch using `Framer Motion` for 120fps state-driven animations, custom `SF Pro` typography, and stunning Tailwind CSS aesthetics. Completely cardless UI tailored for mobile ergonomics.

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/) & [Vite](https://vitejs.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with persistent local storage integration)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Intelligence Integration**: API-compatible nudge engine mapped designed alongside deep predictive algorithms

## 📦 Quick Start

1. Clone the repository and navigate to the project directory:
   ```bash
   cd savify
   ```
2. Install the core dependencies:
   ```bash
   npm install
   ```
3. Run the development server precisely simulating mobile dimensions in your browser:
   ```bash
   npm run dev
   ```

## 🏗 Architecture Insights

The application strips away complex dashboard layouts to implement a localized `BottomNav` flow handling:
- `/` - **Dashboard**: Quick snapshot of current funds, recent expenses, and dynamic progress bar modeling spending against auto-counted income.
- `/transactions` - **Activity**: Deep structural view mapping the expense and income timeline.
- `/investments` - **Growth**: Projections and guided portfolio breakdowns prioritizing 12-to-15% index yields.
- `/profile` - **Settings**: Account operations, bank bindings, and secure local session wipes.

> Designed to turn finance from a chore into a deep breath. 🍃