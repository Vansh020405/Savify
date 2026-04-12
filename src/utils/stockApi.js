const API_KEY = 'd7dml99r01qggoeot8q0d7dml99r01qggoeot8qg';
const BASE_URL = 'https://finnhub.io/api/v1';

export const stocks = [
  { name: "Reliance", symbol: "RELIANCE.NS", avgReturn: 0.12, tag: "Top Performer" },
  { name: "TCS", symbol: "TCS.NS", avgReturn: 0.10, tag: "Stable Growth" },
  { name: "Nifty 50 ETF", symbol: "NIFTYBEES.NS", avgReturn: 0.11, tag: "Index Leader" },
  { name: "HDFC Bank", symbol: "HDFCBANK.NS", avgReturn: 0.09, tag: "Bluechip" },
  { name: "Infosys", symbol: "INFY.NS", avgReturn: 0.11, tag: "IT Giant" },
];

export async function fetchStockPrice(symbol) {
  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
    const data = await response.json();
    return {
      current: data.c,
      change: data.d,
      percent: data.dp
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
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
