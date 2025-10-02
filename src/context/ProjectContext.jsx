import { createContext, useContext, useState, useEffect } from 'react'
import { getVideoMetadata, generateVideoSummary, generateQuizCards } from '../services/anthropicService'

const ProjectContext = createContext()

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('absorbey-projects')
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (error) {
        console.error('Error loading projects:', error)
      }
    }
  }, [])

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('absorbey-projects', JSON.stringify(projects))
  }, [projects])

  const addProject = async (youtubeUrl) => {
    setLoading(true)
    try {
      // Extract video ID from YouTube URL
      const videoId = extractVideoId(youtubeUrl)
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      // Get video metadata
      const videoData = await getVideoMetadata(videoId)
      
      // Generate AI content with transcript
      console.log('📝 Generating content with transcript for video:', videoId)
      const summary = await generateVideoSummary(videoData.title, videoData.description, videoId)
      const quizCards = await generateQuizCards(videoData.title, summary)
      
      const newProject = {
        id: Date.now().toString(),
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        videoId,
        youtubeUrl,
        url: youtubeUrl,
        summary,
        quizCards: quizCards.map((card, index) => ({
          ...card,
          id: index + 1
        })),
        quizAttempts: [], // Track all quiz attempts
        flashcardNotes: {}, // User notes for each summary card
        studyProgress: {
          summaryCardsViewed: [],
          quizzesCompleted: 0,
          averageScore: 0,
          lastStudied: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setProjects(prev => [newProject, ...prev])
      setSelectedProject(newProject)
      return newProject
    } catch (error) {
      console.error('Error adding project:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
    }
  }

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ))
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => ({ ...prev, ...updates }))
    }
  }

  const saveQuizAttempt = (projectId, attemptData) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const newAttempt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: attemptData.score,
      totalQuestions: attemptData.totalQuestions,
      percentage: Math.round((attemptData.score / attemptData.totalQuestions) * 100),
      answers: attemptData.answers,
      timeSpent: attemptData.timeSpent || null
    }

    const quizAttempts = [...(project.quizAttempts || []), newAttempt]
    const avgScore = quizAttempts.reduce((acc, a) => acc + a.percentage, 0) / quizAttempts.length

    updateProject(projectId, {
      quizAttempts,
      studyProgress: {
        ...project.studyProgress,
        quizzesCompleted: quizAttempts.length,
        averageScore: Math.round(avgScore),
        lastStudied: new Date().toISOString()
      }
    })
  }

  const saveFlashcardNote = (projectId, cardIndex, note) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const flashcardNotes = {
      ...project.flashcardNotes,
      [cardIndex]: note
    }

    updateProject(projectId, { flashcardNotes })
  }

  const markSummaryCardViewed = (projectId, cardIndex) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const viewed = project.studyProgress?.summaryCardsViewed || []
    if (!viewed.includes(cardIndex)) {
      updateProject(projectId, {
        studyProgress: {
          ...project.studyProgress,
          summaryCardsViewed: [...viewed, cardIndex],
          lastStudied: new Date().toISOString()
        }
      })
    }
  }

  const value = {
    projects,
    selectedProject,
    setSelectedProject,
    addProject,
    deleteProject,
    updateProject,
    saveQuizAttempt,
    saveFlashcardNote,
    markSummaryCardViewed,
    loading
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

// Helper function
const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}
