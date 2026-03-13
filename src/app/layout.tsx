import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fara Manipulare | Professional Market Intelligence',
  description: 'AI-Powered Economic Calendar and Institutional Market Analysis',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary-foreground min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
