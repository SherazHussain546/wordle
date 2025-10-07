'use client';

import React, { useState, useEffect, useCallback, useMemo, FC, memo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Delete } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from '@/firebase';
import { WORDLIST as FALLBACK_WORDLIST } from '@/lib/words';


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
const getUTCDate = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const getWordDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
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
                "flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase aspect-square rounded-md transition-all duration-300 border-2",
                isRevealing && "animate-flip",
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
const Row: FC<RowProps> = memo(({ guess, currentGuess, evaluation, isCompleted, isRevealing, rowIndex }) => {
    const letters = (isCompleted ? guess : currentGuess)?.padEnd(WORD_LENGTH, ' ').split('') || Array(WORD_LENGTH).fill('');
    
    return (
        <div className="grid grid-cols-5 gap-1.5">
            {letters.map((letter, i) => (
                <Tile
                    key={i}
                    letter={letter}
                    state={isCompleted && evaluation ? evaluation[i] : (letter.trim() ? 'tbd' : 'empty')}
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


const Keyboard: FC<{ onKeyPress: (key: string) => void, keyColors: KeyColors }> = memo(({ onKeyPress, keyColors }) => {
    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'del'],
    ];

    const getKeyClass = (key: string) => {
        const state = keyColors[key];
        const baseClasses = 'border-2 text-black';
        switch (state) {
            case 'correct': return `bg-primary text-primary-foreground hover:bg-primary/90 ${baseClasses} border-primary`;
            case 'present': return `bg-accent text-accent-foreground hover:bg-accent/90 ${baseClasses} border-accent`;
            case 'absent': return `bg-muted-foreground/50 text-white hover:bg-muted-foreground/60 ${baseClasses} border-muted-foreground/50`;
            default: return `bg-muted hover:bg-muted/80 text-foreground border-border`;
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

// Stats are now local, so we don't need a complex modal.
// This is a placeholder for a future local stats implementation if desired.
const StatsModal: FC = memo(() => {
    return (
        <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">Statistics</DialogTitle>
            </DialogHeader>
            <div className="text-center text-muted-foreground">
                Player stats are not being tracked in this version.
            </div>
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

// --- MAIN GAME COMPONENT ---
export default function WordleGame() {
    const { toast } = useToast();
    const { firestore } = useFirebase();
    
    const [dailyWord, setDailyWord] = useState('');
    const [wordDate, setWordDate] = useState(getWordDateString(getUTCDate()));

    const [status, setStatus] = useState<GameStatus>('loading');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [keyColors, setKeyColors] = useState<KeyColors>({});

    const currentRowIndex = useMemo(() => guesses.length, [guesses]);

     // --- DATA LOADING ---
    useEffect(() => {
        if (!firestore) return;

        const db = firestore;

        const getDailyWord = async () => {
            setStatus('loading');
            const today = getWordDateString(getUTCDate());
            setWordDate(today);

            const dailyWordRef = doc(db, 'dailyWords', today);
            
            try {
                const dailyWordSnap = await getDoc(dailyWordRef);

                if (dailyWordSnap.exists()) {
                    setDailyWord(dailyWordSnap.data().word.toUpperCase());
                } else {
                    // If no word in DB, use a random one from the local list for today
                    console.warn("No daily word found in Firestore for today. Using fallback.");
                    const fallbackIndex = Math.floor(Math.random() * FALLBACK_WORDLIST.length);
                    const fallbackWord = FALLBACK_WORDLIST[fallbackIndex].toUpperCase();
                    setDailyWord(fallbackWord);
                    toast({ title: "No word for today", description: "Using a random word. The admin needs to add a word for today.", variant: "destructive"})
                }
            } catch (error) {
                 console.error("Error fetching daily word:", error);
                 toast({ title: "Error fetching word", description: "Please check your connection and refresh.", variant: "destructive"})
                 // Fallback on error
                 const fallbackIndex = Math.floor(Math.random() * FALLBACK_WORDLIST.length);
                 setDailyWord(FALLBACK_WORDLIST[fallbackIndex].toUpperCase());
            } finally {
                setStatus('playing');
            }
        };

        getDailyWord();
    }, [firestore, toast]);
    
    const updateKeyColors = (allGuesses: string[], allEvals: Evaluation[]) => {
        const newKeyColors: KeyColors = {};
        allGuesses.forEach((guess, i) => {
            const evaluation = allEvals[i];
            guess.split('').forEach((letter, j) => {
                const key = letter.toLowerCase();
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

    const processGuess = useCallback(async () => {
        if (currentGuess.length !== WORD_LENGTH) {
            toast({ title: "Not enough letters", variant: "destructive" });
            return;
        }

        if (!firestore) return;

        const wordListRef = doc(firestore, 'wordList', currentGuess.toLowerCase());
        
        try {
            const wordListSnap = await getDoc(wordListRef);
            if (!wordListSnap.exists()) {
                toast({ title: "Not in word list", variant: "destructive" });
                return;
            }
        } catch (error) {
            console.error("Error validating word:", error);
            // As a fallback, check the local list if firestore fails
            if (!FALLBACK_WORDLIST.includes(currentGuess.toLowerCase())) {
                 toast({ title: "Not in word list", variant: "destructive" });
                 return;
            }
        }


        const newGuesses = [...guesses, currentGuess];
        const evaluation = getEvaluation(currentGuess, dailyWord);
        const newEvals = [...evaluations, evaluation];
        
        setGuesses(newGuesses);
        setEvaluations(newEvals);
        setCurrentGuess('');

        updateKeyColors(newGuesses, newEvals);

        const isWin = currentGuess === dailyWord;
        const isLoss = newGuesses.length === MAX_GUESSES;
        const newStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';

        // Wait for flip animation to complete before changing status
        setTimeout(() => {
            setStatus(newStatus);
            if (isWin) {
                toast({ title: "Congratulations!", description: `You guessed the word in ${newGuesses.length} tries.` });
            } else if (isLoss) {
                toast({ title: "Better luck next time!", description: `The word was ${dailyWord}.`});
            }
        }, FLIP_ANIMATION_DURATION + (WORD_LENGTH * 100));

    }, [currentGuess, dailyWord, guesses, evaluations, firestore, toast]);

    const getEvaluation = (guess: string, solution: string): Evaluation => {
        const solutionLetters = solution.split('');
        const guessLetters = guess.split('');
        const evaluation: Evaluation = Array(WORD_LENGTH).fill('absent');
        const letterCounts: { [key: string]: number } = {};

        solutionLetters.forEach(letter => {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        });

        // First pass for 'correct'
        guessLetters.forEach((letter, i) => {
            if (letter === solutionLetters[i]) {
                evaluation[i] = 'correct';
                letterCounts[letter]--;
            }
        });

        // Second pass for 'present'
        guessLetters.forEach((letter, i) => {
            if (evaluation[i] !== 'correct' && letterCounts[letter] > 0) {
                evaluation[i] = 'present';
                letterCounts[letter]--;
            }
        });

        return evaluation;
    };

    const onKeyPress = useCallback((key: string) => {
        if (status !== 'playing') return;

        if (key === 'enter') {
            processGuess();
        } else if (key === 'del' || key === 'backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < WORD_LENGTH && /^[a-zA-Z]$/.test(key)) {
            setCurrentGuess(prev => (prev + key).toUpperCase());
        }
    }, [status, currentGuess, processGuess]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            onKeyPress(e.key.toLowerCase())
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onKeyPress]);

    if (status === 'loading' || !dailyWord) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-background">
              <div className="text-2xl text-foreground">Loading Game...</div>
          </div>
      )
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col h-full bg-background">
            <Header />
            <div className="w-full flex-grow flex flex-col px-2">
                <GameGrid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    evaluations={evaluations}
                    currentRowIndex={currentRowIndex}
                />
            </div>
            <Keyboard onKeyPress={onKeyPress} keyColors={keyColors} />
        </div>
    );
}
