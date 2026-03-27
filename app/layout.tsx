import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const _inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Salary App',
  description: 'Employee, Department & Salary management.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" style={{ backgroundColor: 'var(--app-background)' }}>
        <Sidebar />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
