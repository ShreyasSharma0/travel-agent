import { Router } from 'express'
import { runChatbotTurn } from '../services/gemini.service.js'
import { saveLead, getLeadByConversation } from '../services/supabase.service.js'

const router = Router()

/**
 * POST /api/chat
 *
 * Body:
 *   { message: string, conversationId: string, history: [{ role, content }] }
 *
 * Returns:
 *   { reply, fields, leadScore, confidence, leadSaved, action }
 */
router.post('/chat', async (req, res) => {
  const { message, conversationId, history = [] } = req.body

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'message is required' })
  }

  if (!conversationId) {
    return res.status(400).json({ message: 'conversationId is required' })
  }

  try {
    // Run the dual Gemini prompt
    const result = await runChatbotTurn(message, history)

    const {
      reply,
      fields,
      leadScore,
      confidence,
      shouldSaveLead,
      qualificationReason,
    } = result

    let leadSaved = false

    // Save lead if threshold met — upsert so reruns don't create duplicates
    if (shouldSaveLead) {
      try {
        const summary = buildSummary(fields, leadScore)
        await saveLead({
          conversationId,
          fields,
          leadScore,
          confidence,
          qualificationReason,
          summary,
        })
        leadSaved = true
      } catch (saveErr) {
        // Don't fail the whole request if Supabase save errors —
        // the conversation should still work
        console.error('[lead save error]', saveErr.message)
      }
    }

    return res.json({
      reply,
      fields,
      leadScore,
      confidence,
      leadSaved,
      action: leadSaved ? 'save_lead' : 'none',
    })
  } catch (err) {
    console.error('[chat error]', err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * GET /api/leads/:conversationId
 * Fetch lead for a given conversation (useful for debugging/testing).
 */
router.get('/leads/:conversationId', async (req, res) => {
  try {
    const lead = await getLeadByConversation(req.params.conversationId)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    return res.json(lead)
  } catch (err) {
    console.error('[lead fetch error]', err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildSummary(fields, score) {
  const parts = []
  if (fields.name)        parts.push(fields.name)
  if (fields.tripType)    parts.push(`planning a ${fields.tripType.toLowerCase()}`)
  if (fields.destination) parts.push(`to ${fields.destination}`)
  if (fields.travelDate)  parts.push(`in ${fields.travelDate}`)
  if (fields.travellers)  parts.push(`for ${fields.travellers} traveller(s)`)
  if (fields.budget)      parts.push(`with a budget of ${fields.budget}`)
  return parts.length
    ? `${parts.join(' ')}. Lead score: ${score}.`
    : `Lead score: ${score}.`
}

export default router
