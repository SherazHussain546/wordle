# WordleMaster by SYNC TECH

Welcome to **WordleMaster**, a captivating and challenging daily word puzzle game, created and powered by **[SYNC TECH](https://synctech.ie)**. This project is a modern interpretation of the classic word-guessing game, built to be fast, responsive, and endlessly engaging.

This game is a featured project in the **[SYNC TECH GAME HUB](https://synctech.ie/gamehub)**, a collection of fun and interactive web-based games.

## 🚀 Features

*   **Classic Daily Puzzle:** A new five-letter word challenge awaits you every day.
*   **Responsive Design:** Play seamlessly on your desktop, tablet, or mobile device.
*   **Hard Mode:** For an extra challenge, enable Hard Mode to force the use of revealed hints.
*   **Instant Feedback:** Color-coded tiles provide immediate clues after each guess.
*   **In-Depth Guide:** An integrated, collapsible article covers everything from basic rules to advanced strategies to help you become a true Wordle Master.

## 🕹️ How to Play

1.  You have six attempts to guess the secret five-letter word.
2.  Each guess must be a valid five-letter word.
3.  After each guess, the color of the tiles will change to provide clues:
    *   **Green:** The letter is correct and in the right position.
    *   **Yellow:** The letter is in the word but in the wrong position.
    *   **Gray:** The letter is not in the word.

## 🛠️ Tech Stack

This project is built with a modern, production-ready tech stack:

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Deployment:** Ready for Netlify

<<<<<<< HEAD
## 部署到Netlify

Follow this step-by-step guide to deploy your WordleMaster site to Netlify.

### Step 1: Push Your Code to GitHub

Before you can deploy to Netlify, your project's code must be in a Git repository on a platform like GitHub, GitLab, or Bitbucket.

If you haven't done so already, follow these commands in your terminal:
```bash
# 1. Initialize a new Git repository
git init -b main

# 2. Add all files to be tracked
git add .

# 3. Create your first commit
git commit -m "Initial commit"

# 4. Add your GitHub repository as the remote origin (replace with your URL)
git remote add origin https://github.com/YourUsername/your-repo-name.git

# 5. Push your code to GitHub
git push -u origin main
```

### Step 2: Create a Netlify Account

Go to [app.netlify.com](https://app.netlify.com/) and sign up for a free account. You can sign up using your GitHub account for a seamless experience.

### Step 3: Import Your Project

1.  From your Netlify dashboard, click the **"Add new site"** button and select **"Import an existing project"** from the dropdown menu.
2.  Connect to your Git provider (e.g., GitHub). You may need to authorize Netlify to access your repositories.
3.  Choose the repository for your WordleMaster project.

### Step 4: Configure Build Settings

Netlify is excellent at automatically detecting Next.js projects. The `netlify.toml` file in this project already tells Netlify everything it needs to know.

*   **Build command:** `npm run build`
*   **Publish directory:** `.next`

These settings should be pre-filled for you. You can typically just proceed to the next step.

### Step 5: Add Environment Variables (For Secrets)

This is a crucial step for any application with secret keys (like API keys or database credentials). While this project currently has its configuration publicly in `src/firebase/config.ts`, if you move sensitive data to a `.env.local` file in the future, you must add it to Netlify's environment variables to keep it secure.

1.  In the site setup screen, go to the **"Environment variables"** section.
2.  Click **"Add a variable"**.
3.  Add your variables one by one. For a Next.js project, public variables must be prefixed with `NEXT_PUBLIC_`.

**Example:**
If you had a file named `.env.local` with the following content:
```
NEXT_PUBLIC_FIREBASE_API_KEY="your-secret-api-key"
ANALYTICS_ID="your-analytics-id"
```

You would add them in the Netlify UI like this:
*   **Key:** `NEXT_PUBLIC_FIREBASE_API_KEY` | **Value:** `your-secret-api-key`
*   **Key:** `ANALYTICS_ID` | **Value:** `your-analytics-id`

**Important:** Never commit your `.env.local` file or any other file containing secrets to your public repository. The `.gitignore` file in this project is already configured to prevent this.

### Step 6: Deploy Your Site

Click the **"Deploy site"** button. Netlify will start building your project. You can watch the deployment logs in real-time. Once the build is complete, your site will be live on a unique Netlify URL (e.g., `your-site-name.netlify.app`).

You can customize the domain name later in your site's settings on Netlify.

=======
>>>>>>> 9b58beb12e5b6c5067840f6e4d8c5c2431b3ab7d
## ✨ Powered By

[![SYNC TECH](https://www.synctech.ie/assets/logo-light.svg)](https://synctech.ie)

This project was developed and is maintained by **[SYNC TECH](https://synctech.ie)**. We are a technology company passionate about building high-quality, scalable, and beautiful web applications.

Explore more games at the **[SYNC TECH GAME HUB](https://synctech.ie/gamehub)**.
