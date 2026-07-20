import { useEffect, useRef } from 'react'
import { useChatContext } from '../context/ChatContext'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import './ChatPanel.css'

export default function ChatPanel() {
  const { state } = useChatContext()
  const { messages, isTyping, error } = state
  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  return (
    <section className="chat-panel" aria-label="Conversation">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__avatar" aria-hidden="true">☕</div>
        <div>
          <h2 className="chat-header__title">Travel assistant</h2>
          <span className="chat-header__status">
            <span className="status-dot" />
            Online
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="chat-empty__icon" aria-hidden="true">✈️</p>
            <p className="chat-empty__headline">Where to next?</p>
            <p className="chat-empty__sub">Tell me about your dream trip — destination, dates, who's coming, or anything you have in mind.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <div className="chat-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput />
    </section>
  )
}
