// A list of 5-letter words for the game.
export const WORDLIST = [
  'aback', 'abase', 'abate', 'abbey', 'abbot', 'abhor', 'abide', 'abled', 
  'abode', 'abort', 'about', 'above', 'abuse', 'abyss', 'acorn', 'acrid', 
  'actor', 'acute', 'adage', 'adapt', 'adept', 'admin', 'admit', 'adobe', 
  'adopt', 'adore', 'adorn', 'adult', 'affix', 'afire', 'afoot', 'afoul', 
  'after', 'again', 'agape', 'agate', 'agent', 'agile', 'aging', 'aglow', 
  'agony', 'agree', 'ahead', 'aider', 'aisle', 'alarm', 'album', 'alert', 
  'algae', 'alibi', 'alien', 'align', 'alike', 'alive', 'allay', 'alley', 
  'allot', 'allow', 'alloy', 'aloft', 'alone', 'along', 'aloof', 'aloud', 
  'alpha', 'altar', 'alter', 'amass', 'amaze', 'amber', 'amble', 'amend', 
  'amiss', 'amity', 'among', 'ample', 'amply', 'amuse', 'angel', 'anger', 
  'angle', 'angry', 'angst', 'anime', 'ankle', 'annex', 'annoy', 'annul', 
  'anode', 'antic', 'anvil', 'aorta', 'apart', 'aphid', 'aping', 'apnea', 
  'apple', 'apply', 'apron', 'aptly', 'arbor', 'ardor', 'arena', 'argon', 
  'argue', 'arise', 'armor', 'aroma', 'arose', 'array', 'arrow', 'arson', 
  'artsy', 'ascot', 'ashen', 'aside', 'askew', 'assay', 'asset', 'atoll', 
  'atone', 'attic', 'audio', 'audit', 'augur', 'aunty', 'avail', 'avert', 
  'avian', 'avoid', 'await', 'awake', 'award', 'aware', 'awash', 'awful', 
  'awoke', 'axial', 'axiom', 'axion', 'azure', 'bacon', 'badge', 'badly', 
  'bagel', 'baggy', 'baker', 'baler', 'balmy', 'banal', 'banjo', 'barge', 
  'baron', 'basal', 'basic', 'basil', 'basin', 'basis', 'baste', 'batch', 
  'bathe', 'baton', 'batty', 'bawdy', 'bayou', 'beach', 'beady', 'beard', 
  'beast', 'beech', 'beefy', 'befit', 'began', 'begat', 'beget', 'begin', 
  'begun', 'being', 'belch', 'belie', 'belle', 'belly', 'below', 'bench', 
  'beret', 'berry', 'berth', 'beset', 'betel', 'bevel', 'bezel', 'bible', 
  'bicep', 'biddy', 'bigot', 'bilge', 'billy', 'binge', 'bingo', 'biome', t's life?'''
another = "Yo!"
'''))
<changes>
  <description>I've adjusted the color theme to a "forest" inspired palette and tweaked the layout of the game to prevent scrolling. The keyboard buttons now have a border and black text for better visibility. The game's word list has also been significantly expanded.</description>
  <change>
    <file>src/app/globals.css</file>
    <content><![CDATA[@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 40% 95%; /* Light misty blue */
    --foreground: 220 10% 20%;
    --card: 220 40% 98%;
    --card-foreground: 220 10% 20%;
    --popover: 220 40% 98%;
    --popover-foreground: 220 10% 20%;
    --primary: 150 50% 35%; /* Forest Green */
    --primary-foreground: 40 50% 98%;
    --secondary: 140 20% 92%;
    --secondary-foreground: 220 10% 20%;
    --muted: 140 20% 92%;
    --muted-foreground: 220 10% 45%;
    --accent: 40 70% 55%; /* Goldenrod */
    --accent-foreground: 40 50% 5%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 150 20% 70%;
    --input: 150 20% 70%;
    --ring: 150 50% 35%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 150 15% 10%; /* Dark Forest Green */
    --foreground: 0 0% 98%;
    --card: 150 15% 10%;
    --card-foreground: 0 0% 98%;
    --popover: 150 15% 10%;
    --popover-foreground: 0 0% 98%;
    --primary: 150 50% 50%; /* Brighter Forest Green */
    --primary-foreground: 150 50% 10%;
    --secondary: 150 15% 18%;
    --secondary-foreground: 0 0% 98%;
    --muted: 150 15% 18%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 40 70% 65%; /* Brighter Goldenrod */
    --accent-foreground: 40 70% 10%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 150 15% 25%;
    --input: 150 15% 25%;
    --ring: 150 50% 50%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
