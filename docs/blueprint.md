# **App Name**: Daily Word Master

## Core Features:

- Daily Word Calculation: Determine the 5-letter word for the day based on the UTC date.
- Guess Input and Validation: Allow the user to input 5-letter guesses via an on-screen keyboard and validate them against a word list.
- Feedback System: Provide color-coded feedback (green, yellow, gray) for each letter in the guess.
- Game State Persistence: Use Firestore to load and save the player's current game state for the current daily word.
- Statistics Tracking: Track and persist lifetime player statistics (Played, Won, Current Streak, Guess Distribution) in Firestore.
- Statistics Display: Show stats such as played games, current streak, and so on.
- AdSense Banner Integration: Incorporate dedicated components to support Google AdSense banner display without compromising user experience.

## Style Guidelines:

- Primary color: Strong purple (#9C27B0) for a bold, contemporary feel.
- Background color: Very light purple (#F3E5F5) for a subtle background, enhancing readability.
- Accent color: Deep indigo (#3F51B5) to highlight interactive elements and call-to-action buttons.
- Body and headline font: 'Inter', a grotesque sans-serif font, will be used to promote a machined, objective, and modern look and feel.
- Simple, outline-style icons for the stats screen.
- Clean, responsive layout using Tailwind CSS, ensuring the game is playable on both mobile and desktop devices. A grid layout for the guesses and a flexible layout for the keyboard.
- Subtle animations for tile flipping and keyboard presses.