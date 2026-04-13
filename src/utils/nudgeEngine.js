import { ottDataset } from './ottDataset'

/**
 * Savify Nudge Engine
 * Analyzes expense data and generates behavioral nudges.
 * Returns nudges sorted by priority (highest impact first).
 */

const MS_PER_DAY = 86400000

const ottServiceMatchers = [
  { name: 'Netflix', patterns: ['netflix'] },
  { name: 'Amazon Prime Video', patterns: ['amazon prime video', 'prime video', 'amazon prime', 'primevideo'] },
  { name: 'Disney+ Hotstar', patterns: ['disney+ hotstar', 'disney hotstar', 'hotstar'] },
  { name: 'Spotify', patterns: ['spotify'] },
  { name: 'YouTube Premium', patterns: ['youtube premium', 'yt premium', 'youtubepremium'] },
]

function normalizeServiceName(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function buildPlatformMonthlyPriceMap() {
  const map = new Map()
  for (const platform of ottDataset.platforms || []) {
    const monthly = platform.type === 'yearly'
      ? Math.max(1, Math.round(platform.price / 12))
      : platform.price
    const key = normalizeServiceName(platform.name)
    const existing = map.get(key)
    if (!existing || monthly < existing) {
      map.set(key, monthly)
    }
  }
  return map
}

const platformMonthlyPriceMap = buildPlatformMonthlyPriceMap()

function getBundleMonthlyPrice(bundle) {
  const name = bundle?.name || ''
  if (/amazon prime/i.test(name) && bundle.price >= 1000) {
    return Math.max(1, Math.round(bundle.price / 12))
  }
  if (/jio/i.test(name) && bundle.price >= 1000) {
    return Math.max(1, Math.round(bundle.price / 12))
  }
  return bundle.price
}

function detectServicesFromExpenses(expenses) {
  const found = new Set()
  for (const expense of expenses) {
    if (expense.type !== 'expense') continue
    const normalizedTitle = normalizeServiceName(expense.title || '')
    if (!normalizedTitle) continue

    for (const matcher of ottServiceMatchers) {
      for (const pattern of matcher.patterns) {
        const normalizedPattern = normalizeServiceName(pattern)
        if (normalizedTitle.includes(normalizedPattern)) {
          found.add(matcher.name)
          break
        }
      }
    }
  }
  return [...found]
}

function addSurveyServices(prefs, serviceSet) {
  const musicApp = (prefs.musicApp || '').toLowerCase()
  if (musicApp.includes('spotify')) {
    serviceSet.add('Spotify')
  }
  if (musicApp.includes('youtube')) {
    serviceSet.add('YouTube Premium')
  }
}

function estimateMonthlyServiceSpend(services) {
  return services.reduce((sum, service) => {
    const price = platformMonthlyPriceMap.get(normalizeServiceName(service))
    return sum + (price || 0)
  }, 0)
}

function pickBestBundle(services) {
  const normalizedServices = services.map((service) => normalizeServiceName(service))

  const scored = (ottDataset.bundles || []).map((bundle) => {
    const includes = (bundle.includes || []).map((item) => normalizeServiceName(item))
    const matchCount = normalizedServices.reduce((count, service) => {
      return count + (includes.some((inc) => inc.includes(service) || service.includes(inc)) ? 1 : 0)
    }, 0)
    return {
      ...bundle,
      monthlyPrice: getBundleMonthlyPrice(bundle),
      matchCount,
    }
  })

  const filtered = scored.filter((bundle) => bundle.matchCount > 0)
  if (!filtered.length) return null

  return filtered.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount
    return a.monthlyPrice - b.monthlyPrice
  })[0]
}

function pickBestWifiPlan(services) {
  const normalizedServices = services.map((service) => normalizeServiceName(service))
  const scored = (ottDataset.wifiPlans || []).map((plan) => {
    const includes = (plan.includes || []).map((item) => normalizeServiceName(item))
    const matchCount = normalizedServices.reduce((count, service) => {
      return count + (includes.some((inc) => inc.includes(service) || service.includes(inc)) ? 1 : 0)
    }, 0)
    return {
      ...plan,
      matchCount,
    }
  })

  const filtered = scored.filter((plan) => plan.matchCount > 0)
  if (!filtered.length) return null

  return filtered.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount
    return a.price - b.price
  })[0]
}

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
  const prefs = user?.preferences || {}
  const normalizedMusicApp = (prefs.musicApp || '').toLowerCase()
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

  if (normalizedMusicApp === 'spotify' && !appliedIds.has('Music Optimization: Spotify')) {
    nudges.push({
      id: 'switch-music-spotify-pref',
      title: 'Music Optimization: Spotify',
      description: 'You selected Spotify. Compare Apple Music plans and save up to ₹40/month.',
      type: 'switch',
      icon: 'refresh',
      priority: 11.3,
      potentialSaving: 40,
      switchInfo: {
        from: 'Spotify',
        to: 'Apple Music',
        savings: 40,
        message: 'Switch & save ₹40/month',
      }
    })
  }

  if (prefs.paysOttSeparately && !appliedIds.has('OTT Survey: Bundle Match')) {
    const serviceSet = new Set(detectServicesFromExpenses(allExpenses))
    addSurveyServices(prefs, serviceSet)
    const services = [...serviceSet]
    const monthlySum = estimateMonthlyServiceSpend(services)
    const bestBundle = pickBestBundle(services)

    if (bestBundle && monthlySum > 0) {
      const savings = Math.max(0, Math.round(monthlySum - bestBundle.monthlyPrice))
      if (savings >= 50) {
        nudges.push({
          id: 'switch-ott-bundle-survey',
          title: 'OTT Survey: Bundle Match',
          description: `Based on your survey, switching to ${bestBundle.name} could cut your OTT bill by about ${currency}${savings}/month.`,
          type: 'switch',
          icon: 'refresh',
          priority: 11.2,
          potentialSaving: savings,
          switchInfo: {
            from: 'Separate OTT Subscriptions',
            to: bestBundle.name,
            savings,
            message: `Consolidate and save ${currency}${savings}/month`,
          }
        })
      }
    }
  }

  if (prefs.paysOttSeparately && !appliedIds.has('OTT Survey: WiFi Bundle')) {
    const serviceSet = new Set(detectServicesFromExpenses(allExpenses))
    addSurveyServices(prefs, serviceSet)
    const services = [...serviceSet]
    const monthlySum = estimateMonthlyServiceSpend(services)
    const bestWifiPlan = pickBestWifiPlan(services)

    if (bestWifiPlan && monthlySum > bestWifiPlan.price) {
      const savings = Math.max(0, Math.round(monthlySum - bestWifiPlan.price))
      if (savings >= 100) {
        nudges.push({
          id: 'switch-ott-wifi-survey',
          title: 'OTT Survey: WiFi Bundle',
          description: `A ${bestWifiPlan.provider} ${bestWifiPlan.speed} plan could cover your OTTs and save around ${currency}${savings}/month.`,
          type: 'switch',
          icon: 'refresh',
          priority: 11.1,
          potentialSaving: savings,
          switchInfo: {
            from: 'Separate OTT Subscriptions',
            to: `${bestWifiPlan.provider} ${bestWifiPlan.speed}`,
            savings,
            message: `Bundle OTTs + WiFi and save ${currency}${savings}/month`,
          }
        })
      }
    }
  }

  if (prefs.spendPreference === 'food' && !appliedIds.has('Food Preference Optimization')) {
    nudges.push({
      id: 'switch-pref-food',
      title: 'Food Preference Optimization',
      description: 'You prefer food spends. Replace 1-2 delivery orders/week with meal prep to save more.',
      type: 'switch',
      icon: 'food',
      priority: 10.9,
      potentialSaving: 900,
      switchInfo: {
        from: 'Frequent Delivery',
        to: 'Meal Prep + Offers',
        savings: 900,
        message: 'Save around ₹900/month',
      }
    })
  }

  if (prefs.spendPreference === 'shopping' && !appliedIds.has('Shopping Preference Optimization')) {
    nudges.push({
      id: 'switch-pref-shopping',
      title: 'Shopping Preference Optimization',
      description: 'You prefer shopping spends. Try wishlist delay + price alerts to prevent impulse buys.',
      type: 'switch',
      icon: 'shopping',
      priority: 10.9,
      potentialSaving: 1200,
      switchInfo: {
        from: 'Impulse Checkouts',
        to: 'Price Alerts + 48h Rule',
        savings: 1200,
        message: 'Trim shopping by ~₹1,200/month',
      }
    })
  }

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
