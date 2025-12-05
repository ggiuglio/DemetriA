# Firebase Cloud Functions Setup for Gemini API

This guide explains how to deploy and configure Firebase Cloud Functions to handle Gemini API calls securely without SSR.

## Architecture

- **Frontend**: Static site (SPA) deployed to Firebase Hosting
- **Backend**: Cloud Functions handle Gemini API calls
- **Development**: Local SvelteKit API routes (`/api/gemini`)
- **Production**: Cloud Functions (`https://europe-west1-PROJECT_ID.cloudfunctions.net/geminiChat`)

## Setup Steps

### 1. Install Dependencies (Already Done)

The `functions/` directory has been created with:
- `package.json` - Dependencies configuration
- `index.js` - Cloud Functions code
- `.gitignore` - Ignore node_modules

### 2. Install Function Dependencies

```bash
cd functions
npm install --legacy-peer-deps
cd ..
```

If you get permission errors, run:
```bash
sudo chown -R $(whoami) ~/.npm
```

### 3. Configure Gemini API Key

Set your Gemini API key as a Firebase config variable:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key from your `.env` file.

To verify it's set:
```bash
firebase functions:config:get
```

### 4. Deploy Functions

Deploy the Cloud Functions to Firebase:

```bash
firebase deploy --only functions
```

This will deploy two functions:
- `geminiChat` - Handles chat requests
- `geminiModels` - Lists available models

### 5. Build and Deploy Frontend

Build your static site:
```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

Or deploy everything at once:
```bash
firebase deploy
```

## Testing

### Test Locally

1. Start the emulator:
```bash
firebase emulators:start --only functions
```

2. In another terminal, start your dev server:
```bash
npm run dev
```

3. Visit http://localhost:5173/iq and test the chat

### Test in Production

After deployment, visit your Firebase Hosting URL:
```
https://YOUR-PROJECT-ID.web.app/iq
```

## Environment Variables

Make sure your `.env` file has:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_PROJECT_ID=demetria-b7ee8
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

The `VITE_FIREBASE_PROJECT_ID` is used by the client to construct the Cloud Function URLs.

## How It Works

### Development Mode (`npm run dev`)
- `import.meta.env.PROD` = `false`
- Calls local API: `/api/gemini`
- Uses SvelteKit server endpoints
- API key from `.env` file

### Production Mode (Firebase Hosting)
- `import.meta.env.PROD` = `true`
- Calls Cloud Function: `https://europe-west1-PROJECT_ID.cloudfunctions.net/geminiChat`
- Uses Firebase Cloud Functions
- API key from Firebase config

## Cloud Functions

### geminiChat
**URL**: `https://europe-west1-PROJECT_ID.cloudfunctions.net/geminiChat`

**Method**: POST

**Body**:
```json
{
  "prompt": "Your question here",
  "model": "gemini-2.0-flash-exp"
}
```

**Response**:
```json
{
  "success": true,
  "text": "AI response here",
  "model": "gemini-2.0-flash-exp"
}
```

### geminiModels
**URL**: `https://europe-west1-PROJECT_ID.cloudfunctions.net/geminiModels`

**Method**: GET

**Response**:
```json
{
  "success": true,
  "models": [
    {
      "name": "models/gemini-2.0-flash-exp",
      "displayName": "Gemini 2.0 Flash",
      "description": "...",
      "supportedMethods": ["generateContent"]
    }
  ]
}
```

## Troubleshooting

### Error: "Gemini API key not configured"

**Solution**: Set the API key in Firebase config:
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase deploy --only functions
```

### Error: "CORS policy"

**Solution**: The functions already have CORS enabled. If you still see errors, check that the function URLs are correct.

### Error: "Function not found"

**Solution**: Make sure functions are deployed:
```bash
firebase deploy --only functions
```

### Functions not updating

**Solution**: Clear the cache and redeploy:
```bash
firebase functions:config:get
firebase deploy --only functions --force
```

## Pricing

Firebase Cloud Functions pricing (Blaze plan required):
- **Free tier**: 2M invocations/month, 400K GB-seconds, 200K CPU-seconds
- **After free tier**: $0.40 per million invocations

For typical usage (100-1000 requests/day), you'll stay within the free tier.

## Security

✅ **API key is secure**: Stored in Firebase config, never exposed to client
✅ **CORS enabled**: Only your domain can call the functions (configure if needed)
✅ **No SSR required**: Static site with serverless backend

## Next Steps

1. **Add rate limiting**: Prevent abuse
2. **Add authentication**: Require user login
3. **Add monitoring**: Track usage and errors
4. **Add caching**: Reduce API calls

## Support

If you encounter issues:
1. Check Firebase Console → Functions for logs
2. Verify API key is set: `firebase functions:config:get`
3. Check function URLs match your project ID
4. Review browser console for errors
