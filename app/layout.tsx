import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Fraunces, JetBrains_Mono, Geist, Instrument_Serif } from 'next/font/google'
import './globals.css'
import RegisterSW from '@/components/pwa/register-sw'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
})

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#5B6C8F',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'TheHomeFile — Home Maintenance Tracker',
  description: 'The smart way to track, schedule, and manage everything in your home.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TheHomeFile',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfairDisplay.variable} ${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}>
        {children}
        <RegisterSW />
      </body>
    </html>
  )
}
