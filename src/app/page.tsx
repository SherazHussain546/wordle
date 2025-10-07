'use client';

import WordleGame from '@/components/wordle-game';

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-start bg-background overflow-hidden">
      <WordleGame />
    </main>
  );
}
