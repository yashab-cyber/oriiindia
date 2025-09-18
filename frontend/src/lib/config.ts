export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const getApiUrl = (endpoint: string) => {
  const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL
  return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}