'use client';

import React, { useState, useEffect, useCallback, useMemo, FC, memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { PieChart, Delete, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDefinition, WordDefinitionOutput } from '@/ai/flows/dictionary-flow';
import { WORDLIST } from '@/lib/words';

// --- CONSTANTS ---
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;

// --- TYPE DEFINITIONS ---
type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
type Evaluation = LetterState[];
type KeyColors = { [key: string]: LetterState };
type GameStatus = 'loading' | 'playing' | 'won' | 'lost';

// --- HELPER FUNCTIONS ---
const getDailyWord = () => {
  return WORDLIST[Math.floor(Math.random() * WORDLIST.length)];
};

// --- SUB-COMPONENTS ---

interface TileProps {
  letter: string;
  state: LetterState;
  isRevealing: boolean;
  isCompleted: boolean;
  index: number;
}
const Tile: FC<TileProps> = memo(({ letter, state, isRevealing, isCompleted, index }) => {
  const tileStyle = {
    animationDelay: `${index * 100}ms`,
    transitionDelay: `${index * 100}ms`,
  };

  const stateClasses = {
    correct: 'bg-primary border-primary text-primary-foreground',
    present: 'bg-accent border-accent text-accent-foreground',
    absent: 'bg-muted-foreground/80 border-muted-foreground/80 text-white',
    empty: 'bg-transparent border-border',
    tbd: 'bg-transparent border-foreground/50 text-foreground',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase aspect-square rounded-md transition-all duration-300 border-2',
        isRevealing && 'animate-flip',
        isCompleted ? stateClasses[state] : stateClasses[state === 'empty' ? 'empty' : 'tbd'],
        stateClasses[state]
      )}
      style={tileStyle}
    >
      {letter}
    </div>
  );
});

interface RowProps {
  guess?: string;
  currentGuess?: string;
  evaluation?: Evaluation;
  isCompleted: boolean;
  isRevealing: boolean;
  rowIndex: number;
}
const Row: FC<RowProps> = memo(({ guess, currentGuess, evaluation, isCompleted, isRevealing }) => {
  const letters = (isCompleted ? guess : currentGuess)?.padEnd(WORD_LENGTH, ' ').split('') || Array(WORD_LENGTH).fill('');

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {letters.map((letter, i) => (
        <Tile
          key={i}
          letter={letter}
          state={isCompleted && evaluation ? evaluation[i] : letter.trim() ? 'tbd' : 'empty'}
          isRevealing={isRevealing}
          isCompleted={isCompleted}
          index={i}
        />
      ))}
    </div>
  );
});

interface GameGridProps {
  guesses: string[];
  currentGuess: string;
  evaluations: Evaluation[];
  currentRowIndex: number;
}
const GameGrid: FC<GameGridProps> = memo(({ guesses, currentGuess, evaluations, currentRowIndex }) => {
  return (
    <div className="flex items-center justify-center w-full my-auto">
      <div className="grid grid-rows-6 gap-1.5 w-full max-w-[320px] sm:max-w-[350px]">
        {Array.from({ length: MAX_GUESSES }).map((_, i) => (
          <Row
            key={i}
            rowIndex={i}
            guess={guesses[i]}
            currentGuess={i === currentRowIndex ? currentGuess : ''}
            evaluation={evaluations[i]}
            isCompleted={i < currentRowIndex}
            isRevealing={i === currentRowIndex - 1}
          />
        ))}
      </div>
    </div>
  );
});

const Keyboard: FC<{ onKeyPress: (key: string) => void; keyColors: KeyColors }> = memo(({ onKeyPress, keyColors }) => {
  const keyboardLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'del'],
  ];

  const getKeyClass = (key: string) => {
    const state = keyColors[key.toUpperCase()];
    const baseClasses = 'border-2';
    switch (state) {
      case 'correct':
        return `bg-primary text-primary-foreground hover:bg-primary/90 ${baseClasses} border-primary`;
      case 'present':
        return `bg-accent text-accent-foreground hover:bg-accent/90 ${baseClasses} border-accent`;
      case 'absent':
        return `bg-muted-foreground/50 text-white hover:bg-muted-foreground/60 ${baseClasses} border-muted-foreground/50`;
      default:
        return `bg-muted hover:bg-muted/80 text-foreground border-border`;
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-1 pt-1">
      {keyboardLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 my-0.5 w-full">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              className={cn(
                'h-10 sm:h-12 uppercase font-bold transition-colors duration-300 text-xs sm:text-base',
                key.length > 1 ? 'px-2 sm:px-3 flex-grow' : 'w-7 sm:w-10 flex-1',
                getKeyClass(key)
              )}
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
});

const StatsModal: FC = memo(() => {
  return (
    <DialogContent className="sm:max-w-md bg-card">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">Statistics</DialogTitle>
      </DialogHeader>
      <div className="text-center text-muted-foreground">Player stats are not tracked in this version.</div>
    </DialogContent>
  );
});

const Header: FC = memo(() => (
  <header className="flex items-center justify-between w-full p-2 border-b shrink-0">
    <div className="w-10"></div>
    <h1 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase">
      Word<span className="text-primary">Master</span>
    </h1>
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PieChart className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <StatsModal />
    </Dialog>
  </header>
));

interface GameOverDialogProps {
  isOpen: boolean;
  status: 'won' | 'lost';
  dailyWord: string;
  definition: string | null;
  isLoadingDefinition: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

const GameOverDialog: FC<GameOverDialogProps> = ({
  isOpen,
  status,
  dailyWord,
  definition,
  isLoadingDefinition,
  onPlayAgain,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md bg-card">
      <DialogHeader>
        <DialogTitle className="text-center text-3xl font-bold">{status === 'won' ? 'You Won!' : 'Nice Try!'}</DialogTitle>
      </DialogHeader>
      <div className="my-4 text-center">
        <DialogDescription className="mb-2">The word was:</DialogDescription>
        <p className="text-2xl font-bold tracking-widest uppercase text-primary">{dailyWord}</p>
      </div>
      <div className="my-4 text-center min-h-[6rem]">
        <DialogDescription className="mb-2">Definition:</DialogDescription>
        {isLoadingDefinition ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <p className="text-base text-foreground">{definition || 'No definition found.'}</p>
        )}
      </div>
      <DialogFooter className="sm:justify-center">
        <Button type="button" onClick={onPlayAgain}>
          Play Again
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// --- MAIN GAME COMPONENT ---
export default function WordleGame() {
  const { toast } = useToast();
  
  const [dailyWord, setDailyWord] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [keyColors, setKeyColors] = useState<KeyColors>({});

  const currentRowIndex = useMemo(() => guesses.length, [guesses]);

  const startNewGame = useCallback(() => {
    setDailyWord(getDailyWord());
    setStatus('playing');
    setIsGameOver(false);
    setGuesses([]);
    setCurrentGuess('');
    setEvaluations([]);
    setKeyColors({});
    setDefinition(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleGameOver = useCallback(
    async (finalStatus: 'won' | 'lost') => {
      setStatus(finalStatus);
      setIsGameOver(true);
      setIsDefinitionLoading(true);
      try {
        const result: WordDefinitionOutput = await getDefinition({ word: dailyWord });
        setDefinition(result.definition);
      } catch (error) {
        console.error('Failed to get definition:', error);
        setDefinition('Could not load definition.');
      } finally {
        setIsDefinitionLoading(false);
      }
    },
    [dailyWord]
  );

  const updateKeyColors = (allGuesses: string[], allEvals: Evaluation[]) => {
    const newKeyColors: KeyColors = {};
    allGuesses.forEach((guess, i) => {
      const evaluation = allEvals[i];
      guess.split('').forEach((letter, j) => {
        const key = letter.toUpperCase();
        const currentState = newKeyColors[key];
        const newState = evaluation[j];
        if (currentState === 'correct') return;
        if (newState === 'correct' || currentState === 'present') {
          newKeyColors[key] = newState;
        } else {
          newKeyColors[key] = newState;
        }
      });
    });
    setKeyColors(newKeyColors);
  };

  const getEvaluation = (guess: string, solution: string): Evaluation => {
    const solutionLetters = solution.split('');
    const guessLetters = guess.split('');
    const evaluation: Evaluation = Array(WORD_LENGTH).fill('absent');
    const letterCounts: { [key: string]: number } = {};

    solutionLetters.forEach((letter) => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    guessLetters.forEach((letter, i) => {
      if (letter === solutionLetters[i]) {
        evaluation[i] = 'correct';
        letterCounts[letter]--;
      }
    });

    guessLetters.forEach((letter, i) => {
      if (evaluation[i] !== 'correct' && letterCounts[letter] > 0) {
        evaluation[i] = 'present';
        letterCounts[letter]--;
      }
    });

    return evaluation;
  };

  const processGuess = useCallback(async () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast({ title: 'Not enough letters', variant: 'destructive', duration: 1000 });
      return;
    }
    
    if (!WORDLIST.includes(currentGuess.toUpperCase())) {
      toast({ title: 'Not in word list', variant: 'destructive', duration: 1000 });
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    const evaluation = getEvaluation(currentGuess, dailyWord);
    const newEvals = [...evaluations, evaluation];

    setGuesses(newGuesses);
    setEvaluations(newEvals);
    setCurrentGuess('');
    updateKeyColors(newGuesses, newEvals);

    const isWin = currentGuess === dailyWord;
    const isLoss = newGuesses.length === MAX_GUESSES && !isWin;

    if (isWin || isLoss) {
      setTimeout(() => {
        handleGameOver(isWin ? 'won' : 'lost');
      }, FLIP_ANIMATION_DURATION + WORD_LENGTH * 100);
    }
  }, [currentGuess, dailyWord, guesses, evaluations, toast, handleGameOver]);

  const onKeyPress = useCallback(
    (key: string) => {
      if (status !== 'playing') return;

      if (key === 'enter') {
        processGuess();
      } else if (key === 'del' || key === 'backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < WORD_LENGTH && /^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) => (prev + key).toUpperCase());
      }
    },
    [status, currentGuess, processGuess]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      onKeyPress(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  if (!dailyWord) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full bg-background">
      <Header />
      <div className="w-full flex-grow flex flex-col px-2">
        <GameGrid guesses={guesses} currentGuess={currentGuess} evaluations={evaluations} currentRowIndex={currentRowIndex} />
      </div>
      <Keyboard onKeyPress={onKeyPress} keyColors={keyColors} />
      <GameOverDialog
        isOpen={isGameOver}
        status={status as 'won' | 'lost'}
        dailyWord={dailyWord}
        definition={definition}
        isLoadingDefinition={isDefinitionLoading}
        onPlayAgain={startNewGame}
        onClose={() => setIsGameOver(false)}
      />
    </div>
  );
}
