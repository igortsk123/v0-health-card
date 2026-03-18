import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/context/SessionContext'
import { PRODUCT_NAME, PRODUCT_DESCRIPTION } from '@/lib/constants'
import './globals.css'

const geist = Geist({ subsets: ['latin', 'cyrillic-ext'] })

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: PRODUCT_DESCRIPTION,
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={geist.className}>
      <body className="antialiased bg-background text-foreground">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
