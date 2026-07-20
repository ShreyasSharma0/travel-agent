import './LeadScoreMeter.css'

const CONFIDENCE_COLORS = {
  Low:    '#A07850',
  Medium: '#C4874F',
  High:   '#8FC47A',
}

export default function LeadScoreMeter({ score = 0, confidence = null }) {
  // Arc from 210° to 330° (240° sweep) — classic gauge
  const SWEEP = 240
  const START = 210
  const R = 42
  const CX = 56
  const CY = 56

  const toRad = deg => (deg * Math.PI) / 180
  const pct = Math.min(Math.max(score, 0), 100) / 100
  const angleDeg = START + pct * SWEEP

  // Track arc end point
  const endX = CX + R * Math.cos(toRad(angleDeg))
  const endY = CY + R * Math.sin(toRad(angleDeg))

  // Track arc start
  const startX = CX + R * Math.cos(toRad(START))
  const startY = CY + R * Math.sin(toRad(START))

  const largeArc = pct * SWEEP > 180 ? 1 : 0
  const trackPath = `M ${startX} ${startY} A ${R} ${R} 0 1 1 ${CX + R * Math.cos(toRad(START + SWEEP))} ${CY + R * Math.sin(toRad(START + SWEEP))}`
  const fillPath  = pct > 0
    ? `M ${startX} ${startY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`
    : null

  const color = confidence ? CONFIDENCE_COLORS[confidence] : '#C4874F'

  return (
    <div className="lead-score-meter">
      <div className="lead-score-meter__gauge" role="img" aria-label={`Lead score ${score} out of 100`}>
        <svg viewBox="0 0 112 80" width="112" height="80">
          {/* Background track */}
          <path d={trackPath} fill="none" stroke="rgba(232,201,154,0.1)" strokeWidth="7" strokeLinecap="round" />
          {/* Fill */}
          {fillPath && (
            <path
              d={fillPath}
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 600ms ease, stroke 300ms ease' }}
            />
          )}
          {/* Score text */}
          <text x={CX} y={CY + 4} textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 600, fill: 'var(--latte)' }}>
            {score}
          </text>
        </svg>
      </div>
      <div className="lead-score-meter__meta">
        <span className="lead-score-meter__title">Lead score</span>
        {confidence && (
          <span className="lead-score-meter__confidence" style={{ color }}>
            {confidence} confidence
          </span>
        )}
      </div>
    </div>
  )
}
