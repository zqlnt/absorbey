# Absorbey - Blank Screen Debugging Report

## Project Overview

**Absorbey** is a learning app that converts YouTube videos into educational content:
- Takes YouTube URLs as input
- Extracts video transcripts using `yt-dlp`
- Generates comprehensive AI summaries using Claude 3.5 Sonnet (Anthropic API)
- Creates interactive quiz cards
- Tracks user progress and quiz results
- Firebase authentication (Google Sign-In + Guest mode)
- Firestore for data storage (planned, currently using localStorage)

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS v3
- **Backend:** Node.js/Express proxy server (server.js) for API calls
- **AI:** Anthropic Claude 3.5 Sonnet API
- **Auth:** Firebase Authentication
- **Database:** Firestore (future), localStorage (current)
- **Deployment:** Vercel (frontend), Railway/Render (backend - planned)
- **Transcript:** yt-dlp via Node.js child_process

## Current Issue: Blank White Screen

### Symptom
- Both local (http://localhost:3000) and Vercel deployment show blank white screen
- HTML loads correctly (200 OK responses)
- CSS and JS files load (304/200 responses)
- But nothing renders on the page

### Recent Changes That May Have Caused This

1. **Authentication Integration (Most Recent)**
   - Added Firebase authentication requirement before creating projects
   - Changed from `currentUser` to `user` in WelcomeScreen.jsx
   - Modified AuthContext to handle null Firebase auth
   - Added 3-second timeout for auth initialization

2. **Mobile Responsiveness (Previous)**
   - Converted inline styles to Tailwind classes in App.jsx
   - Added responsive breakpoints (sm:, md:, etc.)
   - Made sidebar hide on mobile when project selected

3. **Enhanced Summary Sections**
   - Added new extraction functions: `extractStats`, `extractPeople`, `extractTimeline`, `extractQuotes`
   - Modified `getSummaryPoints` to parse comprehensive summaries
   - Added error handling with try-catch blocks

4. **Firebase Configuration**
   - Modified firebase.js to handle missing environment variables
   - Added null checks throughout AuthContext
   - Made app work without Firebase credentials

### What We've Tried

✅ **Fixed:** Variable name mismatch (`currentUser` → `user`)
✅ **Fixed:** Added Firebase null-safety checks
✅ **Fixed:** Added auth timeout (3 seconds)
✅ **Fixed:** Created `.env.local` with Firebase credentials locally
✅ **Added:** Error boundary in main.jsx
✅ **Added:** Loading spinner during auth initialization
❌ **Still broken:** Blank screen persists

### File Structure

```
absorbey/
├── src/
│   ├── App.jsx                    # Main app component with routing
│   ├── main.jsx                   # Entry point with ErrorBoundary
│   ├── components/
│   │   ├── WelcomeScreen.jsx      # Home screen with input
│   │   ├── ProjectView.jsx        # Shows summaries & quizzes
│   │   ├── Sidebar.jsx            # Project list sidebar
│   │   ├── AuthModal.jsx          # Sign-in modal
│   │   └── LavaOrb.jsx            # Animated logo
│   ├── context/
│   │   ├── AuthContext.jsx        # Firebase auth state
│   │   └── ProjectContext.jsx     # Project data management
│   ├── config/
│   │   └── firebase.js            # Firebase initialization
│   └── services/
│       └── anthropicService.js    # API calls to backend
├── server.js                      # Express proxy for Anthropic API
├── .env.local                     # Local environment variables (created)
└── dist/                          # Built files for production
```

### Key Code Sections

**App.jsx (Lines 10-25):**
```javascript
function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth(); // Uses Firebase auth

  const handleProjectCreated = (projectId) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedProjectId(projectId);
  };
  // ... rest of component
}
```

**AuthContext.jsx (Lines 25-57):**
```javascript
useEffect(() => {
  // If auth is not initialized, skip
  if (!auth) {
    console.warn('⚠️ Firebase Auth not initialized');
    setLoading(false);
    return;
  }

  const unsubscribe = onAuthStateChanged(auth, 
    (user) => {
      setUser(user);
      setLoading(false);
    },
    (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    }
  );

  // Fallback timeout
  const timeout = setTimeout(() => {
    if (loading) {
      console.warn('Auth timeout - proceeding');
      setLoading(false);
    }
  }, 3000);

  return () => {
    unsubscribe();
    clearTimeout(timeout);
  };
}, []);
```

**AuthContext.jsx (Lines 90-112) - Render:**
```javascript
return (
  <AuthContext.Provider value={value}>
    {loading ? (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Absorbey...</p>
        </div>
      </div>
    ) : (
      children
    )}
  </AuthContext.Provider>
);
```

**firebase.js (Lines 23-45):**
```javascript
let app = null;
let auth = null;
let db = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized');
  } else {
    console.warn('⚠️ Firebase not initialized - missing config');
  }
} catch (error) {
  console.error('❌ Firebase init failed:', error.message);
}

export { auth, db };
```

### Possible Root Causes

1. **React/Vite Version Mismatch**
   - Using React 19.1.1 (latest)
   - Using Vite 7.1.8
   - Using Node.js 20.15.1 (Vite wants 20.19+)
   - Potential compatibility issue?

2. **Tailwind CSS Not Loading**
   - Converted from inline styles to Tailwind classes
   - PostCSS config might be incorrect
   - Tailwind classes might not be compiling

3. **AuthContext Loading State Stuck**
   - Even with timeout, maybe loading never becomes false?
   - Firebase initialization might be throwing unhandled error
   - onAuthStateChanged might not be calling callbacks

4. **ErrorBoundary Not Catching Error**
   - Error might be happening outside React's render cycle
   - Could be during module initialization
   - Browser console should show JavaScript errors

5. **Build Process Issue**
   - Vite build succeeds but output might be broken
   - Missing dependencies in production bundle
   - Tree-shaking removing needed code

6. **Environment Variable Issues**
   - Vercel might not have all required env vars
   - Firebase config might be malformed
   - API keys might be invalid

### Environment Variables Required

```bash
# Firebase
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID

# APIs
VITE_ANTHROPIC_API_KEY
YOUTUBE_API_KEY
```

### Browser Console Investigation Needed

Please check browser console (F12) for:
1. **JavaScript errors** (red text)
2. **Console warnings** (yellow text)
3. **Network errors** (failed requests)
4. **Firebase logs** (⚠️, ✅, ❌ emojis)
5. **React errors** (component stack traces)

Look for:
- "Firebase initialization failed"
- "Auth state change error"
- "Cannot read property of undefined"
- "Unexpected token"
- Any CORS errors
- Any module not found errors

### Next Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. Copy ALL console output (errors, warnings, logs)
5. Go to Network tab
6. Check if any requests failed (red status)
7. Share findings

### Additional Context

- **Was working:** App worked before authentication integration
- **Vercel status:** Has Firebase env vars configured
- **Local status:** Now has .env.local file with Firebase config
- **Both failing:** Suggests issue is in code, not environment
- **No error boundary triggered:** Error might be pre-React

### Questions for Claude

1. Could the AuthContext loading logic create an infinite loop?
2. Is there a Tailwind CSS compilation issue?
3. Could React 19 + Vite 7 have compatibility issues?
4. Should we add more defensive checks around Firebase?
5. Could the ErrorBoundary be ineffective for this type of error?
6. Should we try reverting to a previous working commit?

---

Generated: 2025-10-03
Status: Debugging in progress
