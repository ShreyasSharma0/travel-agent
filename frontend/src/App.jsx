import { lazy, Suspense } from 'react'
import { ChatProvider } from './context/ChatContext'
import AppShell from './components/AppShell'
import SplashLoader from './components/SplashLoader'

const FieldsPanel = lazy(() => import('./components/FieldsPanel'))
const ChatPanel = lazy(() => import('./components/ChatPanel'))

export default function App() {
  return (
    <ChatProvider>
      <AppShell>
        <Suspense fallback={<SplashLoader side="left" />}>
          <FieldsPanel />
        </Suspense>
        <Suspense fallback={<SplashLoader side="right" />}>
          <ChatPanel />
        </Suspense>
      </AppShell>
    </ChatProvider>
  )
}
