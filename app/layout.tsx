import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIPL',
  description: 'Federazione Italiana Piston League',
  icons: {
    icon: '/site/FIPL.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
