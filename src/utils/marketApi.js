export async function fetchMarketSummary() {
  const response = await fetch('/api/market/summary')

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Unable to fetch market data')
  }

  return response.json()
}
