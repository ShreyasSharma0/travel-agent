import { createContext, useContext, useReducer, useCallback } from 'react'
import { sendMessage } from '../api/api'

// ─── State shape ────────────────────────────────────────────────────────────
const initialState = {
  messages: [],           // { id, role: 'user'|'assistant', text, ts }
  fields: {               // extracted travel fields — null = not yet captured
    destination: null,
    departureCity: null,
    travelDate: null,
    duration: null,
    travellers: null,
    budget: null,
    tripType: null,
    specialRequirements: null,
    name: null,
    phone: null,
    email: null,
  },
  leadScore: 0,
  confidence: null,       // 'Low' | 'Medium' | 'High'
  leadSaved: false,
  isTyping: false,
  error: null,
  conversationId: null,
}

// ─── Reducer ────────────────────────────────────────────────────────────────
function chatReducer(state, action) {
  switch (action.type) {
    case 'INIT_CONVERSATION':
      return { ...state, conversationId: action.payload }

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          id: `msg_${Date.now()}`,
          role: 'user',
          text: action.payload,
          ts: new Date().toISOString(),
        }],
      }

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload }

    case 'ADD_ASSISTANT_REPLY': {
      const { reply: text, fields, leadScore, confidence, leadSaved } = action.payload
      return {
        ...state,
        isTyping: false,
        error: null,
        messages: [...state.messages, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          text,
          ts: new Date().toISOString(),
        }],
        // Merge only non-null extracted fields so existing values aren't wiped
        fields: {
          ...state.fields,
          ...Object.fromEntries(
            Object.entries(fields || {}).filter(([, v]) => v !== null && v !== undefined && v !== '')
          ),
        },
        leadScore: leadScore ?? state.leadScore,
        confidence: confidence ?? state.confidence,
        leadSaved: leadSaved ?? state.leadSaved,
      }
    }

    case 'SET_ERROR':
      return { ...state, isTyping: false, error: action.payload }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    default:
      return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    conversationId: `conv_${Date.now()}`,
  })

  const submitMessage = useCallback(async (text) => {
    if (!text.trim()) return

    dispatch({ type: 'ADD_USER_MESSAGE', payload: text })
    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      const response = await sendMessage({
        message: text,
        conversationId: state.conversationId,
        history: state.messages,
      })
      dispatch({ type: 'ADD_ASSISTANT_REPLY', payload: response })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' })
    }
  }, [state.conversationId, state.messages])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  return (
    <ChatContext.Provider value={{ state, submitMessage, clearError }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider')
  return ctx
}
