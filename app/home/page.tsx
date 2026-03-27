import PageContainer from '@/components/layout/PageContainer'
import { Home } from 'lucide-react'

export default function HomePage() {
  return (
    <PageContainer>
      <div className="flex items-center gap-3 mb-2">
        <Home size={22} style={{ color: 'var(--app-primary)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text)' }}>
          Home Page
        </h1>
      </div>
      <p className="text-sm" style={{ color: '#6b7280' }}>
        Welcome to MSME Portal. Use the sidebar to navigate.
      </p>
    </PageContainer>
  )
}
