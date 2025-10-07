'use client';

import React, { useState, useEffect, useCallback, useMemo, FC, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PieChart, Delete, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WORDLIST } from '@/lib/words';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AdBanner from './ad-banner';

// --- CONSTANTS ---
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const MAX_HINTS = 3;

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
      <div className="grid grid-rows-6 gap-1.5 w-full max-w-[280px] sm:max-w-[340px]">
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
    <div className="w-full flex flex-col items-center pb-1 pt-1 max-w-[500px] mx-auto">
      {keyboardLayout.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 my-0.5 w-full">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              className={cn(
                'h-12 sm:h-14 uppercase font-bold transition-colors duration-300 text-xs sm:text-base flex-1',
                key.length > 1 ? 'px-2 sm:px-3' : '',
                getKeyClass(key)
              )}
              style={{ flexGrow: key.length > 1 ? 1.5 : 1 }}
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
});

const StatsModal: FC<{ onHardModeToggle: (checked: boolean) => void; isHardMode: boolean; }> = memo(({ onHardModeToggle, isHardMode }) => {
  return (
    <DialogContent className="sm:max-w-md bg-card">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">Settings &amp; Stats</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 rounded-lg border p-4">
          <Checkbox id="hard-mode" checked={isHardMode} onCheckedChange={onHardModeToggle} />
          <div className='grid gap-1.5 leading-none'>
            <Label htmlFor="hard-mode" className="font-medium">
              Hard Mode
            </Label>
            <p className='text-sm text-muted-foreground'>
              Any revealed hints must be used in subsequent guesses.
            </p>
          </div>
        </div>
        <div className="text-center text-muted-foreground pt-4">Player stats are not tracked in this version.</div>
      </div>
    </DialogContent>
  );
});

const Header: FC<{
  isHardMode: boolean;
  onHardModeToggle: (checked: boolean) => void;
  onHint: () => void;
  hintsRemaining: number;
}> = memo(({ isHardMode, onHardModeToggle, onHint, hintsRemaining }) => (
  <header className="flex items-center justify-between w-full p-2 border-b shrink-0">
     <div className="flex-1">
       {/* Empty div for spacing */}
     </div>
    <h1 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase flex-1 text-center">
      Wordle<span className="text-primary">Master</span>
    </h1>
    <div className="flex items-center gap-1 flex-1 justify-end">
      <Button variant="ghost" size="icon" onClick={onHint} disabled={hintsRemaining === 0}>
        <Lightbulb className="h-6 w-6" />
        {hintsRemaining > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {hintsRemaining}
          </span>
        )}
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <PieChart className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <StatsModal onHardModeToggle={onHardModeToggle} isHardMode={isHardMode} />
      </Dialog>
    </div>
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

const GameFooter: FC = memo(() => (
  <footer className="w-full text-center p-4">
    <p className="text-sm text-muted-foreground">
      Powered by{' '}
      <a
        href="https://synctech.ie"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary hover:underline underline-offset-4"
      >
        SYNC TECH
      </a>
    </p>
  </footer>
));

const Instructions: FC = memo(() => (
    <div className="w-full text-left p-4 sm:p-6 bg-card rounded-lg my-4 border">
        <div className="grid md:grid-cols-2 gap-x-8">
            <div>
                <h2 id="how-to-play" className="text-xl font-bold mb-4 text-center scroll-mt-20">How To Play</h2>
                <p className="text-muted-foreground mb-4 text-center">Guess the Wordle in 6 tries.</p>
                <ul className="space-y-3 mb-6 text-foreground">
                    <li>Each guess must be a valid 5-letter word.</li>
                    <li>The color of the tiles will change to show how close your guess was to the word.</li>
                </ul>

                <h3 className="font-semibold mb-4 border-t pt-4">Examples</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            {'WEARY'.split('').map((letter, i) => (
                                <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-lg ${i === 0 ? 'bg-primary text-primary-foreground border-2 border-primary' : 'bg-transparent border-2 border-border'}`}>{letter}</div>
                            ))}
                        </div>
                        <p className="text-sm flex-1"><strong className="font-semibold">W</strong> is in the word and in the correct spot.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            {'PILLS'.split('').map((letter, i) => (
                                <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-lg ${i === 1 ? 'bg-accent text-accent-foreground border-2 border-accent' : 'bg-transparent border-2 border-border'}`}>{letter}</div>
                            ))}
                        </div>
                        <p className="text-sm flex-1"><strong className="font-semibold">I</strong> is in the word but in the wrong spot.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            {'VAGUE'.split('').map((letter, i) => (
                                <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-lg ${i === 3 ? 'bg-muted-foreground/80 text-white border-2 border-muted-foreground/80' : 'bg-transparent border-2 border-border'}`}>{letter}</div>
                            ))}
                        </div>
                        <p className="text-sm flex-1"><strong className="font-semibold">U</strong> is not in the word in any spot.</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 id="tips-and-tricks" className="text-xl font-bold mt-8 md:mt-0 mb-4 text-center border-t md:border-t-0 pt-6 md:pt-0 scroll-mt-20">Tips &amp; Tricks</h2>
                <div className="space-y-4 text-sm text-foreground">
                    <div className="p-4 rounded-lg border bg-background">
                        <h4 className="font-semibold mb-2">Start with a word that has a lot of vowels.</h4>
                        <p className="text-muted-foreground">Words like "ADIEU," "AUDIO," or "CANOE" are great choices because they help you quickly determine which vowels are in the daily word.</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                        <h4 className="font-semibold mb-2">Use two very different words for your first two guesses.</h4>
                        <p className="text-muted-foreground">After your first guess, try a second word with completely different letters. For example, if you start with "AUDIO," a good second guess could be "SLYNT." This strategy helps eliminate or confirm up to 10 different letters right away.</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                        <h4 className="font-semibold mb-2">Watch out for duplicate letters.</h4>
                        <p className="text-muted-foreground">Remember that a letter can appear more than once. Words like "SPOON" or "KNOLL" can be tricky, so if you're stuck, consider the possibility of a repeated letter.</p>
                    </div>
                    <div className="p-4 rounded-lg border bg-background">
                        <h4 className="font-semibold mb-2">Try "Hard Mode" for an extra challenge.</h4>
                        <p className="text-muted-foreground">In Hard Mode, you must use any revealed hints in subsequent guesses. This can be more difficult, but it forces you to think more strategically and can lead to solving the puzzle faster. You can enable it in the Settings.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <h2 id="glossary" className="text-xl font-bold mt-8 mb-4 text-center border-t pt-6 scroll-mt-20">Glossary</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-foreground">
            <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Ace</h4>
                <p className="text-muted-foreground">A solve on the first guess.</p>
            </div>
            <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Deuce / Twofer</h4>
                <p className="text-muted-foreground">A solve in two tries.</p>
            </div>
            <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Phew</h4>
                <p className="text-muted-foreground">A solve in six tries, narrowly avoiding a loss.</p>
            </div>
            <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Trap</h4>
                <p className="text-muted-foreground">A letter pattern that points to many words, such as _IGHT.</p>
            </div>
             <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Whomp</h4>
                <p className="text-muted-foreground">A guess that you know cannot be the answer, played for the sake of findi'more letters.</p>
            </div>
             <div className="p-4 rounded-lg border bg-background">
                <h4 className="font-semibold mb-2">Hard mode</h4>
                <p className="text-muted-foreground">An optional mode in which all found letters must be used in later tries.</p>
            </div>
        </div>

    </div>
));


// --- MAIN GAME COMPONENT ---
export default function WordleGame() {
  const { toast } = useToast();
  
  const [dailyWord, setDailyWord] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [definition, setDefinition] = useState<string | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);
  const [status, setStatus] = useState<GameStatus>('loading');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [keyColors, setKeyColors] = useState<KeyColors>({});
  const [validWords, setValidWords] = useState(new Set(WORDLIST));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setHintsUsed(0);
  }, []);

  useEffect(() => {
    if(isClient) {
      startNewGame();
    }
  }, [isClient, startNewGame]);

  const handleGameOver = useCallback(
    async (finalStatus: 'won' | 'lost') => {
      setStatus(finalStatus);
      setIsGameOver(true);
      setIsDefinitionLoading(true);
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${dailyWord}`);
        if (!response.ok) {
          throw new Error('Word not found in dictionary.');
        }
        const data = await response.json();
        const firstDefinition = data[0]?.meanings[0]?.definitions[0]?.definition;
        setDefinition(firstDefinition || 'No definition found.');
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

    const upperCaseGuess = currentGuess.toUpperCase();
    
    if (isHardMode) {
      const lastEval = evaluations[evaluations.length - 1];
      const lastGuess = guesses[guesses.length - 1];
      
      // Check for correct letters (green)
      if (lastEval) {
        for(let i=0; i<WORD_LENGTH; i++) {
          if(lastEval[i] === 'correct' && upperCaseGuess[i] !== lastGuess[i]) {
            toast({ title: 'Hard Mode', description: `Letter ${lastGuess[i]} must be in position ${i+1}`, variant: 'destructive', duration: 2000 });
            return;
          }
        }
      }


      // Check for present letters (yellow)
      if (lastEval) {
        const presentLetters = lastGuess.split('').filter((_,i) => lastEval[i] === 'present');
        for(const letter of presentLetters) {
          if(!upperCaseGuess.includes(letter)) {
            toast({ title: 'Hard Mode', description: `Guess must contain ${letter}`, variant: 'destructive', duration: 2000 });
            return;
          }
        }
      }
    }


    let isValidWord = validWords.has(upperCaseGuess);

    if (!isValidWord) {
      setIsVerifying(true);
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${upperCaseGuess}`);
        if (response.ok) {
          isValidWord = true;
          // If the word is valid, add it to our session's word list for faster checks next time
          setValidWords(prev => new Set(prev).add(upperCaseGuess));
        }
      } catch (error) {
        toast({ title: 'Could not verify word', description: 'Please check your connection.', variant: 'destructive' });
        setIsVerifying(false);
        return;
      } finally {
        setIsVerifying(false);
      }
    }

    if (!isValidWord) {
      toast({ title: 'Not in word list', variant: 'destructive', duration: 1000 });
      return;
    }
    
    const newGuesses = [...guesses, upperCaseGuess];
    const evaluation = getEvaluation(upperCaseGuess, dailyWord);
    const newEvals = [...evaluations, evaluation];

    setGuesses(newGuesses);
    setEvaluations(newEvals);
    setCurrentGuess('');
    updateKeyColors(newGuesses, newEvals);

    const isWin = upperCaseGuess === dailyWord;
    const isLoss = newGuesses.length === MAX_GUESSES && !isWin;

    if (isWin || isLoss) {
      setTimeout(() => {
        handleGameOver(isWin ? 'won' : 'lost');
      }, FLIP_ANIMATION_DURATION + WORD_LENGTH * 100);
    }
  }, [currentGuess, dailyWord, guesses, evaluations, toast, handleGameOver, validWords, isHardMode]);

  const onKeyPress = useCallback(
    (key: string) => {
      if (status !== 'playing' || isVerifying) return;

      if (key === 'enter') {
        processGuess();
      } else if (key === 'del' || key === 'backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < WORD_LENGTH && /^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) => (prev + key));
      }
    },
    [status, currentGuess, processGuess, isVerifying]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      onKeyPress(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);
  
  const handleHardModeToggle = (checked: boolean) => {
    if (guesses.length > 0) {
      toast({
        title: "Cannot change mode mid-game",
        description: "Please finish or restart the current game to change the difficulty.",
        variant: "destructive"
      });
      return;
    }
    setIsHardMode(checked);
    toast({
        title: `Hard Mode ${checked ? 'Enabled' : 'Disabled'}`,
        description: checked ? "Good luck!" : "",
    });
  };

  const handleHint = () => {
    if (status !== 'playing' || hintsUsed >= MAX_HINTS) {
        toast({ title: "No hints remaining", variant: "destructive" });
        return;
    }

    const foundLetters = new Set<string>();
    Object.entries(keyColors).forEach(([letter, state]) => {
        if (state === 'correct' || state === 'present') {
            foundLetters.add(letter);
        }
    });

    const wordLetters = dailyWord.split('');
    const hintLetter = wordLetters.find(letter => !foundLetters.has(letter));
    
    if (hintLetter) {
        toast({
            title: "Hint",
            description: `The word contains the letter "${hintLetter}".`,
        });
        setHintsUsed(prev => prev + 1);
    } else {
        toast({
            title: "No more hints available",
            description: "You've already found all the letters!",
        });
    }
  };

  if (status === 'loading' || !isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-background">
      <Header onHardModeToggle={handleHardModeToggle} isHardMode={isHardMode} onHint={handleHint} hintsRemaining={MAX_HINTS - hintsUsed} />
      <div className="w-full flex-grow flex flex-col px-2">
        <GameGrid guesses={guesses} currentGuess={currentGuess} evaluations={evaluations} currentRowIndex={currentRowIndex} />
      </div>
      {isVerifying && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying word...</span>
            </div>
          </div>
        )}
      <Keyboard onKeyPress={onKeyPress} keyColors={keyColors} />
      <GameFooter />
      <div className="w-full px-2 sm:px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdBanner className="h-32" />
        <AdBanner className="h-32" />
      </div>
      <div className="px-2 pb-4">
        <Instructions />
      </div>
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
