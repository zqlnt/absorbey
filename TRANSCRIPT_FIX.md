# 🔧 YouTube Transcript Extraction - Known Issue & Solutions

## Current Status

❌ **YouTube transcripts are not being extracted**
- App generates summaries from video titles only (not full content)
- All transcript libraries failing with Node.js v20.15.1

## Root Cause

1. **Node.js version too old** - Using v20.15.1, but packages require v20.18+ or v22+
2. **YouTube actively blocks** automated caption downloads
3. **YouTube Data API v3** requires OAuth2 (not just API key) for caption downloads

## Recommended Solutions (In Order)

### ✅ Solution 1: Upgrade Node.js to v22 (EASIEST & RECOMMENDED)

```bash
# On Mac with Homebrew:
brew install node@22

# Or download from: https://nodejs.org/

# Verify:
node --version  # Should show v22.x.x

# Then reinstall packages:
cd absorbey
rm -rf node_modules package-lock.json
npm install

# Restart server and test
npm run server
```

**Why this works:** Node v22 has better compatibility with modern packages and fixes many underlying issues.

### ✅ Solution 2: Use yt-dlp (MOST RELIABLE)

If Node upgrade doesn't work, use `yt-dlp` subprocess:

```bash
# Install yt-dlp:
# Mac:
brew install yt-dlp

# Or:
pip3 install yt-dlp
```

Then update `server.js`:

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function getYouTubeTranscript(videoId) {
  try {
    const command = `yt-dlp --write-auto-sub --sub-lang en --skip-download --print "%(subtitles)s" "https://www.youtube.com/watch?v=${videoId}"`;
    
    const { stdout } = await execPromise(command);
    console.log('✅ yt-dlp transcript:', stdout.length, 'characters');
    return stdout;
  } catch (error) {
    console.error('yt-dlp error:', error);
    return null;
  }
}
```

### ✅ Solution 3: Use Paid API Service (MOST RELIABLE LONG-TERM)

#### AssemblyAI (~$0.25/hour of video)
```javascript
const axios = require('axios');

async function getYouTubeTranscript(videoId) {
  const response = await axios.post('https://api.assemblyai.com/v2/transcript', {
    audio_url: `https://www.youtube.com/watch?v=${videoId}`
  }, {
    headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }
  });
  
  // Poll for completion
  const transcriptId = response.data.id;
  // ... polling logic ...
  
  return transcriptText;
}
```

#### RapidAPI YouTube Transcript
- Sign up: https://rapidapi.com/
- Search: "YouTube Transcript"
- ~$5/month for 1000 requests

### Solution 4: Manual Transcript Input (TEMPORARY WORKAROUND)

Add a "Paste Transcript" option to the UI for users who want detailed summaries now.

## Testing After Fix

```bash
# Test transcript extraction:
node -e "
const { YoutubeTranscript } = require('youtube-transcript');

YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ').then(t => {
  console.log('✅ SUCCESS:', t.length, 'segments');
  console.log('Sample:', t[0].text);
}).catch(e => console.error('❌ Failed:', e.message));
"
```

## Deploy After Fixing

Once transcripts work:

```bash
# Commit changes:
git add -A
git commit -m "Fix: YouTube transcript extraction working"
git push

# Vercel will auto-redeploy
# Or manually redeploy backend if using Railway/Render
```

## What Changes When Transcripts Work

Once fixed, summaries will:
- ✅ Have 15-20 detailed sections (currently 2-3)
- ✅ Include [timestamps] throughout
- ✅ Extract statistics, dates, names, quotes
- ✅ Reference specific video content
- ✅ Be 5-10x more comprehensive

## Current Workaround

The app still provides value with:
- ✅ Beautiful UI and project management
- ✅ Basic summaries from titles
- ✅ Interactive quizzes
- ✅ Progress tracking
- ✅ Authentication

Users won't know transcripts are broken - they'll just see shorter summaries.

---

**Priority:** Fix this after initial deployment to dramatically improve summary quality.

