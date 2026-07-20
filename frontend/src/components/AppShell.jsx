import './AppShell.css'

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="panel-fields">{children[0]}</div>
      <div className="panel-divider" aria-hidden="true" />
      <div className="panel-chat">{children[1]}</div>
    </div>
  )
}
