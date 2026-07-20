import { useChatContext } from '../context/ChatContext'
import LeadScoreMeter from './LeadScoreMeter'
import './FieldsPanel.css'

const FIELD_GROUPS = [
  {
    label: 'Trip details',
    fields: [
      { key: 'destination',        label: 'Destination',    icon: '✈' },
      { key: 'departureCity',      label: 'Departing from', icon: '🏙' },
      { key: 'travelDate',         label: 'Travel date',    icon: '📅' },
      { key: 'duration',           label: 'Duration',       icon: '⏱' },
      { key: 'travellers',         label: 'Travellers',     icon: '👥' },
      { key: 'tripType',           label: 'Trip type',      icon: '🌴' },
      { key: 'budget',             label: 'Budget',         icon: '💰' },
      { key: 'specialRequirements',label: 'Special needs',  icon: '📝' },
    ],
  },
  {
    label: 'Contact',
    fields: [
      { key: 'name',  label: 'Name',  icon: '👤' },
      { key: 'phone', label: 'Phone', icon: '📞' },
      { key: 'email', label: 'Email', icon: '📧' },
    ],
  },
]

function FieldRow({ label, icon, value }) {
  const filled = value !== null && value !== undefined && value !== ''
  return (
    <div className={`field-row ${filled ? 'field-row--filled' : 'field-row--empty'}`}>
      <span className="field-icon" aria-hidden="true">{icon}</span>
      <div className="field-content">
        <span className="field-label">{label}</span>
        <span className="field-value">
          {filled ? value : <span className="field-placeholder">—</span>}
        </span>
      </div>
      {filled && <span className="field-dot" aria-label="captured" />}
    </div>
  )
}

export default function FieldsPanel() {
  const { state } = useChatContext()
  const { fields, leadScore, confidence, leadSaved, conversationId } = state

  const filledCount = Object.values(fields).filter(v => v !== null && v !== undefined && v !== '').length
  const totalCount  = Object.values(fields).length

  return (
    <aside className="fields-panel" aria-label="Captured lead information">
      {/* Header */}
      <div className="fields-header">
        <div className="fields-header__top">
          <div>
            <h1 className="fields-title">Lead details</h1>
            <p className="fields-conv-id">{conversationId}</p>
          </div>
          {leadSaved && (
            <span className="lead-saved-badge">
              <span>✓</span> Saved
            </span>
          )}
        </div>

        <LeadScoreMeter score={leadScore} confidence={confidence} />

        <div className="fields-progress">
          <div className="fields-progress__bar">
            <div
              className="fields-progress__fill"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="fields-progress__label">
            {filledCount}/{totalCount} fields captured
          </span>
        </div>
      </div>

      {/* Field groups */}
      <div className="fields-body">
        {FIELD_GROUPS.map(group => (
          <div key={group.label} className="field-group">
            <h2 className="field-group__label">{group.label}</h2>
            {group.fields.map(({ key, label, icon }) => (
              <FieldRow
                key={key}
                label={label}
                icon={icon}
                value={fields[key]}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Coffee ring signature watermark */}
      <div className="coffee-ring" aria-hidden="true" />
    </aside>
  )
}
