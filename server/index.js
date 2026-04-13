import express from 'express'
import multer from 'multer'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } })

const systemPrompt = `You are an insurance policy analyst. The user has uploaded their policy document. Extract and return only a JSON object with these fields: planName, insurer, monthlyPremium, coverageAmount, policyTerm, topCovered (array of 3 strings), topExclusions (array of 3 strings), waitingPeriods (array of strings), and threeThingsToKnow (array of 3 plain-English sentences a non-expert would understand). Return only valid JSON, no markdown, no preamble.`

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

const openAiModel = 'gpt-4.1-mini'

const extractOutputText = (data) => {
  if (data?.output_text) return data.output_text
  const textParts = []
  for (const item of data?.output || []) {
    for (const chunk of item?.content || []) {
      if (chunk?.type === 'output_text' && chunk?.text) {
        textParts.push(chunk.text)
      }
    }
  }
  return textParts.join('\n')
}

app.post('/api/policy/analyze', upload.single('file'), async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(500).send('Missing OPENAI_API_KEY environment variable')
    }

    if (!req.file) {
      return res.status(400).send('No file uploaded')
    }

    const { buffer, mimetype } = req.file
    const base64 = buffer.toString('base64')

    if (!mimetype.startsWith('image/')) {
      return res.status(400).send('Unsupported file type. Please upload an image (JPG/PNG).')
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        temperature: 0.2,
        instructions: systemPrompt,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: 'Analyze the uploaded policy document and extract the required fields.' },
              { type: 'input_image', image_url: `data:${mimetype};base64,${base64}` },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).send(errorText || 'Failed to analyze document')
    }

    const data = await response.json()
    const text = extractOutputText(data)

    try {
      const parsed = JSON.parse(text)
      return res.json(parsed)
    } catch (error) {
      return res.status(500).send('Could not parse response from analyzer')
    }
  } catch (error) {
    return res.status(500).send('Analyzer error')
  }
})

app.get('/api/market/summary', async (req, res) => {
  try {
    const apiKey = process.env.ALPHAVANTAGE_API_KEY
    if (!apiKey) {
      return res.status(500).send('Missing ALPHAVANTAGE_API_KEY environment variable')
    }

    const results = []

    for (const instrument of marketUniverse) {
      const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(instrument.ticker)}&apikey=${apiKey}`
      const quoteResponse = await fetch(quoteUrl)
      if (!quoteResponse.ok) {
        return res.status(500).send('Failed to fetch market data')
      }

      const quoteData = await quoteResponse.json()
      const quote = quoteData?.['Global Quote'] || {}
      const price = Number(quote['05. price'] || 0)
      const changePercentRaw = String(quote['10. change percent'] || '0').replace('%', '')
      const changePercent = Number(changePercentRaw || 0)
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

    return res.json(results)
  } catch (error) {
    return res.status(500).send('Market data error')
  }
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => {
  console.log(`Policy analyzer server running on port ${PORT}`)
})
