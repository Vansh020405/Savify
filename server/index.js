import express from 'express'
import multer from 'multer'

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } })

const systemPrompt = `You are an insurance policy analyst. The user has uploaded their policy document. Extract and return only a JSON object with these fields: planName, insurer, monthlyPremium, coverageAmount, policyTerm, topCovered (array of 3 strings), topExclusions (array of 3 strings), waitingPeriods (array of strings), and threeThingsToKnow (array of 3 plain-English sentences a non-expert would understand). Return only valid JSON, no markdown, no preamble.`

const marketSystemPrompt = `You are a financial data assistant for Indian retail investors. For each of these instruments: Zomato (ZOMATO.NS), Reliance (RELIANCE.NS), Nifty 50 ETF (NIFTYBEES), HDFC Bank (HDFCBANK.NS), Tata Motors (TATAMOTORS.NS) - use web search to find the current price, today's % change, and one recent news headline. Return only a JSON array. Each object: { ticker, name, price, changePercent, trend (up/down/flat based on 5-day), headline }. No markdown, no preamble, valid JSON only.`

app.post('/api/policy/analyze', upload.single('file'), async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).send('Missing ANTHROPIC_API_KEY environment variable')
    }

    if (!req.file) {
      return res.status(400).send('No file uploaded')
    }

    const { buffer, mimetype } = req.file
    const base64 = buffer.toString('base64')

    const content = []

    if (mimetype.startsWith('image/')) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mimetype, data: base64 },
      })
    } else if (mimetype === 'application/pdf') {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: mimetype, data: base64 },
      })
    } else {
      return res.status(400).send('Unsupported file type')
    }

    content.push({ type: 'text', text: 'Analyze the uploaded policy document and extract the required fields.' })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        temperature: 0.2,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).send(errorText || 'Failed to analyze document')
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text || ''

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
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).send('Missing ANTHROPIC_API_KEY environment variable')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        temperature: 0.2,
        system: marketSystemPrompt,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: 'Fetch the latest market data and return JSON only.' }],
          },
        ],
        tools: [{ type: 'web_search' }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(500).send(errorText || 'Failed to fetch market data')
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text || ''

    try {
      const parsed = JSON.parse(text)
      return res.json(parsed)
    } catch (error) {
      return res.status(500).send('Could not parse response from market data')
    }
  } catch (error) {
    return res.status(500).send('Market data error')
  }
})

const PORT = process.env.PORT || 5174
app.listen(PORT, () => {
  console.log(`Policy analyzer server running on port ${PORT}`)
})
