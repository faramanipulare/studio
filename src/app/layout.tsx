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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary-foreground min-h-screen bg-background overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
