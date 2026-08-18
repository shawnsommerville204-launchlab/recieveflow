import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'ReceiveFlow — Receiving Dock', description: 'Digital receiving workflow demo' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
