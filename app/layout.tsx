import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: 'Verse — Life Path Explorer',
  description: 'A mirror for conscious choice, not fortune-telling.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="min-h-screen bg-verse-black font-verse text-verse-paper">
        {/* Altar scroll container — Phase 4 adds paper texture and full polish */}
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
