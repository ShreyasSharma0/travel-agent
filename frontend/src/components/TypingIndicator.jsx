import './TypingIndicator.css'

export default function TypingIndicator() {
  return (
    <div className="typing-wrap" aria-label="Assistant is typing" role="status">
      <div className="typing-avatar" aria-hidden="true">☕</div>
      <div className="typing-bubble">
        <span className="steam steam--1" aria-hidden="true" />
        <span className="steam steam--2" aria-hidden="true" />
        <span className="steam steam--3" aria-hidden="true" />
      </div>
    </div>
  )
}
