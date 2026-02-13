import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc/client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Swedish Food Ecosystem - Kunskapsgraf',
  description: 'Visualisering av Sveriges livsmedelssektors myndighetskrav och relationer',
  keywords: ['livsmedel', 'myndighet', 'uppgiftskrav', 'knowledge graph', 'Sverige'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
