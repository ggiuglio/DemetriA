# Firebase Setup Guide for DemetriA

This guide will help you set up Firebase to store chat history in the cloud.

## Step 1: Install Firebase

```bash
npm install firebase
```

## Step 2: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `demetria` (or your preferred name)
4. Disable Google Analytics (optional, not needed for this)
5. Click "Create project"

## Step 3: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`)
2. Register app nickname: `DemetriA Web`
3. **Don't** check "Firebase Hosting" (not needed)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
   - Test mode allows read/write without authentication
   - **Important**: Change to production rules before deploying!
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 5: Configure Environment Variables

Add your Firebase config to `.env` file:

```env
# Gemini API Key (already configured)
GEMINI_API_KEY=AIzaSyCwLxBkLsk8u8qvI3ZIUy3LbROFwic8nDs

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Where to Find These Values:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Find your web app
4. Copy each value from the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // → VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",    // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com", // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"          // → VITE_FIREBASE_APP_ID
};
```

## Step 6: Set Firestore Security Rules

For development (test mode):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production (recommended):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write their own chat sessions
    match /chat_sessions/{sessionId} {
      allow read, write: if true; // Or add authentication
    }
  }
}
```

## Step 7: Test the Integration

1. Install Firebase:
   ```bash
   npm install firebase
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

3. Go to http://localhost:5173/iq

4. Ask a question

5. Check Firebase Console → Firestore Database
   - You should see a new collection: `chat_sessions`
   - Inside: documents with your chat messages

## How It Works

### Data Structure

Each chat session is stored as a document in Firestore:

```javascript
{
  messages: [
    { role: "assistant", content: "Hello! ..." },
    { role: "user", content: "How do I..." },
    { role: "assistant", content: "To improve..." }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  userId: "anonymous"
}
```

### Features

- ✅ **Auto-save**: Every message is saved to Firebase
- ✅ **Cross-device**: Access history from any device
- ✅ **Persistent**: Never loses data
- ✅ **Real-time**: Updates instantly
- ✅ **Scalable**: Handles unlimited history

## Firestore Pricing

### Free Tier (Spark Plan)
- **Stored data**: 1 GB
- **Document reads**: 50,000/day
- **Document writes**: 20,000/day
- **Document deletes**: 20,000/day

This is **more than enough** for development and small-scale use!

### Estimated Usage

- Each chat message: ~500 bytes
- 1000 messages: ~0.5 MB
- **You can store ~2 million messages in free tier!**

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Solution**: Check Firestore rules are set to test mode:
```javascript
allow read, write: if true;
```

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solution**: 
1. Verify `.env` file has all Firebase variables
2. Restart dev server
3. Check browser console for config errors

### Error: "Cannot find module 'firebase'"

**Solution**: Install Firebase:
```bash
npm install firebase
```

### Chat history not loading

**Solution**:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Check for `current_session_id`
4. Go to Firebase Console → Firestore
5. Verify the session document exists

## Next Steps (Optional)

### Add User Authentication

To support multiple users with separate histories:

1. Enable Firebase Authentication
2. Add sign-in UI
3. Update security rules to check `auth.uid`
4. Store `userId` with each session

### Add Chat History Page

Create a page to view all past conversations:

```svelte
<!-- /src/routes/iq/history/+page.svelte -->
<script>
  import { getRecentChatSessions } from '$lib/chatHistory';
  
  let sessions = [];
  
  onMount(async () => {
    sessions = await getRecentChatSessions(20);
  });
</script>

{#each sessions as session}
  <div>
    <h3>{session.createdAt}</h3>
    <p>{session.messages.length} messages</p>
  </div>
{/each}
```

## Security Best Practices

1. **Never commit `.env`** to git
2. **Use production rules** before deploying
3. **Add authentication** for multi-user apps
4. **Monitor usage** in Firebase Console
5. **Set up billing alerts** to avoid surprises

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Verify all environment variables are set
3. Check browser console for JavaScript errors
4. Ensure Firestore is enabled in Firebase Console
