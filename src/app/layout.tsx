import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Restake Watch',
  description:
    'Independent watchdog for restaking. Monitor operator concentration and analyze risks in the restaking ecosystem.',
  icons: {
    icon: '/favicon.ico',
  },
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="touch-manipulation">
      <body className={`${poppins.variable} antialiased text-sm sm:text-base`}>
        {children}
      </body>
    </html>
  );
}
