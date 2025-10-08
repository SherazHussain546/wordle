'use client';

import React from 'react';

export const GameHubArticle = () => {
    const SectionTitle: React.FC<{ children: React.ReactNode, id: string }> = ({ children, id }) => (
        <h2 id={id} className="text-2xl font-bold mt-8 mb-4 text-primary scroll-mt-20">{children}</h2>
    );

    const Paragraph: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>
    );

    return (
        <article className="prose prose-lg max-w-none text-foreground p-4 bg-card border rounded-lg">
            <Paragraph>
                While WordleMaster has captured the hearts of puzzle enthusiasts worldwide, it's just the beginning of what the <strong>SYNC TECH GAME HUB</strong> has to offer. Our mission at <a href="https://synctech.ie" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">SYNC TECH</a> is to create a diverse ecosystem of high-quality, engaging, and beautifully designed web games that cater to a wide variety of tastes. The GAME HUB is our curated collection of these experiences, all built with the same passion for innovation and performance.
            </Paragraph>

            <SectionTitle id="game-hub-philosophy">Our Game Development Philosophy</SectionTitle>
            <Paragraph>
                The <strong>SYNC TECH GAME HUB</strong> isn't just a portal; it's a showcase of our core beliefs in game design. We focus on:
            </Paragraph>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Accessibility:</strong> Our games are browser-based, requiring no downloads or installations. They are designed to work seamlessly on desktops, tablets, and mobile devices, bringing fun to your fingertips wherever you are.</li>
                <li><strong>Performance:</strong> Leveraging modern web technologies like Next.js and React, we ensure our games are fast, responsive, and lightweight, providing a smooth and frustration-free experience.</li>
                <li><strong>Clean Aesthetics:</strong> We believe that a great game should also be a joy to look at. We utilize Tailwind CSS and shadcn/ui to create elegant, modern, and intuitive interfaces that enhance the gameplay.</li>
                <li><strong>Engaging Mechanics:</strong> From brain-teasing logic puzzles to fast-paced challenges, every game in our portfolio is designed to be easy to learn but hard to master, encouraging replayability and skill development.</li>
            </ul>

            <SectionTitle id="explore-the-games">Explore More Games in the Hub</SectionTitle>
            <Paragraph>
                The <strong>SYNC TECH GAME HUB</strong> is an expanding universe of entertainment. While WordleMaster is our flagship word puzzle, here's a glimpse into the types of other experiences you can expect to find:
            </Paragraph>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li><strong>Strategy & Logic Puzzles:</strong> Challenge your mind with games that require careful planning and clever thinking. These brain teasers are perfect for players who love a mental workout.</li>
                <li><strong>Arcade & Action Games:</strong> For those who prefer quicker reflexes and high scores, our arcade-style games offer fast-paced fun and endless replayability.</li>
                <li><strong>Card & Board Game Classics:</strong> We're reimagining timeless classics for the digital age, offering new ways to play your favorite card and board games with a modern twist.</li>
                <li><strong>Educational & Family-Friendly Games:</strong> Fun for all ages, our family-friendly titles are designed to be both entertaining and educational, making them a great choice for parents and children alike.</li>
            </ul>

            <SectionTitle id="the-future-of-the-hub">The Future is Bright and Playful</SectionTitle>
            <Paragraph>
                At <strong>SYNC TECH</strong>, we are constantly innovating and developing new titles to add to the GAME HUB. Our team of passionate developers and designers is always exploring new genres, mechanics, and technologies to push the boundaries of what's possible in web-based gaming.
            </Paragraph>
            <Paragraph>
                We invite you to visit the <a href="https://synctech.ie/gamehub" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">SYNC TECH GAME HUB</a> regularly to discover our latest releases. By playing our games, you are supporting a growing Irish tech company dedicated to creating world-class entertainment. Thank you for being a part of our journey!
            </Paragraph>
        </article>
    );
};
