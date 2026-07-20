import { groqClient, ANALYSIS_MODEL, REPLY_MODEL } from '../config/gemini.js'
import { ANALYSIS_PROMPT, buildReplyPrompt } from '../utils/prompts.js'
import { formatHistory } from '../utils/parseJSON.js'
import { parseJSON } from '../utils/parseJSON.js'

export async function runChatbotTurn(userMessage, conversationHistory = []) {
  const fullHistory = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]
  const historyText = formatHistory(fullHistory)

  // ─── STEP 1: Analysis (strict, temp 0.0) ────────────────────────────────
  const analysisResult = await groqClient.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [
      { role: 'system', content: ANALYSIS_PROMPT },
      { role: 'user',   content: `Conversation:\n${historyText}` },
    ],
    temperature: 0.0,
    max_tokens:  1024,
  })

  console.log('RAW ANALYSIS:', analysisResult.choices[0].message.content)
  

  const metrics = parseJSON(analysisResult.choices[0].message.content)

  const {
    booking_score:        bookingScore        = 0,
    confidence                               = 'Low',
    fields                                   = {},
    should_ask_contact:   shouldAskContact    = false,
    qualification_reason: qualificationReason = '',
  } = metrics
  const shouldSaveLead    = bookingScore >= 70 && !!fields.name && !!fields.phone
  // ─── STEP 2: Reply (natural, temp 0.7) ──────────────────────────────────
  const replyPrompt = buildReplyPrompt({ bookingScore, shouldAskContact, fields })

  const replyMessages = [
    { role: 'system', content: replyPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  const replyResult = await groqClient.chat.completions.create({
    model: REPLY_MODEL,
    messages: replyMessages,
    temperature: 0.7,
    max_tokens:  512,
  })

console.log('RAW REPLY:', replyResult?.choices?.[0]?.message?.content)

  const reply = replyResult.choices[0].message.content.trim()

  return {
    reply,
    fields,
    leadScore:           bookingScore,
    confidence,
    shouldSaveLead,
    qualificationReason,
    action: shouldSaveLead ? 'save_lead' : 'none',
  }
}