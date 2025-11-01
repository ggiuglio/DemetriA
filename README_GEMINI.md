# 🤖 Gemini AI Integration - Quick Start

## ✅ What's Been Done

Your DemetriA IQ page now uses **real AI** powered by Google's Gemini instead of mock responses!

## 🚀 Quick Setup (3 Steps)

### Option A: Automated Setup (Recommended)

```bash
./setup-gemini.sh
```

### Option B: Manual Setup

**1. Install the package:**
```bash
npm install @google/generative-ai
```

**2. Get your API key:**
- Visit: https://makersuite.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key

**3. Create `.env` file:**
```bash
echo "GEMINI_API_KEY=paste_your_key_here" > .env
```

**4. Start the app:**
```bash
npm run dev
```

**5. Test it:**
- Go to: http://localhost:5173/iq
- Ask: "How do I improve soil quality?"
- Get real AI responses! 🎉

## 📁 What Changed

### New Files
- ✅ `/src/routes/api/gemini/+server.ts` - API endpoint
- ✅ `/src/lib/gemini.ts` - Helper functions
- ✅ `.env.example` - Environment template
- ✅ `GEMINI_SETUP.md` - Detailed guide
- ✅ `setup-gemini.sh` - Setup script

### Modified Files
- ✅ `/src/routes/iq/+page.svelte` - Now uses Gemini AI

## 🎯 Features

- **Real AI Responses** - Powered by Gemini Pro
- **Agricultural Expert** - Specialized for farming advice
- **Conversation Memory** - Remembers last 3 exchanges
- **Error Handling** - Graceful failures with user feedback
- **Suggested Questions** - Help users get started
- **Loading States** - Visual feedback while thinking

## 🔒 Security

- ✅ API key stored server-side only
- ✅ Never exposed to client
- ✅ `.env` in `.gitignore`
- ✅ Secure API endpoint

## 🐛 Troubleshooting

**Lint errors?**
- Normal until you run `npm install @google/generative-ai`
- Restart dev server after install

**API not working?**
- Check `.env` file exists in project root
- Verify API key is correct (no extra spaces)
- Restart dev server to load env vars

**Still stuck?**
- See `GEMINI_SETUP.md` for detailed troubleshooting

## 💡 Example Questions to Try

1. "How do I improve soil quality?"
2. "What's the best time to plant wheat?"
3. "How can I control pests naturally?"
4. "What irrigation method should I use for tomatoes?"
5. "Tell me about crop rotation benefits"

## 📊 Before & After

### Before (Mock Responses)
```javascript
const mockResponses = {
  'wheat': 'Wheat is best planted...',
  'default': 'That\'s a great question...'
};
```

### After (Real AI)
```javascript
import { sendPromptToGemini } from '$lib/gemini';

const response = await sendPromptToGemini(userQuestion);
// Gets intelligent, contextual responses from Gemini!
```

## 📚 Documentation

- **Quick Start**: This file (README_GEMINI.md)
- **Detailed Setup**: GEMINI_SETUP.md
- **Integration Summary**: INTEGRATION_SUMMARY.md

## 🎓 Usage Limits

**Free Tier:**
- 60 requests per minute
- Perfect for development and testing

**Need more?**
- Check pricing: https://ai.google.dev/pricing

## 🚀 Next Steps

Your IQ page is ready! Just:
1. Run the setup script or install manually
2. Add your API key to `.env`
3. Start the dev server
4. Visit `/iq` and start chatting!

---

**Questions?** Check `GEMINI_SETUP.md` for detailed help!
