import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import ToastStack from '@/components/ToastStack';
import { AppStateProvider } from '@/lib/context/AppStateContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'AURA — Autonomous Support Intelligence',
  description:
    'A multi-agent AI customer support system that investigates root causes, resolves issues automatically, and hands complex cases to humans with complete context. Powered by Qwen, orchestrated like EnterPro workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body min-h-screen`}>
        <AppStateProvider>
          <Nav />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <ToastStack />
        </AppStateProvider>
      </body>
    </html>
  );
}
