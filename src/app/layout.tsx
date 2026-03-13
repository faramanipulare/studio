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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-primary-foreground min-h-screen bg-background overflow-x-hidden w-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
