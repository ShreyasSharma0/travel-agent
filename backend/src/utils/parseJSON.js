export function parseJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty response from Gemini')

  // Strip markdown code fences if present
  let cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Fix unquoted string values — wrap any unquoted value after a colon
    const fixed = cleaned.replace(
      /("[\w_]+")\s*:\s*(?!")(?!\[)(?!\{)(?!null)(?!true)(?!false)(?!-?\d)([^,\}\n]+)/g,
      (match, key, value) => `${key}: "${value.trim().replace(/"/g, '\'')}"`
    )

    try {
      return JSON.parse(fixed)
    } catch {
      // Last resort: extract the JSON object and try again
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) {
        try { return JSON.parse(match[0]) } catch {}
      }

      // If all else fails, return a safe default instead of crashing
      console.warn('[parseJSON] Could not parse, returning safe default:', raw.slice(0, 200))
      return {
        has_travel_intent: false,
        booking_score: 0,
        confidence: 'Low',
        fields: {
          destination: null, departureCity: null, travelDate: null,
          duration: null, travellers: null, budget: null, tripType: null,
          specialRequirements: null, name: null, phone: null, email: null,
        },
        should_ask_contact: false,
        should_save_lead: false,
        qualification_reason: '',
      }
    }
  }
}

export function formatHistory(history = []) {
  if (!history.length) return '(no prior conversation)'
  return history
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')
}