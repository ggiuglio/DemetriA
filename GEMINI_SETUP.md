# Gemini AI Integration Setup Guide

This guide will help you set up Gemini AI for the DemetriA IQ chat feature.

## Prerequisites

- Node.js and npm installed
- A Google account

## Step 1: Install Dependencies

Run the following command in your project directory:

```bash
npm install @google/generative-ai
```

## Step 2: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist):

```bash
touch .env
```

2. Add your Gemini API key to the `.env` file:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

3. Make sure `.env` is in your `.gitignore` file to keep your API key secure:

```bash
echo ".env" >> .gitignore
```

## Step 4: Start the Development Server

```bash
npm run dev
```

## Step 5: Test the Integration

1. Navigate to the IQ page at `http://localhost:5173/iq` (or your dev server URL)
2. Try asking a question like "How do I improve soil quality?"
3. You should receive a response from Gemini AI

## Troubleshooting

### Error: "Cannot find module '@google/generative-ai'"
- Make sure you ran `npm install @google/generative-ai`
- Restart your dev server after installing

### Error: "GEMINI_API_KEY is not defined"
- Check that your `.env` file exists in the project root
- Verify the API key is correctly set in `.env`
- Restart your dev server to load the new environment variables

### Error: "API key not valid"
- Verify your API key is correct
- Check that you copied the entire key without extra spaces
- Generate a new API key from Google AI Studio if needed

### Error: "Failed to get response from Gemini"
- Check your internet connection
- Verify your API key has not been rate-limited
- Check the browser console for detailed error messages

## Features

The IQ page now includes:

- ✅ Real-time responses from Gemini AI
- ✅ Conversation context (last 3 exchanges)
- ✅ Agricultural expert system prompt
- ✅ Error handling and user feedback
- ✅ Suggested questions for new users
- ✅ Loading states and animations

## API Usage Limits

Google's Gemini API has usage limits:
- Free tier: 60 requests per minute
- Check [Google AI Studio](https://ai.google.dev/pricing) for current pricing

## Security Notes

- Never commit your `.env` file to version control
- Never expose your API key in client-side code
- The API key is only used in server-side routes (`+server.ts`)
- Consider implementing rate limiting for production use

## Next Steps

Consider adding:
- Conversation history persistence
- User authentication
- Rate limiting
- Streaming responses for longer answers
- Multi-language support
