import { supabase } from '../config/supabase.js'

/**
 * Save a qualified lead to Supabase.
 * Table: leads
 *
 * Matches the JSON schema from the assignment:
 * { conversationId, customer, travel, qualification, createdAt }
 */
export async function saveLead({
  conversationId,
  fields,
  leadScore,
  confidence,
  qualificationReason,
  summary,
}) {
  const payload = {
    conversation_id: conversationId,

    // customer block
    name:  fields.name  ?? null,
    phone: fields.phone ?? null,
    email: fields.email ?? null,

    // travel block
    destination:          fields.destination          ?? null,
    departure_city:       fields.departureCity        ?? null,
    travel_date:          fields.travelDate           ?? null,
    duration:             fields.duration             ?? null,
    travellers:           fields.travellers           ?? null,
    budget:               fields.budget               ?? null,
    trip_type:            fields.tripType             ?? null,
    special_requirements: fields.specialRequirements  ?? null,

    // qualification block
    lead_score:           leadScore,
    confidence,
    qualification_reason: qualificationReason,
    summary:              summary ?? null,

    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('leads')
    .upsert(payload, { onConflict: 'conversation_id' })
    .select()
    .single()

  if (error) throw new Error(`Supabase insert failed: ${error.message}`)
  return data
}

/**
 * Fetch an existing lead by conversationId (used to avoid duplicate saves).
 */
export async function getLeadByConversation(conversationId) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('conversation_id', conversationId)
    .maybeSingle()

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`)
  return data
}
