/**
 * Savify Nudge Engine
 * Analyzes expense data and generates behavioral nudges.
 * Returns nudges sorted by priority (highest impact first).
 */

const MS_PER_DAY = 86400000

/** Returns total spend for expenses in a given category */
function categoryTotal(expenses, category) {
  return expenses
    .filter(e => e.type === 'expense' && e.category === category)
    .reduce((sum, e) => sum + e.amount, 0)
}

/** Returns expenses within the last N days from today */
function lastNDays(expenses, n, referenceDate = new Date()) {
  const cutoff = new Date(referenceDate.getTime() - n * MS_PER_DAY)
  return expenses.filter(e => new Date(e.date) >= cutoff)
}

/** Returns expenses in a window [start, end] days ago */
function dayWindow(expenses, startDaysAgo, endDaysAgo, referenceDate = new Date()) {
  const end = new Date(referenceDate.getTime() - endDaysAgo * MS_PER_DAY)
  const start = new Date(referenceDate.getTime() - startDaysAgo * MS_PER_DAY)
  return expenses.filter(e => {
    const d = new Date(e.date)
    return d >= end && d <= start
  })
}

/** Weekday spend comparison (last 7 days vs prior 7 days) */
function weeklyTrend(expenses) {
  const thisWeek = dayWindow(expenses, 7, 0)
    .filter(e => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const lastWeek = dayWindow(expenses, 14, 7)
    .filter(e => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  return { thisWeek, lastWeek, delta: thisWeek - lastWeek }
}

/**
 * Main engine function.
 * @param {Array}  expenses  - Full expenses array from store
 * @param {Object} user      - User object (income, currency, savingsGoal)
 * @returns {Array} nudges   - Array of nudge objects sorted by priority
 */
export function generateNudges(expenses, user, appliedNudges = []) {
  const nudges = []
  const appliedIds = new Set(appliedNudges.map(n => n.title)) // Use title for stability during testing
  const allExpenses = expenses.filter(e => e.type === 'expense')
  const totalSpend = allExpenses.reduce((s, e) => s + e.amount, 0)
  const income = user.income || 50000
  const currency = user.currency || '₹'
  let idCounter = 1

  // ─── RULE 1: Food > 30% of income ──────────────────────────────────────────
  const foodTotal = categoryTotal(allExpenses, 'Food')
  const foodPct = totalSpend > 0 ? (foodTotal / income) * 100 : 0
  if (foodPct > 30) {
    const savings = Math.round(foodTotal * 0.20)
    nudges.push({
      id: idCounter++,
      title: `Reduce Delivery by 20% → Save ${currency}${savings.toLocaleString()}`,
      description: `You've ordered significantly this month. Skipping just 3-4 orders could fund your next investment goal.`,
      type: 'warning',
      icon: 'food',
      priority: 10,
      potentialSaving: savings,
      trend: null,
    })
  } else if (foodPct > 20) {
    const savings = Math.round(foodTotal * 0.10)
    nudges.push({
      id: idCounter++,
      title: `Optimize Food Spending → Save ${currency}${savings.toLocaleString()}`,
      description: `${currency}${foodTotal.toLocaleString()} spent on meals. Two home-cooked days will keep your wealth growing faster.`,
      type: 'alert',
      icon: 'food',
      priority: 5,
      potentialSaving: savings,
      trend: null,
    })
  }

  // ─── RULE 2: Savings < 20% of income ────────────────────────────────────────
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const savedAmount = totalIncome - totalSpend
  const savingsPct = totalIncome > 0 ? (savedAmount / totalIncome) * 100 : 0
  if (savingsPct < 20 && totalIncome > 0) {
    const gap = Math.round(totalIncome * 0.2 - savedAmount)
    nudges.push({
      id: idCounter++,
      title: `You're saving ${savingsPct.toFixed(0)}% — aim for 20%`,
      description: `Stash away just ${currency}${gap.toLocaleString()} more and you'll hit the golden savings rate. Small cuts add up fast.`,
      type: savingsPct < 10 ? 'warning' : 'alert',
      icon: 'receipt',
      priority: 9,
      potentialSaving: gap,
      trend: null,
    })
  } else if (savingsPct >= 20 && totalIncome > 0) {
    nudges.push({
      id: idCounter++,
      title: `Great discipline — saving ${savingsPct.toFixed(0)}% this month`,
      description: `You're above the 20% savings hygiene line. Keep this rhythm and your Goa trip is basically funded itself.`,
      type: 'good',
      icon: 'star',
      priority: 3,
      potentialSaving: 0,
      trend: null,
    })
  }

  // ─── RULE 3: Weekly spend increase/decrease ───────────────────────────────
  const { thisWeek, lastWeek, delta } = weeklyTrend(allExpenses)
  if (lastWeek > 0) {
    const changePct = ((delta / lastWeek) * 100).toFixed(0)
    if (delta > 0) {
      nudges.push({
        id: idCounter++,
        title: `Spending Discipline Check`,
        description: `Your weekly spend is up ${changePct}%. We've identified ₹${Math.round(delta * 0.3).toLocaleString()} in potential non-essential cuts.`,
        type: 'alert',
        icon: 'travel',
        priority: 7,
        potentialSaving: Math.round(delta * 0.3),
        trend: { direction: 'up', pct: Number(changePct) },
      })
    } else if (delta < 0) {
      nudges.push({
        id: idCounter++,
        title: `Wealth Growth Trend: Improved`,
        description: `You cut spending by ${Math.abs(changePct)}% vs last week. That's the kind of quiet win that compounds.`,
        type: 'good',
        icon: 'star',
        priority: 2,
        potentialSaving: 0,
        trend: { direction: 'down', pct: Math.abs(Number(changePct)) },
      })
    }
  }

  // ─── RULE 4: Shopping > 15% of income ───────────────────────────────────────
  const shoppingTotal = categoryTotal(allExpenses, 'Shopping')
  const shoppingPct = totalSpend > 0 ? (shoppingTotal / income) * 100 : 0
  if (shoppingPct > 15) {
    nudges.push({
      id: idCounter++,
      title: `Shopping crossed the 15% mark`,
      description: `${currency}${shoppingTotal.toLocaleString()} in shopping — consider a 48-hour cart rule before any non-essential purchase.`,
      type: 'warning',
      icon: 'shopping',
      priority: 8,
      potentialSaving: Math.round(shoppingTotal * 0.2),
      trend: null,
    })
  }

  // ─── RULE 5: Travel optimization ──────────────────────────────────────────
  const travelTotal = categoryTotal(allExpenses, 'Travel')
  const travelPct = totalSpend > 0 ? (travelTotal / income) * 100 : 0
  if (travelPct > 10) {
    nudges.push({
      id: idCounter++,
      title: `Travel Cost Optimization`,
      description: `Commute costs hit ${currency}${travelTotal.toLocaleString()}. Switching to a monthly pass could save you ~${currency}${Math.round(travelTotal * 0.3).toLocaleString()}.`,
      type: 'alert',
      icon: 'travel',
      priority: 6,
      potentialSaving: Math.round(travelTotal * 0.3),
      trend: null,
    })
  }

  // ─── RULE 6: Static Design Samples (Pruning & Round-ups) ────────────────────
  nudges.push({
    id: idCounter++,
    title: `Pruning Subscriptions`,
    description: `We noticed you haven't used "StreamMax" in 45 days. Cancel now and save ${currency}499/mo.`,
    type: 'alert',
    icon: 'receipt', // Material: autorenew
    priority: 8.5,
    potentialSaving: 499,
    trend: null,
  })

  nudges.push({
    id: idCounter++,
    title: `Enable Smart Round-ups`,
    description: `Turn spare change from transactions into wealth. Expected savings: ${currency}850 this month.`,
    type: 'good',
    icon: 'star', // Material: trending_up
    priority: 8.4,
    potentialSaving: 850,
    trend: null,
  })

  // ─── RULE 7: Subscription Switch Suggestions ──────────────────────────────
  
  // Spotify -> Apple Music
  const spotifyExp = allExpenses.find(e => e.title.toLowerCase().includes('spotify'))
  if (spotifyExp && !appliedIds.has('Music Optimization: Spotify')) {
    nudges.push({
      id: `switch-spotify`,
      title: `Music Optimization: Spotify`,
      description: `Switch from Spotify to Apple Music and save ₹40/month.`,
      type: 'switch',
      icon: 'refresh',
      priority: 11,
      potentialSaving: 40,
      switchInfo: {
        from: "Spotify",
        to: "Apple Music",
        savings: 40,
        message: "Switch & save ₹40/month"
      }
    })
  }

  // Netflix -> Amazon Prime
  const netflixExp = allExpenses.find(e => e.title.toLowerCase().includes('netflix'))
  if (netflixExp && !appliedIds.has('Entertainment: Netflix')) {
    nudges.push({
      id: `switch-netflix`,
      title: `Entertainment: Netflix`,
      description: `Switch to Amazon Prime Video and save ₹350/month.`,
      type: 'switch',
      icon: 'refresh',
      priority: 10.5,
      potentialSaving: 350,
      switchInfo: {
        from: "Netflix",
        to: "Amazon Prime",
        savings: 350,
        message: "Save ₹350/mo on movies"
      }
    })
  }

  // Swiggy -> Cook at Home
  const swiggyExp = allExpenses.find(e => e.title.toLowerCase().includes('swiggy'))
  if (swiggyExp && !appliedIds.has('Food: Swiggy')) {
    nudges.push({
      id: `switch-swiggy`,
      title: `Food: Swiggy`,
      description: `Swap 2 Swiggy orders for home cooking and save ₹300/week.`,
      type: 'switch',
      icon: 'food',
      priority: 10.4,
      potentialSaving: 1200,
      switchInfo: {
        from: "Swiggy",
        to: "Home Cooking",
        savings: 1200,
        message: "Healthier & ₹1,200 richer"
      }
    })
  }

  // Uber -> Public Transport
  const uberExp = allExpenses.find(e => e.title.toLowerCase().includes('uber'))
  if (uberExp && !appliedIds.has('Transport: Uber')) {
    nudges.push({
      id: `switch-uber`,
      title: `Transport: Uber`,
      description: `Switch to Metro/Bus for long commutes and save ₹150/day.`,
      type: 'switch',
      icon: 'travel',
      priority: 10.3,
      potentialSaving: 3000,
      switchInfo: {
        from: "Uber",
        to: "Public Transport",
        savings: 3000,
        message: "Beat traffic & save ₹3,000"
      }
    })
  }

  // ─── RULE 8: No recent income logged ────────────────────────────────────────
  const recentIncome = lastNDays(expenses.filter(e => e.type === 'income'), 35)
  if (recentIncome.length === 0 && expenses.length > 2) {
    nudges.push({
      id: idCounter++,
      title: `Income not logged yet this month`,
      description: `Log your salary or freelance income to get accurate savings insights. We can't nudge you properly without the full picture.`,
      type: 'alert',
      icon: 'receipt',
      priority: 4,
      potentialSaving: 0,
      trend: null,
    })
  }

  // ─── Sort by priority descending ────────────────────────────────────────────
  return nudges.sort((a, b) => b.priority - a.priority)
}

/** Computes total potential savings across all nudges */
export function totalPotentialSavings(nudges) {
  return nudges.reduce((s, n) => s + (n.potentialSaving || 0), 0)
}
