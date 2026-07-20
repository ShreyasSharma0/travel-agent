const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Send a chat message to the backend.
 * Returns: { reply, fields, leadScore, confidence, leadSaved, action }
 */
export async function sendMessage({ message, conversationId, history }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationId,
      history: history.map(m => ({ role: m.role, content: m.text })),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  return res.json()
}
