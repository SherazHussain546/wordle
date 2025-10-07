'use client';

import WordleGame from '@/components/wordle-game';
import AdBanner from '@/components/ad-banner';

export default function Home() {
  return (
    <div className="flex justify-center w-full min-h-screen bg-background">
      <div className="hidden lg:flex lg:w-48 xl:w-64 items-center justify-center p-4">
        <AdBanner />
      </div>
      <main className="flex flex-col items-center justify-start w-full">
        <WordleGame />
      </main>
      <div className="hidden lg:flex lg:w-48 xl:w-64 items-center justify-center p-4">
        <AdBanner />
      </div>
    </div>
  );
}
