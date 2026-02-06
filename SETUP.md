# 🚀 SETUP INSTRUCTIONS

## Step 1: Apply Fixes
1. Delete old `_env` file (if exists)
2. Create new `.env` file with content from above
3. Replace `services/geminiService.ts` with new version
4. Verify `package.json` has correct dependency

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Start Development Server
```bash
npm run dev
```

## Step 4: Verify in Browser Console
Open F12 and you should see:
```
🔑 API Key present: YES ✅
🔑 API Key length: 39
🚀 Sending request to Gemini...
✅ Gemini Response received: {"narrative":"...","outfit":"...","activity":"...","music":"..."}
```

## ✅ SUCCESS INDICATORS:
- Beautiful poetic narratives appear in UI
- Outfit suggestions are creative and specific
- Activity recommendations are weather-appropriate
- Music suggestions match the mood

## ❌ IF STILL NOT WORKING:
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+Shift+R)
3. Restart dev server
4. Check API key at https://aistudio.google.com/apikey
5. Verify .env file is in project root
6. Check browser console for errors
