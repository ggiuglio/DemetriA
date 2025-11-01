# 🔥 Firebase Quick Start - 5 Minutes

Get Firebase chat history working in 5 minutes!

## Step 1: Install Firebase (30 seconds)

```bash
npm install firebase
```

## Step 2: Create Firebase Project (2 minutes)

1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `demetria`
4. Disable Google Analytics
5. Click "Create project"

## Step 3: Set Up Firestore (1 minute)

1. In Firebase Console: **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"**
4. Select location (closest to you)
5. Click "Enable"

## Step 4: Get Your Config (1 minute)

1. Click the **gear icon** (Project Settings)
2. Scroll to "Your apps"
3. Click the **Web icon** `</>`
4. Register app: `DemetriA Web`
5. Copy the config values

## Step 5: Add to .env (30 seconds)

Open your `.env` file and add:

```env
GEMINI_API_KEY=AIzaSyCwLxBkLsk8u8qvI3ZIUy3LbROFwic8nDs

VITE_FIREBASE_API_KEY=paste_your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 6: Restart & Test (30 seconds)

```bash
npm run dev
```

Go to http://localhost:5173/iq and ask a question!

Check Firebase Console → Firestore Database to see your saved chat! 🎉

---

## What You Get

- ✅ Chat history saved to cloud
- ✅ Works across all devices
- ✅ Never loses data
- ✅ Automatic backups
- ✅ Free tier: 1GB storage + 50k reads/day

## Need Help?

See `FIREBASE_SETUP.md` for detailed instructions.
