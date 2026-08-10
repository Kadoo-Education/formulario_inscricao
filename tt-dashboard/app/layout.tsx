import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dashboard de Cobrança · Equatorial',
  description: 'Dashboard de BI - Equatorial Energia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Sidebar />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
