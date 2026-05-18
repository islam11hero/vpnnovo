import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

import { AppToaster } from '@/components/providers/app-toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '600', '700', '800', '900'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'IPNOVA | Post-Quantum Stealth VPN for Privacy Whales',
  description:
    'RAM-only VPN nodes, Anti-DPI stealth engine, Monero-native checkout, and zero-knowledge ghost accounts. Infrastructure built for OPSEC professionals and privacy whales.',
  keywords:
    'stealth VPN, anti-DPI, post-quantum VPN, RAM-only VPN, Monero VPN, no logs VPN, IPNOVA, privacy whale, OPSEC VPN',
  openGraph: {
    title: 'IPNOVA — Cyber-Elite Stealth Infrastructure',
    description:
      'Bypass national DPI without speed loss. Volatile egress, untraceable XMR settlement, UUID-only portal.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AppToaster />
        {children}
        {/* Floating Live Chat Placeholder */}
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center hover:scale-110 transition-transform z-50" title="Chat with us">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
      </body>
    </html>
  );
}
