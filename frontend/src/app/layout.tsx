import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AlertProvider } from '@/context/AlertContext';
import { Suspense } from 'react';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AlertProvider>
            <SidebarProvider>
              <Suspense fallback={<div className="bg-red-400 w-screen h-screen flex z-99999">Loading UI...</div>}>
                {children}
              </Suspense>
            </SidebarProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
