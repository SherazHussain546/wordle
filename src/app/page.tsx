'use client';

import WordleGame from '@/components/wordle-game';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background">
      <WordleGame />
    </main>
  );
}
