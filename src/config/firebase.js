import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('⚠️ Missing Firebase configuration. Please check your .env.local file.')
  console.error('⚠️ App will run without authentication features.')
}

// Initialize Firebase with error handling
let app = null
let auth = null
let db = null
let analytics = null

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
    console.log('✅ Firebase initialized successfully')
  } else {
    console.warn('⚠️ Firebase not initialized - missing configuration')
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message)
  console.warn('⚠️ App will continue without Firebase features')
}

export { auth, db, analytics }
export default app

