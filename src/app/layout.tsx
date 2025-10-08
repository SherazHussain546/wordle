import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';

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
        <meta name="google-site-verification" content="-2YVuqfnqiY5zPpoHylxys5gnIrFexTBklppdeVE4Qw" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <script type='text/javascript' src='//pl27797943.revenuecpmgate.com/1d/92/44/1d92443fc0f2c722f56cba6927f6aa90.js'></script>
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
