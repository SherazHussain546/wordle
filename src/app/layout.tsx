import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://daily-word-master.com'), // Replace with your actual domain
  title: {
    default: 'WordleMaster - Free Online Daily Word Puzzle Game',
    template: `%s | WordleMaster`,
  },
  description: 'Challenge your vocabulary with WordleMaster, a free daily word guessing game. Guess the hidden 5-letter word in 6 tries. New puzzle every day. Play now!',
  keywords: ['wordle', 'word game', 'puzzle game', 'daily puzzle', 'vocabulary game', 'online game', 'free game', 'word master', 'guess the word', '5 letter word'],
  openGraph: {
    title: 'WordleMaster - Free Online Daily Word Puzzle Game',
    description: 'A new 5-letter word puzzle every day. Play for free!',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/gamingSYNC.png',
        width: 512,
        height: 512,
        alt: 'WordleMaster Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WordleMaster - Free Online Daily Word Puzzle Game',
    description: 'A new 5-letter word puzzle every day. Play for free!',
    images: ['/gamingSYNC.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{scrollBehavior:'smooth'}}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7334468000130380"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-body antialiased h-full">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
