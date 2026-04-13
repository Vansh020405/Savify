const marketUniverse = [
  { ticker: 'ZOMATO.NS', name: 'Zomato' },
  { ticker: 'RELIANCE.NS', name: 'Reliance' },
  { ticker: 'NIFTYBEES.NS', name: 'Nifty 50 ETF' },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors' },
]

const fallbackHeadlines = {
  'ZOMATO.NS': 'Zomato stays in focus on delivery demand trends.',
  'RELIANCE.NS': 'Reliance remains steady after recent earnings updates.',
  'NIFTYBEES.NS': 'Nifty 50 ETF tracks broader market momentum.',
  'HDFCBANK.NS': 'HDFC Bank holds steady amid sector-wide moves.',
  'TATAMOTORS.NS': 'Tata Motors watches auto sector sentiment closely.',
}

const getTrendLabel = (changePercent) => {
  if (changePercent > 0.3) return 'up'
  if (changePercent < -0.3) return 'down'
  return 'flat'
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY
  if (!apiKey) {
    res.status(500).send('Missing ALPHAVANTAGE_API_KEY environment variable')
    return
  }

  try {
    const results = []

    for (const instrument of marketUniverse) {
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(instrument.ticker)}&apikey=${apiKey}`
      const quoteResponse = await fetch(quoteUrl)

      if (!quoteResponse.ok) {
        res.status(500).send('Failed to fetch market data')
        return
      }

      const quoteData = await quoteResponse.json()
      const quote = quoteData?.['Global Quote'] || {}
      const price = toNumber(quote['05. price'])
      const changePercentRaw = String(quote['10. change percent'] || '0').replace('%', '')
      const changePercent = toNumber(changePercentRaw)
      const trend = getTrendLabel(changePercent)

      results.push({
        ticker: instrument.ticker,
        name: instrument.name,
        price,
        changePercent,
        trend,
        headline: fallbackHeadlines[instrument.ticker] || 'Market update pending.'
      })
    }

    res.status(200).json(results)
  } catch (error) {
    res.status(500).send('Market data error')
  }
}
