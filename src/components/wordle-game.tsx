'use client';

import React, { useState, useEffect, useCallback, useMemo, FC, memo } from 'react';
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { WORDLIST, VALID_GUESSES } from '@/lib/words';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Trophy, TrendingUp, Repeat, Delete, PieChart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// --- CONSTANTS ---
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;

// --- TYPE DEFINITIONS ---
type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
type Evaluation = LetterState[];
type KeyColors = { [key: string]: LetterState };
type GameStatus = 'loading' | 'playing' | 'won' | 'lost';

type GameState = {
  guesses: string[];
  evaluations: Evaluation[];
  status: GameStatus;
  lastPlayedTs: number;
};

type PlayerStats = {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [key: number]: number };
};

// --- HELPER FUNCTIONS ---
const getUTCDate = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const getDailyWord = () => {
  const startDate = new Date('2024-01-01T00:00:00.000Z');
  const today = getUTCDate();
  const dayIndex = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return WORDLIST[dayIndex % WORDLIST.length].toUpperCase();
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
      tbd: 'bg-transparent border-border text-foreground',
    };

    return (
        <div
            className={cn(
                "flex items-center justify-center text-3xl font-bold uppercase aspect-square rounded-md transition-all duration-300",
                isRevealing && "animate-flip",
                isCompleted ? stateClasses[state] : stateClasses[state === 'empty' ? 'empty' : 'tbd'],
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
        <div className="flex-grow flex items-center justify-center w-full">
            <div className="grid grid-rows-6 gap-1.5 w-full max-w-[350px]">
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
            default: return `bg-muted hover:bg-muted/80 ${baseClasses} border-muted-foreground/20`;
        }
    };
    
    return (
        <div className="w-full flex flex-col items-center pb-2 pt-1">
            {keyboardLayout.map((row, i) => (
                <div key={i} className="flex justify-center gap-1 my-0.5 w-full">
                    {row.map((key) => (
                        <Button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={cn(
                                'h-11 sm:h-12 uppercase font-bold transition-colors duration-300',
                                key.length > 1 ? 'px-3 flex-grow' : 'w-8 sm:w-10 flex-1',
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

const StatsModal: FC<{ stats: PlayerStats | null }> = memo(({ stats }) => {
    const guessDistribution = stats?.guessDistribution || {1:0, 2:0, 3:0, 4:0, 5:0, 6:0};
    const maxDistribution = Math.max(...Object.values(guessDistribution), 1);
    const winPercentage = stats && stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
    
    return (
        <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">Statistics</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center my-4">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">{stats?.played || 0}</span>
                    <span className="text-xs text-muted-foreground">Played</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">{winPercentage}</span>
                    <span className="text-xs text-muted-foreground">Win %</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">{stats?.currentStreak || 0}</span>
                    <span className="text-xs text-muted-foreground">Current Streak</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-3xl font-bold">{stats?.maxStreak || 0}</span>
                    <span className="text-xs text-muted-foreground">Max Streak</span>
                </div>
            </div>
            <h3 className="text-center font-bold my-4">Guess Distribution</h3>
            <div className="space-y-2">
                {Object.entries(guessDistribution).map(([guess, count]) => (
                    <div key={guess} className="flex items-center gap-2 text-sm">
                        <span className="font-mono">{guess}</span>
                        <div className="flex-grow bg-muted rounded-full h-5">
                            <div
                                className={cn("h-5 rounded-full flex items-center justify-end px-2 text-white font-bold", count > 0 ? "bg-primary" : "bg-transparent")}
                                style={{ width: `${(count / maxDistribution) * 100}%` }}
                            >
                               {count > 0 && count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
    );
});


const Header: FC<{ stats: PlayerStats | null }> = memo(({ stats }) => (
    <header className="flex items-center justify-between w-full p-2 border-b">
        <div className="w-10"></div>
        <h1 className="text-3xl font-bold tracking-wider uppercase">
            Word<span className="text-primary">Master</span>
        </h1>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <PieChart className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <StatsModal stats={stats} />
        </Dialog>
    </header>
));

// --- MAIN GAME COMPONENT ---
export default function WordleGame() {
    const { toast } = useToast();
    const [dailyWord] = useState(getDailyWord());
    const [wordDate] = useState(getWordDateString(getUTCDate()));

    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<GameStatus>('loading');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [keyColors, setKeyColors] = useState<KeyColors>({});
    const [stats, setStats] = useState<PlayerStats | null>(null);

    const currentRowIndex = useMemo(() => guesses.length, [guesses]);

    // --- FIREBASE INITIALIZATION & AUTH ---
    useEffect(() => {
        try {
            // @ts-ignore
            const firebaseConfig = window.__firebase_config as FirebaseOptions;
            if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_")) {
                console.warn("Firebase config not found or is a placeholder. Game state will not be saved.");
                setStatus('playing'); // Allow playing without persistence
                return;
            }

            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUser(user);
                } else {
                    await signInAnonymously(auth);
                }
            });
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setStatus('playing');
        }
    }, []);

    // --- DATA LOADING & SAVING ---
    useEffect(() => {
        if (!user || status !== 'loading') return;

        const db = getFirestore();
        const statsDocRef = doc(db, 'users', user.uid);
        const gameDocRef = doc(db, 'users', user.uid, 'games', wordDate);

        const loadData = async () => {
            try {
                const [statsDoc, gameDoc] = await Promise.all([
                    getDoc(statsDocRef),
                    getDoc(gameDocRef)
                ]);

                if (statsDoc.exists()) {
                    setStats(statsDoc.data() as PlayerStats);
                } else {
                    setStats({ played: 0, won: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0} });
                }

                if (gameDoc.exists()) {
                    const gameState = gameDoc.data() as GameState;
                    setGuesses(gameState.guesses);
                    setEvaluations(gameState.evaluations);
                    setStatus(gameState.status);
                    updateKeyColors(gameState.guesses, gameState.evaluations);
                } else {
                    setStatus('playing');
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setStatus('playing');
            }
        };
        loadData();

    }, [user, wordDate, status]);
    
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

    const handleGameEnd = useCallback(async (didWin: boolean) => {
        if (!user) return;
        const db = getFirestore();
        const statsDocRef = doc(db, 'users', user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const statsDoc = await transaction.get(statsDocRef);
                const currentStats: PlayerStats = statsDoc.exists()
                    ? (statsDoc.data() as PlayerStats)
                    : { played: 0, won: 0, currentStreak: 0, maxStreak: 0, guessDistribution: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0} };

                const newStats = { ...currentStats };
                newStats.played += 1;
                if (didWin) {
                    newStats.won += 1;
                    newStats.currentStreak += 1;
                    if (newStats.currentStreak > newStats.maxStreak) {
                        newStats.maxStreak = newStats.currentStreak;
                    }
                    const guessCount = guesses.length;
                    newStats.guessDistribution[guessCount] = (newStats.guessDistribution[guessCount] || 0) + 1;
                } else {
                    newStats.currentStreak = 0;
                }

                setStats(newStats);
                transaction.set(statsDocRef, newStats);
            });
        } catch (error) {
            console.error("Error updating stats:", error);
        }
    }, [user, guesses.length]);

    const processGuess = useCallback(async () => {
        if (currentGuess.length !== WORD_LENGTH) {
            toast({ title: "Not enough letters", variant: "destructive" });
            return;
        }

        if (!VALID_GUESSES.has(currentGuess.toLowerCase())) {
            toast({ title: "Not in word list", variant: "destructive" });
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
        const isLoss = newGuesses.length === MAX_GUESSES;
        const newStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';

        setTimeout(() => {
            setStatus(newStatus);
            if(isWin || isLoss) handleGameEnd(isWin);
        }, FLIP_ANIMATION_DURATION + (WORD_LENGTH * 100));

        // Save state to Firebase
        if (user) {
            const db = getFirestore();
            const gameDocRef = doc(db, 'users', user.uid, 'games', wordDate);
            const gameState: GameState = {
                guesses: newGuesses,
                evaluations: newEvals,
                status: newStatus,
                lastPlayedTs: Date.now(),
            };
            await setDoc(gameDocRef, gameState);
        }

    }, [currentGuess, dailyWord, guesses, evaluations, user, wordDate, toast, handleGameEnd]);

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
        const handleKeyDown = (e: KeyboardEvent) => onKeyPress(e.key.toLowerCase());
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onKeyPress]);

    return (
        <div className="w-full max-w-md mx-auto flex flex-col h-full">
            <Header stats={stats} />
            <div className="w-full flex-grow flex flex-col px-2 pt-2 pb-1">
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

// Add keyframes for flip animation to tailwind config via a style tag (alternative to modifying tailwind.config.js for single file component)
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes flip {
      0% {
        transform: rotateX(0);
      }
      50% {
        transform: rotateX(-90deg);
      }
      100% {
        transform: rotateX(0);
      }
    }
    .animate-flip {
      animation-name: flip;
      animation-duration: 0.6s;
      animation-timing-function: ease-in-out;
    }
    html, body, #__next {
      height: 100%;
    }
  `}</style>
);
// In a real app, this would be in globals.css or tailwind.config.js
// Since it's self-contained, we can call this component once.
(WordleGame as any).GlobalStyles = GlobalStyles;
