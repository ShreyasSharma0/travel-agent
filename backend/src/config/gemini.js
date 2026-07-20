import Groq from 'groq-sdk'

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const ANALYSIS_MODEL = 'llama-3.3-70b-versatile'
export const REPLY_MODEL    = 'llama-3.3-70b-versatile'