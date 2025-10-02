# Security Guidelines for Absorbey

## 🔐 Environment Variables Setup

### 1. Create your .env.local file

Copy the `env.template` file and rename it to `.env.local`:

```bash
cp env.template .env.local
```

### 2. Fill in your API keys

The `.env.local` file should contain:

```env
# Firebase Configuration (Safe to expose in frontend)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Anthropic API Key (⚠️ SECURITY WARNING)
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## ⚠️ IMPORTANT SECURITY WARNINGS

### Anthropic API Key Exposure

**CRITICAL**: The Anthropic API key should **NEVER** be exposed in frontend code in production!

**Current Status**: 🔴 INSECURE - API key is in frontend code

**Why this is dangerous**:
- Anyone can view the source code and steal your API key
- Malicious users can make unlimited API calls using your key
- You will be charged for all usage
- Browser CORS restrictions prevent direct API calls anyway

**Recommended Solution**: Move AI processing to Firebase Cloud Functions

### How to Properly Secure the Anthropic API

#### Option 1: Firebase Cloud Functions (Recommended)

1. Create a Firebase Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');

exports.generateSummary = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const anthropic = new Anthropic({
    apiKey: functions.config().anthropic.key // Stored securely in Firebase
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: data.prompt }]
    });

    return { summary: response.content[0].text };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

2. Set the API key securely:

```bash
firebase functions:config:set anthropic.key="your-api-key-here"
```

3. Call from frontend:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateSummary = httpsCallable(functions, 'generateSummary');

const result = await generateSummary({ prompt: 'Your prompt here' });
```

#### Option 2: Backend API Server

Create a separate Node.js/Express backend that handles AI requests and stores the API key securely.

## 🛡️ Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own projects
    match /users/{userId}/projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ✅ Security Checklist

Before deploying to production:

- [ ] Move Anthropic API key to Cloud Functions
- [ ] Implement proper Firestore security rules
- [ ] Enable Firebase Authentication
- [ ] Add rate limiting to API calls
- [ ] Set up usage quotas
- [ ] Monitor API usage in Firebase Console
- [ ] Never commit `.env.local` to git
- [ ] Use environment variables for all sensitive data
- [ ] Implement user authentication before API calls
- [ ] Add error handling for API failures
- [ ] Set up Firebase App Check for additional security

## 📚 Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Cloud Functions Security](https://firebase.google.com/docs/functions/secure)
- [Anthropic API Security](https://docs.anthropic.com/claude/reference/security)

## 🚨 If Your API Key is Compromised

1. **Immediately** regenerate your API key in the Anthropic Console
2. Update the key in Firebase Cloud Functions config
3. Monitor billing for unauthorized usage
4. Review access logs
5. Implement additional security measures

---

**Remember**: Security is not optional. Always follow best practices for handling API keys and sensitive data!

