# 💸 Allowance Tracker

A mobile-first PWA for tracking personal spending by category with monthly limits.

## Features
- 📊 Analytics with charts (3M / 6M / 12M range)
- 🔥 Real-time sync via Firebase Firestore
- 🌙 Dark / light mode
- 📤 Export to CSV or XLSX
- 📱 Installable PWA (works offline after first load)

## Stack
- Vanilla HTML / CSS / JS — no build step needed
- Firebase Firestore (real-time database)
- Hosted on Netlify

## Deploy
1. Fork or clone this repo
2. Connect to [Netlify](https://netlify.com) — point to this repo, no build command needed, publish directory is `/`
3. Done — Netlify auto-deploys on every push to `main`

## Firebase setup
The Firebase config is already embedded in `index.html`.  
To use your own project, replace the `firebaseConfig` object in the `<script type="module">` block.

Make sure Firestore is enabled in **test mode** (or set proper security rules for production).
