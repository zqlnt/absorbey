import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'

const WelcomeScreen = ({ onProjectCreated, onCreateProjectAttempt }) => {
  const [inputValue, setInputValue] = useState('')
  const [isProcessingVideo, setIsProcessingVideo] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [error, setError] = useState('')

  const { addProject } = useProjects()
  const { user } = useAuth()
  const words = ['the universe', 'art', 'space', 'music', 'movies', 'science', 'history', 'philosophy', 'technology', 'nature']

  // Rotating text animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [words.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    
    // Validate YouTube URL
    if (!inputValue.includes('youtube.com') && !inputValue.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL')
      return
    }

    // Check if user is signed in
    if (!user) {
      onCreateProjectAttempt() // Trigger auth modal
      return
    }

    setIsProcessingVideo(true)
    setError('')

    try {
      const newProject = await addProject(inputValue)
      setInputValue('')
      onProjectCreated(newProject.id) // Switch to the new project
    } catch (err) {
      setError(err.message || 'Failed to create project. Please try again.')
    } finally {
      setIsProcessingVideo(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        {/* Glowing Orb Section */}
        <div className="relative mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse shadow-2xl shadow-purple-500/30 relative">
            {/* Middle spinning ring */}
            <div className="absolute inset-4 md:inset-6 rounded-full bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 animate-spin" style={{ animationDuration: '8s' }}></div>
            {/* Inner glow */}
            <div className="absolute inset-8 md:inset-12 rounded-full bg-gradient-to-br from-white/40 to-transparent backdrop-blur-sm"></div>
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 animate-pulse" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>

        {/* Header Text Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 px-4">
            Absorb the secrets of{' '}
            <span 
              className={`inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-300 ${
                isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {words[currentWordIndex]}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-light px-4">
            Input any video link, article or file to extrapolate the knowledge.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl mx-auto space-y-6 px-4">
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setError('')
              }}
              disabled={isProcessingVideo}
              className="w-full px-6 py-4 pr-16 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 disabled:opacity-50"
              placeholder="Paste YouTube link to start learning..."
            />
            {inputValue && (
              <button
                type="submit"
                disabled={isProcessingVideo}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 sm:p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-400 text-white transition-colors duration-200 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Submit YouTube link"
              >
                {isProcessingVideo ? (
                  <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 sm:w-5 sm:h-5" />
                )}
              </button>
            )}
          </form>

          {/* YouTube Input Description */}
          <div className="text-center text-gray-500 text-sm">
            <p>Enter a YouTube URL to start learning</p>
          </div>

          {/* Processing Video Indicator */}
          {isProcessingVideo && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing video and generating AI content...
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
