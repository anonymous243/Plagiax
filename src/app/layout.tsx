
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; 
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { ReportProvider } from '@/context/ReportContext';
import { AuthProvider } from '@/context/AuthContext';
import ClientCookieConsentWrapper from '@/components/client-cookie-consent-wrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-primary-sans', 
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="plagiax-theme" 
        >
          <AuthProvider>
            <ReportProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
              <ClientCookieConsentWrapper />
            </ReportProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
