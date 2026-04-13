export async function analyzePolicyDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/policy/analyze', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Unable to analyze document')
  }

  return response.json()
}
