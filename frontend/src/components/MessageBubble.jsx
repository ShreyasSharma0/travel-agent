import './MessageBubble.css'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`bubble-wrap ${isUser ? 'bubble-wrap--user' : 'bubble-wrap--assistant'}`}>
      {!isUser && (
        <div className="bubble-avatar" aria-hidden="true">☕</div>
      )}
      <div className="bubble-col">
        <div className={`bubble ${isUser ? 'bubble--user' : 'bubble--assistant'}`}>
          <p className="bubble-text">{message.text}</p>
        </div>
        <span className="bubble-ts">{formatTime(message.ts)}</span>
      </div>
    </div>
  )
}
