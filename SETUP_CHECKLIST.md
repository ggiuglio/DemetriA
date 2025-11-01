# ✅ Gemini AI Setup Checklist

Follow these steps in order to get your IQ page working with Gemini AI.

## Pre-Setup

- [ ] You have Node.js and npm installed
- [ ] You have a Google account
- [ ] Your project is in `/Users/giuliogherardi/code/DemetriA`

## Step 1: Install Dependencies

Choose one method:

### Method A: Automated (Recommended)
```bash
cd /Users/giuliogherardi/code/DemetriA
./setup-gemini.sh
```

### Method B: Manual
```bash
cd /Users/giuliogherardi/code/DemetriA
npm install @google/generative-ai
```

**Verify:**
- [ ] Package installed successfully
- [ ] No error messages in terminal

## Step 2: Get API Key

1. [ ] Go to https://makersuite.google.com/app/apikey
2. [ ] Sign in with your Google account
3. [ ] Click "Create API Key" button
4. [ ] Copy the generated key (starts with `AIza...`)

**Important:** Keep this key secret! Never commit it to git.

## Step 3: Configure Environment

Create `.env` file in project root:

```bash
cd /Users/giuliogherardi/code/DemetriA
echo "GEMINI_API_KEY=your_actual_key_here" > .env
```

**Replace `your_actual_key_here` with the key you copied!**

**Verify:**
- [ ] `.env` file exists in project root
- [ ] File contains `GEMINI_API_KEY=AIza...`
- [ ] No extra spaces or quotes around the key
- [ ] `.env` is in `.gitignore`

## Step 4: Restart Dev Server

If your dev server is running, restart it:

```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm run dev
```

**Verify:**
- [ ] Server starts without errors
- [ ] No environment variable warnings

## Step 5: Test the Integration

1. [ ] Open browser to http://localhost:5173/iq
2. [ ] You should see "DemetriA IQ" page
3. [ ] Welcome message mentions "powered by Gemini"
4. [ ] Suggested questions are visible

**Try asking:**
- [ ] "How do I improve soil quality?"
- [ ] Wait for response (1-3 seconds)
- [ ] You get a detailed, intelligent answer
- [ ] Response is NOT one of the old mock responses

## Troubleshooting

### ❌ Lint Errors in IDE

**Symptoms:**
- Red underlines in `+page.svelte`
- "Cannot find module '$lib/gemini'"
- "Cannot find module '@google/generative-ai'"

**Solution:**
These are expected before installation. After running `npm install @google/generative-ai`:
1. Restart your dev server
2. Reload your IDE/editor
3. Errors should disappear

### ❌ "GEMINI_API_KEY is not defined"

**Check:**
- [ ] `.env` file exists in project root (not in `src/`)
- [ ] File contains `GEMINI_API_KEY=...`
- [ ] No typos in variable name
- [ ] Dev server was restarted after creating `.env`

**Fix:**
```bash
# Verify file exists
ls -la .env

# Check contents
cat .env

# Should show: GEMINI_API_KEY=AIza...
```

### ❌ "API key not valid"

**Check:**
- [ ] Copied entire API key (usually starts with `AIza`)
- [ ] No extra spaces before/after key
- [ ] No quotes around key in `.env`
- [ ] Key is from https://makersuite.google.com/app/apikey

**Fix:**
1. Go back to Google AI Studio
2. Generate a new API key
3. Update `.env` file
4. Restart dev server

### ❌ "Failed to get response from Gemini"

**Check:**
- [ ] Internet connection is working
- [ ] API key is valid
- [ ] Not hitting rate limits (60 requests/minute)
- [ ] Check browser console for detailed errors

**Fix:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify API endpoint is responding

### ❌ Getting Mock Responses

**Symptoms:**
- Responses are generic/short
- Same response for different questions
- Responses match old mock data

**This means:**
- Gemini integration is NOT working
- Check all previous steps

**Fix:**
1. Verify `npm install` completed
2. Check `.env` file exists and is correct
3. Restart dev server
4. Clear browser cache
5. Check browser console for errors

## Verification Tests

Run these tests to confirm everything works:

### Test 1: Basic Question
- [ ] Ask: "What is crop rotation?"
- [ ] Get detailed, multi-paragraph response
- [ ] Response mentions benefits and examples

### Test 2: Follow-up Question
- [ ] Ask: "How does it help soil?"
- [ ] Response references previous question
- [ ] Shows conversation context is working

### Test 3: Suggested Questions
- [ ] Click a suggested question button
- [ ] Question appears in input
- [ ] Response is generated automatically

### Test 4: Error Handling
- [ ] Temporarily rename `.env` to `.env.backup`
- [ ] Restart server
- [ ] Ask a question
- [ ] Should see error message (not crash)
- [ ] Rename `.env.backup` back to `.env`
- [ ] Restart server

## Success Criteria

You're done when:

- ✅ No lint errors in IDE
- ✅ Dev server runs without errors
- ✅ IQ page loads successfully
- ✅ Questions get intelligent AI responses
- ✅ Responses are detailed and contextual
- ✅ Loading indicator shows while thinking
- ✅ Conversation context is maintained
- ✅ Suggested questions work

## Files to Check

Verify these files exist:

```bash
# Core files (created by integration)
ls -la src/routes/api/gemini/+server.ts
ls -la src/lib/gemini.ts
ls -la .env

# Documentation (helpful but optional)
ls -la GEMINI_SETUP.md
ls -la README_GEMINI.md
ls -la INTEGRATION_SUMMARY.md
ls -la ARCHITECTURE.md
```

## Next Steps After Setup

Once everything works:

1. [ ] Read `INTEGRATION_SUMMARY.md` to understand what changed
2. [ ] Check `ARCHITECTURE.md` to see how it works
3. [ ] Try different agricultural questions
4. [ ] Consider adding conversation history persistence
5. [ ] Think about rate limiting for production

## Support

If you're still stuck:

1. **Check Documentation:**
   - `README_GEMINI.md` - Quick start
   - `GEMINI_SETUP.md` - Detailed setup
   - `INTEGRATION_SUMMARY.md` - What changed
   - `ARCHITECTURE.md` - How it works

2. **Check Logs:**
   - Browser console (F12)
   - Terminal where dev server runs
   - Network tab in DevTools

3. **Verify Environment:**
   ```bash
   # Check Node version
   node --version  # Should be 16+
   
   # Check npm version
   npm --version
   
   # Check if package is installed
   npm list @google/generative-ai
   ```

## Security Reminder

- ⚠️ Never commit `.env` to git
- ⚠️ Never share your API key
- ⚠️ API key should only be in `.env` file
- ⚠️ Keep `.env` in `.gitignore`

## Cost Tracking

Free tier limits:
- 60 requests per minute
- Perfect for development

Monitor usage at:
https://makersuite.google.com/app/apikey

---

**Ready to start?** Run `./setup-gemini.sh` and follow this checklist!
