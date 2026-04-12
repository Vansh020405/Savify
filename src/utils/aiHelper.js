/**
 * Savify AI Helper
 * Generates conversational, human-like financial insights using Gemini API.
 * Uses caching, fallbacks, and rate limiting to stay performant.
 */

const GEMINI_API_KEY = 'd7dmuppr01qggoeou6lgd7dmuppr01qggoeou6m0'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function setCache(key, value) {
  cache.set(key, { value, timestamp: Date.now() })
}

// ── Fallback messages (app NEVER breaks) ─────────────────────────────────────
const FALLBACK_NUDGE_MESSAGES = [
  "You're spending more than usual — small cuts make a big difference 💡",
  "Your wallet's been busy lately. Maybe time for a breather? 😊",
  "A few smart choices this week could save you thousands this year 🚀",
  "Think of each saved rupee as a tiny soldier working for your future 🪖",
  "Small leaks sink big ships — let's patch the spending holes 🛠️",
]

const FALLBACK_INVESTMENT_MESSAGES = [
  "Small consistent investments can significantly grow your wealth over time 📈",
  "Even ₹500/month can become a meaningful corpus in 5 years — start today 🌱",
  "The best time to invest was yesterday. The second best time is now ⏰",
  "Your saved money is doing nothing in a bank. Let it work harder for you 💪",
  "Consistency beats timing — investing monthly removes the guesswork 🎯",
]

const FALLBACK_DAILY_INSIGHTS = [
  "Your food spending pattern suggests meal-prepping could save you ₹2,000+ monthly 🍱",
  "You tend to spend more on weekends — setting a weekend budget might help 📅",
  "Your savings rate is improving! Keep this momentum going 🔥",
  "Subscription costs are silently eating into your savings — review them 🔍",
  "You're in the top 20% of savers in your age group. Impressive! 🏆",
]

function getRandomFallback(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// ── Core Gemini API call ─────────────────────────────────────────────────────
async function callGemini(prompt, systemInstruction) {
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
          topP: 0.9,
        }
      })
    })

    if (!response.ok) throw new Error(`API ${response.status}`)
    
    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response')
    return text.trim()
  } catch (err) {
    console.warn('[AI Helper] Gemini call failed:', err.message)
    return null
  }
}

// ── System instructions ──────────────────────────────────────────────────────
const NUDGE_SYSTEM = `You are a friendly, smart financial coach inside a savings app called Savify.
Your job is to rewrite dry financial nudges into short, warm, conversational messages.
Rules:
- MAX 2 lines
- Use emoji sparingly (1 max)
- Be encouraging, never judgmental
- Use simple language (no jargon)
- If there's a savings amount, highlight it naturally
- Sound like a smart friend texting advice, not a bank notification
- Use Indian Rupee symbol ₹
- NEVER say "guaranteed returns"
- Output ONLY the rewritten message, nothing else`

const INVESTMENT_SYSTEM = `You are a motivational investment coach inside a savings app.
Your job is to write a brief, inspiring one-liner about why investing saved money is smart.
Rules:
- MAX 1-2 lines
- Conversational and warm
- Use one emoji
- Reference the specific amount if given
- NEVER promise returns or use "guaranteed"
- Use words like "estimated", "historically", "could"
- Sound encouraging, not pushy
- Output ONLY the message, nothing else`

const INSIGHT_SYSTEM = `You are an intelligent financial analyst inside a personal finance app.
Your job is to generate a personalized daily spending insight based on user data.
Rules:
- MAX 2 lines
- Be specific to the data given (mention categories, amounts)
- Offer one actionable suggestion
- Warm, friendly tone
- Use one emoji
- Use Indian Rupee ₹
- Output ONLY the insight, nothing else`

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Enhance a nudge's description with AI-generated conversational text.
 * Falls back to original description if AI fails.
 */
export async function enhanceNudgeText(nudge) {
  const cacheKey = `nudge_${nudge.id}_${nudge.title}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const prompt = `Rewrite this financial nudge into a friendly, short message:
Title: "${nudge.title}"
Description: "${nudge.description}"
Savings: ₹${nudge.potentialSaving || 0}
Type: ${nudge.type}`

  const result = await callGemini(prompt, NUDGE_SYSTEM)
  const final = result || nudge.description
  setCache(cacheKey, final)
  return final
}

/**
 * Generate an investment motivation message based on user savings.
 */
export async function getInvestmentInsight(monthlySaving, futureValue3Y, futureValue5Y) {
  const cacheKey = `invest_${monthlySaving}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const prompt = `The user saves ₹${monthlySaving}/month from cutting expenses.
In 3 years this could grow to ₹${futureValue3Y?.toLocaleString()}.
In 5 years this could grow to ₹${futureValue5Y?.toLocaleString()}.
Write a motivating one-liner about why they should invest this money.`

  const result = await callGemini(prompt, INVESTMENT_SYSTEM)
  const final = result || getRandomFallback(FALLBACK_INVESTMENT_MESSAGES)
  setCache(cacheKey, final)
  return final
}

/**
 * Generate a personalized daily spending insight from expense data.
 */
export async function getDailyInsight(expenseData) {
  const cacheKey = `daily_${expenseData.totalSpending}_${expenseData.foodSpending}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const prompt = `User financial snapshot:
- Total spending this month: ₹${expenseData.totalSpending?.toLocaleString()}
- Food spending: ₹${expenseData.foodSpending?.toLocaleString()}
- Shopping: ₹${expenseData.shoppingSpending?.toLocaleString()}
- Travel: ₹${expenseData.travelSpending?.toLocaleString()}
- Savings this month: ₹${expenseData.savings?.toLocaleString()}
- Number of transactions: ${expenseData.transactionCount}
- Top pattern: ${expenseData.patterns || 'mixed spending'}

Generate a personalized financial insight for today.`

  const result = await callGemini(prompt, INSIGHT_SYSTEM)
  const final = result || getRandomFallback(FALLBACK_DAILY_INSIGHTS)
  setCache(cacheKey, final)
  return final
}

/**
 * Batch enhance multiple nudges. Runs in parallel with individual fallbacks.
 */
export async function enhanceAllNudges(nudges) {
  const enhanced = await Promise.all(
    nudges.map(async (nudge) => {
      const aiText = await enhanceNudgeText(nudge)
      return { ...nudge, aiDescription: aiText }
    })
  )
  return enhanced
}

/**
 * Build expense summary from raw expense data for AI context.
 */
export function buildExpenseSummary(expenses, user) {
  const allExpenses = expenses.filter(e => e.type === 'expense')
  const totalSpending = allExpenses.reduce((s, e) => s + e.amount, 0)
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)

  const byCategory = allExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  return {
    totalSpending,
    foodSpending: byCategory['Food'] || 0,
    shoppingSpending: byCategory['Shopping'] || 0,
    travelSpending: byCategory['Travel'] || 0,
    savings: totalIncome - totalSpending,
    transactionCount: allExpenses.length,
    patterns: topCategory ? `high ${topCategory[0].toLowerCase()} spending` : 'balanced spending',
  }
}
