const MS_PER_DAY = 86400000

function normalizeText(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokenize(value = '') {
  const norm = normalizeText(value)
  if (!norm) return []
  return norm.split(' ').filter(Boolean)
}

function dayKey(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function bucketFromHour(hour) {
  if (hour < 6) return 'late-night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

function mean(values) {
  if (!values.length) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function stddev(values) {
  if (values.length < 2) return 0
  const m = mean(values)
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function buildProfiles(expenses) {
  const categoryStats = {}
  const merchantMemory = new Map()

  const valid = expenses.filter((e) => e.type === 'expense' && e.category)
  for (const tx of valid) {
    const category = tx.category
    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        amounts: [],
        tokenCounts: {},
        tokenTotal: 0,
        bucketCounts: {},
      }
    }

    const stats = categoryStats[category]
    stats.count += 1
    stats.amounts.push(Number(tx.amount) || 0)

    const title = tx.title || ''
    const tokens = tokenize(title)
    for (const token of tokens) {
      stats.tokenCounts[token] = (stats.tokenCounts[token] || 0) + 1
      stats.tokenTotal += 1
    }

    const txHour = new Date(tx.date).getHours()
    const bucket = bucketFromHour(txHour)
    stats.bucketCounts[bucket] = (stats.bucketCounts[bucket] || 0) + 1

    const normalizedTitle = normalizeText(title)
    if (normalizedTitle) {
      merchantMemory.set(normalizedTitle, category)
    }
  }

  return { categoryStats, merchantMemory }
}

export function predictCategoryFromText({ text, amount = 0, timestamp = Date.now(), expenses = [] }) {
  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Subscription', 'Health', 'Entertainment', 'Other']
  const { categoryStats, merchantMemory } = buildProfiles(expenses)

  const normalizedTitle = normalizeText(text)
  if (normalizedTitle && merchantMemory.has(normalizedTitle)) {
    const exactCategory = merchantMemory.get(normalizedTitle)
    return {
      category: exactCategory,
      confidence: 0.93,
      reason: 'Learnt from your past similar merchant entry',
      alternatives: [],
    }
  }

  const tokens = tokenize(text)
  const vocabSize = Math.max(1, new Set(Object.values(categoryStats).flatMap((s) => Object.keys(s.tokenCounts))).size)
  const totalLabeled = Object.values(categoryStats).reduce((s, v) => s + v.count, 0)

  const scores = categories.map((category) => {
    const stats = categoryStats[category]
    const prior = ((stats?.count || 0) + 1) / (totalLabeled + categories.length)
    let logScore = Math.log(prior)

    if (stats) {
      for (const token of tokens) {
        const tokenCount = stats.tokenCounts[token] || 0
        const likelihood = (tokenCount + 1) / (stats.tokenTotal + vocabSize)
        logScore += Math.log(likelihood)
      }

      const avg = mean(stats.amounts)
      const sd = stddev(stats.amounts)
      if (amount > 0 && avg > 0) {
        const z = sd > 0 ? Math.abs((amount - avg) / sd) : Math.abs(amount - avg) / Math.max(1, avg)
        logScore += Math.max(-2, 1.5 - z)
      }

      const bucket = bucketFromHour(new Date(timestamp).getHours())
      const bucketWeight = (stats.bucketCounts[bucket] || 0) / Math.max(1, stats.count)
      logScore += bucketWeight
    }

    return { category, logScore }
  })

  scores.sort((a, b) => b.logScore - a.logScore)

  const best = scores[0]
  const second = scores[1]
  const confidence = second ? Math.min(0.95, Math.max(0.35, 0.5 + (best.logScore - second.logScore) / 6)) : 0.55

  return {
    category: best.category,
    confidence,
    reason: confidence > 0.7 ? 'Strong match from your spending patterns' : 'Estimated from your recent behavior patterns',
    alternatives: scores.slice(1, 3).map((s) => s.category),
  }
}

export function detectAnomalies(expenses) {
  const anomalyMap = {}
  const byCategory = {}

  for (const tx of expenses.filter((e) => e.type === 'expense')) {
    if (!byCategory[tx.category]) byCategory[tx.category] = []
    byCategory[tx.category].push(tx)
  }

  for (const [category, list] of Object.entries(byCategory)) {
    const amounts = list.map((e) => Number(e.amount) || 0)
    const m = mean(amounts)
    const sd = stddev(amounts)

    for (const tx of list) {
      const amt = Number(tx.amount) || 0
      const z = sd > 0 ? (amt - m) / sd : 0
      const unusualByZ = z > 2.2
      const unusualByRatio = m > 0 && amt > m * 2.2 && list.length >= 3

      if (unusualByZ || unusualByRatio) {
        anomalyMap[tx.id] = {
          isAnomaly: true,
          score: Number((Math.max(z, amt / Math.max(1, m))).toFixed(2)),
          reason: `${category} spend unusually high vs your normal pattern`,
        }
      }
    }
  }

  return anomalyMap
}

export function predictSpending(expenses) {
  const expenseTx = expenses.filter((e) => e.type === 'expense')
  const byDay = new Map()

  for (const tx of expenseTx) {
    const key = dayKey(tx.date)
    byDay.set(key, (byDay.get(key) || 0) + (Number(tx.amount) || 0))
  }

  const dayEntries = Array.from(byDay.entries()).sort((a, b) => a[0] - b[0])
  const recent14 = dayEntries.slice(-14).map(([, amount]) => amount)
  const predictedDaily = Math.round(mean(recent14.length ? recent14 : dayEntries.map(([, amount]) => amount)))

  const now = Date.now()
  const thisWeek = expenseTx
    .filter((e) => new Date(e.date).getTime() >= now - 7 * MS_PER_DAY)
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const prevWeek = expenseTx
    .filter((e) => {
      const ts = new Date(e.date).getTime()
      return ts >= now - 14 * MS_PER_DAY && ts < now - 7 * MS_PER_DAY
    })
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)

  const weeklyDeltaPct = prevWeek > 0 ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : null
  const predictedNextWeek = Math.max(0, Math.round(thisWeek + (weeklyDeltaPct !== null ? (thisWeek * weeklyDeltaPct) / 100 : 0)))

  return {
    predictedDailySpend: predictedDaily || 0,
    thisWeekSpend: thisWeek,
    previousWeekSpend: prevWeek,
    weeklyDeltaPct,
    predictedNextWeekSpend: predictedNextWeek,
  }
}

export function behaviorInsights(expenses, user) {
  const expenseTx = expenses.filter((e) => e.type === 'expense')
  if (!expenseTx.length) return []

  const byCategory = {}
  const byBucket = {}
  let total = 0

  for (const tx of expenseTx) {
    const amt = Number(tx.amount) || 0
    total += amt

    byCategory[tx.category] = (byCategory[tx.category] || 0) + amt

    const hour = new Date(tx.date).getHours()
    const bucket = bucketFromHour(hour)
    byBucket[bucket] = (byBucket[bucket] || 0) + amt
  }

  const categorySorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const dominantCategory = categorySorted[0]
  const dominantShare = dominantCategory ? Math.round((dominantCategory[1] / Math.max(1, total)) * 100) : 0

  const bucketSorted = Object.entries(byBucket).sort((a, b) => b[1] - a[1])
  const topBucket = bucketSorted[0]

  const insights = []

  if (dominantCategory && dominantShare >= 40) {
    insights.push({
      id: 'category-dominance',
      title: 'Category Dominance',
      body: `${dominantCategory[0]} is ${dominantShare}% of your total spend. You can unlock faster savings by optimizing this one category first.`,
      priority: 10,
    })
  }

  if (topBucket) {
    insights.push({
      id: 'time-pattern',
      title: 'Time Pattern',
      body: `Most of your spending happens in the ${topBucket[0]}. Set a quick cap before that window to avoid impulse payments.`,
      priority: 8,
    })
  }

  const predictions = predictSpending(expenses)
  insights.push({
    id: 'spend-forecast',
    title: 'Spend Forecast',
    body: `Estimated daily spend is ₹${predictions.predictedDailySpend.toLocaleString()} and next week could be around ₹${predictions.predictedNextWeekSpend.toLocaleString()}.`,
    priority: 9,
  })

  return insights.sort((a, b) => b.priority - a.priority)
}

export function buildIntelligenceSnapshot(expenses, user) {
  const anomalies = detectAnomalies(expenses)
  const predictions = predictSpending(expenses)
  const insights = behaviorInsights(expenses, user)

  return {
    anomalies,
    predictions,
    insights,
  }
}
