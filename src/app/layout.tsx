import type {Metadata} from 'next';
import {Chakra_Petch, Silkscreen} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/ui/theme-provider';
import {ThemeToggle} from '@/components/theme-toggle';

// Body/UI text: squared, slightly technical, still very readable
const chakraPetch = Chakra_Petch({
  variable: '--font-chakra-petch',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

// Title only: pixel font for a retro arcade feel
const silkscreen = Silkscreen({
  variable: '--font-silkscreen',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'CellSweeper',
  description: 'CellSweeper',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${chakraPetch.variable} ${silkscreen.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
