import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('🔍 AUTH DEBUG - loading:', loading, 'user:', user, 'auth exists:', !!auth)
  }, [loading, user])

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect running, auth:', !!auth)
    
    // If auth is not initialized, skip
    if (!auth) {
      console.warn('⚠️ Firebase Auth not initialized - app will run without authentication')
      setLoading(false)
      return
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('✅ onAuthStateChanged callback - user:', user?.email || 'anonymous/null')
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error('❌ Auth state change error:', error)
        setLoading(false) // Still set loading to false even on error
      }
    )

    // Fallback timeout in case auth never resolves (reduced to 1 second for faster debugging)
    const timeout = setTimeout(() => {
      console.log('⏰ AUTH TIMEOUT TRIGGERED after 1 second')
      if (loading) {
        console.warn('⚠️ Auth initialization timeout - proceeding without auth')
        setLoading(false)
      }
    }, 1000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Authentication not available - Firebase not initialized')
    }
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInAnonymouslyFn = async () => {
    if (!auth) {
      throw new Error('Authentication not available - Firebase not initialized')
    }
    try {
      const result = await signInAnonymously(auth)
      return result.user
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (!auth) {
      throw new Error('Authentication not available - Firebase not initialized')
    }
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInAnonymously: signInAnonymouslyFn,
    signOut
  }

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
  )
}

