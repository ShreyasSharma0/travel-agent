import { useState, useRef, useCallback } from 'react'
import { useChatContext } from '../context/ChatContext'
import './ChatInput.css'

export default function ChatInput() {
  const { state, submitMessage } = useChatContext()
  const { isTyping } = state
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const handleChange = useCallback((e) => {
    setText(e.target.value)
    // Auto-resize
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    submitMessage(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isTyping, submitMessage])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const canSend = text.trim().length > 0 && !isTyping

  return (
    <div className="chat-input-bar">
      <div className="chat-input-wrap">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tell me about your trip…"
          rows={1}
          disabled={isTyping}
          aria-label="Message input"
          aria-multiline="true"
        />
        <button
          className={`chat-input-send ${canSend ? 'chat-input-send--active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor" />
          </svg>
        </button>
      </div>
      <p className="chat-input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}
