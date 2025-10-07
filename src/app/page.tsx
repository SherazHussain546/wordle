'use client';

import WordleGame from '@/components/wordle-game';

export default function Home() {
  return (
    <div className="flex justify-center w-full min-h-screen bg-background">
      <main className="flex flex-col items-center justify-start w-full">
        <WordleGame />
      </main>
    </div>
  );
}
