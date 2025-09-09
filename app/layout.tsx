
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NotificationSystem from '@/components/NotificationSystem'
import UniversalNotificationSystem from '@/components/UniversalNotificationSystem'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CityReport - Signalement Citoyen',
  description: 'Application de signalement citoyen sécurisée pour améliorer votre ville',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  keywords: ['signalement', 'citoyen', 'ville', 'mairie', 'problème urbain'],
  authors: [{ name: 'Équipe CityReport' }],
  creator: 'CityReport Team',
  publisher: 'CityReport',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Systèmes de notifications universelles */}
          <NotificationSystem />
          <UniversalNotificationSystem />
          
          <main>
            {children}
          </main>
          
          <PWAInstallPrompt />
        </div>
      </body>
    </html>
  )
}
