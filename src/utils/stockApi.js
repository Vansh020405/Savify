const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '5Z0GPPA39W00E614';
const BASE_URL = 'https://finnhub.io/api/v1';

export const stocks = [
  { name: "Reliance", symbol: "RELIANCE.NS", avgReturn: 0.12, tag: "Top Performer" },
  { name: "TCS", symbol: "TCS.NS", avgReturn: 0.10, tag: "Stable Growth" },
  { name: "Nifty 50 ETF", symbol: "NIFTYBEES.NS", avgReturn: 0.11, tag: "Index Leader" },
  { name: "HDFC Bank", symbol: "HDFCBANK.NS", avgReturn: 0.09, tag: "Bluechip" },
  { name: "Infosys", symbol: "INFY.NS", avgReturn: 0.11, tag: "IT Giant" },
];

const fallbackQuotes = {
  'RELIANCE.NS': { current: 2928.45, change: 18.35, percent: 0.63 },
  'TCS.NS': { current: 4179.2, change: -26.7, percent: -0.63 },
  'NIFTYBEES.NS': { current: 259.8, change: 1.95, percent: 0.76 },
  'HDFCBANK.NS': { current: 1643.55, change: 9.45, percent: 0.58 },
  'INFY.NS': { current: 1510.3, change: -7.9, percent: -0.52 },
}

function toSafeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export async function fetchStockPrice(symbol) {
  const fallback = fallbackQuotes[symbol] || { current: 0, change: 0, percent: 0 }

  if (!API_KEY) {
    return fallback
  }

  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`)
    if (!response.ok) {
      return fallback
    }

    const data = await response.json()

    const current = toSafeNumber(data?.c, fallback.current)
    const change = toSafeNumber(data?.d, fallback.change)
    const percent = toSafeNumber(data?.dp, fallback.percent)

    if (current <= 0) {
      return fallback
    }

    return {
      current,
      change,
      percent,
    }
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return fallback
  }
}

export function calculateFutureValue(monthly, years, rate) {
  // Simple compound interest logic: FV = P * 12 * t * (1 + r)
  // For better accuracy: FV = P * [((1 + r/12)^(12*t) - 1) / (r/12)] * (1 + r/12)
  const monthlyRate = rate / 12;
  const months = years * 12;
  const fv = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(fv);
}
