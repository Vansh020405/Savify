const sentimentLexicon = {
  bullish: ['breakout', 'buy', 'accumulate', 'growth', 'upside', 'strong', 'beat', 'rally', 'long'],
  bearish: ['overvalued', 'crash', 'dump', 'bubble', 'risk', 'sell', 'weak', 'downside', 'fall'],
}

const sentimentPostsBySymbol = {
  'ZOMATO.NS': [
    { source: 'finfluencer', text: 'Zomato is in breakout mode. Retail momentum remains strong, buy dips.' },
    { source: 'random', text: 'Everyone is piling in, this rally looks strong.' },
    { source: 'trader', text: 'Volume spike and clean upside continuation.' },
    { source: 'analyst', text: 'Growth outlook positive, margins are improving quarter by quarter.' },
    { source: 'random', text: 'Could run more before cooling.' },
  ],
  'RELIANCE.NS': [
    { source: 'analyst', text: 'Reliance earnings beat expectations, steady upside in retail.' },
    { source: 'finfluencer', text: 'Looks like a clean breakout. Buy on dips for swing.' },
    { source: 'random', text: 'Feels expensive now, might be overvalued short term.' },
    { source: 'trader', text: 'Volume is stable, trend looks healthy not euphoric.' },
    { source: 'random', text: 'Holding. Not a moonshot but still strong.' },
  ],
  'TCS.NS': [
    { source: 'analyst', text: 'IT guidance is stable, predictable growth cycle continues.' },
    { source: 'trader', text: 'Sideways but resilient. Good for patient investors.' },
    { source: 'random', text: 'No breakout yet. Neutral for now.' },
    { source: 'random', text: 'Might underperform near term, weak momentum.' },
    { source: 'finfluencer', text: 'Accumulate slowly, quality compounding story.' },
  ],
  'NIFTYBEES.NS': [
    { source: 'analyst', text: 'Index exposure remains a safer way to ride market growth.' },
    { source: 'finfluencer', text: 'Great for SIP, stable long term upside.' },
    { source: 'random', text: 'Less exciting but safer than chasing small caps.' },
    { source: 'random', text: 'Neutral move this week.' },
    { source: 'trader', text: 'Low drama, steady trend profile.' },
  ],
  'HDFCBANK.NS': [
    { source: 'trader', text: 'Price action stable, range is tightening.' },
    { source: 'analyst', text: 'Banking fundamentals are strong with healthy credit growth.' },
    { source: 'random', text: 'Too slow for me, not much rally.' },
    { source: 'finfluencer', text: 'Good accumulation zone for long term.' },
    { source: 'random', text: 'Neutral overall, waiting for a trigger.' },
  ],
  'INFY.NS': [
    { source: 'meme', text: 'Everyone says crash incoming, this is a bubble.' },
    { source: 'random', text: 'Weak quarter maybe, risk looks high.' },
    { source: 'finfluencer', text: 'Could bounce, but only for high risk traders.' },
    { source: 'trader', text: 'Volatile candles, not stable right now.' },
    { source: 'random', text: 'Too much noise around guidance revision.' },
  ],
  'TATAMOTORS.NS': [
    { source: 'random', text: 'Huge buzz, everyone is talking about this move.' },
    { source: 'finfluencer', text: 'Retail is rushing in fast, looks like momentum trade.' },
    { source: 'trader', text: 'Volatility is high and risk is elevated this week.' },
    { source: 'random', text: 'Could dump after this hype rally, correction risk is high.' },
    { source: 'meme', text: 'Moon or crash, pure hype right now.' },
  ],
}

function toSafeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function hashSeed(value = '') {
  return value.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261)
}

function seededRandom(seed) {
  let state = seed || 1
  return () => {
    state = (1664525 * state + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function classifyPostSentiment(text = '') {
  const normalized = text.toLowerCase()

  const bullishCount = sentimentLexicon.bullish.reduce(
    (count, token) => count + (normalized.includes(token) ? 1 : 0),
    0
  )
  const bearishCount = sentimentLexicon.bearish.reduce(
    (count, token) => count + (normalized.includes(token) ? 1 : 0),
    0
  )

  if (bullishCount === bearishCount) return 'neutral'
  return bullishCount > bearishCount ? 'bullish' : 'bearish'
}

export function analyzeSentimentPosts(posts = []) {
  const classified = posts.map((post) => ({
    ...post,
    sentiment: classifyPostSentiment(post.text),
  }))

  const summary = classified.reduce(
    (acc, post) => {
      acc.total += 1
      if (post.sentiment === 'bullish') acc.positive += 1
      if (post.sentiment === 'bearish') acc.negative += 1
      if (post.sentiment === 'neutral') acc.neutral += 1
      return acc
    },
    { total: 0, positive: 0, negative: 0, neutral: 0 }
  )

  const hypeScore = summary.total > 0 ? Math.round((summary.positive / summary.total) * 100) : 0

  return {
    classified,
    summary,
    hypeScore,
  }
}

export function generateHistoricalTrend(symbol, currentPrice, points = 10) {
  const seed = hashSeed(symbol)
  const rand = seededRandom(seed)
  const basePrice = Math.max(1, toSafeNumber(currentPrice, 100))

  const history = []
  let cursor = basePrice * (0.92 + rand() * 0.14)

  for (let idx = 0; idx < points; idx += 1) {
    const drift = (rand() - 0.5) * 0.05
    const trendBias = rand() > 0.65 ? 0.008 : rand() < 0.28 ? -0.006 : 0.002
    cursor = Math.max(1, cursor * (1 + drift + trendBias))
    history.push(Number(cursor.toFixed(2)))
  }

  return history
}

export function classifyTrendType(history = []) {
  if (history.length < 3) return 'stable'

  const dailyMoves = []
  for (let idx = 1; idx < history.length; idx += 1) {
    const prev = history[idx - 1]
    const curr = history[idx]
    if (prev > 0) {
      dailyMoves.push(Math.abs(((curr - prev) / prev) * 100))
    }
  }

  const meanMove = dailyMoves.length
    ? dailyMoves.reduce((sum, move) => sum + move, 0) / dailyMoves.length
    : 0

  if (meanMove >= 2.2) return 'volatile'
  return 'stable'
}

export function generateAiInsight({ trendType, hypeScore }) {
  if (hypeScore > 70 && trendType === 'volatile') {
    return 'High risk (hype-driven). Action: wait for calm entry.'
  }

  if (hypeScore < 50 && trendType === 'stable') {
    return 'Safer option. Action: consider gradual investment.'
  }

  return 'Mixed signal. Action: invest small and monitor.'
}

export function buildMarketMirrorSignals(stocks = []) {
  return stocks.map((stock) => {
    const symbol = stock?.symbol || ''
    const priceNow = toSafeNumber(stock?.price?.current)
    const changePercent = toSafeNumber(stock?.price?.percent)

    const posts = sentimentPostsBySymbol[symbol] || []
    const sentiment = analyzeSentimentPosts(posts)

    const history = generateHistoricalTrend(symbol, priceNow, 12)
    const trendType = classifyTrendType(history)
    const aiInsight = generateAiInsight({
      trendType,
      hypeScore: sentiment.hypeScore,
    })

    const fomoAlert = sentiment.hypeScore > 70
      ? 'Retail investors rushing in - high risk'
      : ''

    const riskLevel = sentiment.hypeScore > 70 && trendType === 'volatile'
      ? 'risky'
      : sentiment.hypeScore < 50 && trendType === 'stable'
        ? 'safe'
        : 'watch'

    return {
      ...stock,
      posts,
      sentiment,
      history,
      trendType,
      aiInsight,
      fomoAlert,
      riskLevel,
      changePercent,
    }
  })
}
