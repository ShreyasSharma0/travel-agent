import './SplashLoader.css'

export default function SplashLoader({ side = 'left' }) {
  if (side === 'left') {
    return (
      <div className="splash splash--left" aria-hidden="true">
        {[80, 120, 90, 110, 70, 95].map((w, i) => (
          <div key={i} className="splash-row">
            <div className="splash-icon shimmer" />
            <div className="splash-line shimmer" style={{ width: w }} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="splash splash--right" aria-hidden="true">
      <div className="splash-bubble splash-bubble--assistant shimmer" />
      <div className="splash-bubble splash-bubble--user shimmer" style={{ alignSelf: 'flex-end' }} />
      <div className="splash-bubble splash-bubble--assistant shimmer" style={{ width: '60%' }} />
    </div>
  )
}
