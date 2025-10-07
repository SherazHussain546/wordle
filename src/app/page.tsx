'use client';

import WordleGame from '@/components/wordle-game';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-start bg-background overflow-hidden">
      {isClient ? <WordleGame /> : <LoadingSkeleton />}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full py-2">
      <div className="flex justify-between items-center p-2 border-b shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-rows-6 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="w-14 h-14 sm:w-16 sm:h-16 rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="p-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-center gap-1 sm:gap-1.5 my-1 sm:my-1.5">
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton key={j} className="h-10 sm:h-12 w-7 sm:w-10 rounded-md" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
