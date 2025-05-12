
import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; 
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { ReportProvider } from '@/context/ReportContext';
import { AuthProvider } from '@/context/AuthContext'; // Add this import

const geist = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
      <body className={`${geist.variable} antialiased font-sans`}>
        <ThemeProvider
          defaultTheme="system"
        >
          <AuthProvider> {/* Wrap with AuthProvider */}
            <ReportProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </ReportProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
