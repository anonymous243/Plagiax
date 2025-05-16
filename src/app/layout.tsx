
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { ReportProvider } from '@/context/ReportContext';
import { AuthProvider } from '@/context/AuthContext';
import { CookieConsentPopup } from '@/components/cookie-consent-popup';

// Initialize Inter font with a CSS variable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-primary-sans', // CSS variable for the primary sans-serif font
});

export const metadata: Metadata = {
  title: 'Plagiax - Plagiarism Detection',
  description: 'Upload documents and check for plagiarism with AI-powered analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply the font variable and Tailwind's font-sans utility class */}
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="plagiax-theme" // Added explicit storageKey
        >
          <AuthProvider>
            <ReportProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
              <CookieConsentPopup />
            </ReportProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
