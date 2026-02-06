
import type {Metadata, Viewport} from 'next';
import './globals.css';
import {SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/app-sidebar';
import {Toaster} from '@/components/ui/toaster';
import {Wallet} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Billetera Clara - Finanzas Transparentes',
  description: 'Gestiona tus ingresos, gastos y fondos de forma sencilla y clara.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Billetera Clara',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#e0f7f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full flex-col md:flex-row">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              {/* Header móvil */}
              <header className="flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold font-headline">Billetera Clara</span>
                </div>
              </header>
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-4 md:p-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
