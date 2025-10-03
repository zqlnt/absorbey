import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { ChevronDown, ChevronUp, Loader2, Home, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, BookOpen, Brain, BarChart3, Users, Clock, Quote, Link as LinkIcon } from 'lucide-react'

export default function ProjectView({ projectId, onBackToHome }) {
  const { projects, deleteProject } = useProjects()
  const [expandedSummary, setExpandedSummary] = useState(true)
  const [expandedStats, setExpandedStats] = useState(false)
  const [expandedPeople, setExpandedPeople] = useState(false)
  const [expandedTimeline, setExpandedTimeline] = useState(false)
  const [expandedQuotes, setExpandedQuotes] = useState(false)
  const [expandedResources, setExpandedResources] = useState(false)
  const [flippedCards, setFlippedCards] = useState({})
  const [currentSummaryCard, setCurrentSummaryCard] = useState(0)
  const [quizMode, setQuizMode] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [quizResults, setQuizResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  const project = projects.find(p => p.id === projectId)

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    )
  }

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Break summary into comprehensive sections
  const getSummaryPoints = (summary) => {
    try {
      if (!summary || typeof summary !== 'string') return []
      
      // Split by numbered sections (1., 2., 3., etc.) or **headers**
      const sections = summary
        .split(/(?=\n\n\d+\.\s+\*{0,2}[A-Z])|(?=\n\n\*{2}[^*]+\*{2})/)
        .filter(section => section.trim().length > 50)
        .map((section, idx) => {
          const trimmed = section.trim()
          // Extract header and content
          const headerMatch = trimmed.match(/^(\d+\.\s+)?\*{0,2}([^*\n]+)\*{0,2}/)
          const header = headerMatch ? headerMatch[2].trim() : null
          const content = trimmed.replace(/^(\d+\.\s+)?\*{0,2}[^*\n]+\*{0,2}\s*/, '').trim()
          
          return {
            header: header || `Section ${idx + 1}`,
            content: content || trimmed,
            hasTimestamps: /\[\d+:\d+\]/.test(content || trimmed)
          }
        })
      
      return sections.length > 0 ? sections : [{
        header: 'Summary',
        content: summary,
        hasTimestamps: /\[\d+:\d+\]/.test(summary)
      }]
    } catch (error) {
      console.error('Error parsing summary:', error)
      return [{
        header: 'Summary',
        content: summary || 'No summary available',
        hasTimestamps: false
      }]
    }
  }

  // Create summary cards (one section per card)
  const getSummaryCards = (sections) => {
    return sections.map((section, index) => ({
      id: index,
      section: section
    }))
  }

  // Extract statistics and data from summary
  const extractStats = (summary) => {
    try {
      if (!summary || typeof summary !== 'string') return []
      const stats = []
      // Match numbers with context (e.g., "25%", "$1.5M", "3 years", "over 1000")
      const statPattern = /([^.!?]*(?:\d+(?:,\d{3})*(?:\.\d+)?(?:%|million|billion|thousand|k|M|B)?)[^.!?]*[.!?])/gi
      const matches = summary.match(statPattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim()
          if (cleaned.length > 15 && cleaned.length < 200) {
            stats.push(cleaned)
          }
        })
      }
      return stats.slice(0, 8) // Limit to 8 stats
    } catch (error) {
      console.error('Error extracting stats:', error)
      return []
    }
  }

  // Extract names and people from summary
  const extractPeople = (summary) => {
    try {
      if (!summary || typeof summary !== 'string') return []
      const people = []
      // Match capitalized names (simple heuristic)
      const namePattern = /(?:Dr\.|Professor|CEO|President|Director)?\s*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g
      const matches = [...summary.matchAll(namePattern)]
      const seen = new Set()
      matches.forEach(match => {
        const name = match[1].trim()
        if (!seen.has(name) && name.length > 3) {
          seen.add(name)
          people.push(name)
        }
      })
      return people.slice(0, 10)
    } catch (error) {
      console.error('Error extracting people:', error)
      return []
    }
  }

  // Extract dates and timeline from summary
  const extractTimeline = (summary) => {
    try {
      if (!summary || typeof summary !== 'string') return []
      const timeline = []
      // Match dates and years with context
      const datePattern = /([^.!?]*(?:\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|January|February|March|April|May|June|July|August|September|October|November|December)[^.!?]*[.!?])/gi
      const matches = summary.match(datePattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim()
          if (cleaned.length > 20 && cleaned.length < 200) {
            timeline.push(cleaned)
          }
        })
      }
      return timeline.slice(0, 8)
    } catch (error) {
      console.error('Error extracting timeline:', error)
      return []
    }
  }

  // Extract quotes from summary
  const extractQuotes = (summary) => {
    try {
      if (!summary || typeof summary !== 'string') return []
      const quotes = []
      // Match text in quotes
      const quotePattern = /"([^"]{20,200})"/g
      const matches = [...summary.matchAll(quotePattern)]
      matches.forEach(match => {
        quotes.push(match[1])
      })
      return quotes.slice(0, 6)
    } catch (error) {
      console.error('Error extracting quotes:', error)
      return []
    }
  }

  const handleQuizAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return // Already answered
    
    setSelectedAnswer(answerIndex)
    const isCorrect = project.quizCards[currentQuestion].correctAnswer === answerIndex
    
    setQuizResults(prev => [...prev, {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      correct: isCorrect
    }])
  }

  const nextQuestion = () => {
    if (currentQuestion < project.quizCards.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResults(true)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setQuizResults([])
    setShowResults(false)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 sm:pb-32 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-0 justify-between items-center">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                deleteProject(projectId)
                onBackToHome()
              }
            }}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete Project</span>
            <span className="sm:hidden">Delete</span>
          </button>
        </div>

        {/* Video header */}
        <div className="mb-6 sm:mb-8">
          {project.thumbnail && (
            <img 
              src={project.thumbnail} 
              alt={project.title}
              className="w-full h-40 sm:h-48 md:h-64 object-cover rounded-xl sm:rounded-2xl shadow-lg mb-3 sm:mb-4"
            />
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {project.title || 'Untitled Project'}
          </h1>
          <a 
            href={project.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1"
          >
            Watch on YouTube →
          </a>
        </div>

        {/* Enhanced Summary Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg mb-6">
          <button
            onClick={() => setExpandedSummary(!expandedSummary)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Key Learnings</h2>
            </div>
            {expandedSummary ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSummary && (
            <div className="p-6 pt-0 border-t border-gray-100">
              {project.summary ? (
                <>
                  {(() => {
                    const points = getSummaryPoints(project.summary)
                    const cards = getSummaryCards(points)
                    
                    if (cards.length === 0) return null
                    
                    return (
                      <div className="space-y-4">
                        {/* Comprehensive Summary Card Carousel */}
                        <div className="relative">
                          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-8 min-h-[300px] border-2 border-purple-100 shadow-lg">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                                {currentSummaryCard + 1}
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {cards[currentSummaryCard].section.header}
                              </h3>
                              {cards[currentSummaryCard].section.hasTimestamps && (
                                <span className="ml-auto px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                                  📍 With Timestamps
                                </span>
                              )}
                            </div>
                            
                            {/* Card Content */}
                            <div className="prose prose-lg max-w-none">
                              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                                {cards[currentSummaryCard].section.content}
                              </p>
                            </div>
                            
                            {/* Progress Indicator */}
                            <div className="mt-6 pt-4 border-t border-purple-200">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-semibold">Section {currentSummaryCard + 1} of {cards.length}</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                                    style={{ width: `${((currentSummaryCard + 1) / cards.length) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Navigation Controls */}
                          {cards.length > 1 && (
                            <div className="flex items-center justify-between mt-4">
                              <button
                                onClick={() => setCurrentSummaryCard(prev => Math.max(0, prev - 1))}
                                disabled={currentSummaryCard === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                              </button>
                              
                              <div className="flex gap-2">
                                {cards.map((_, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCurrentSummaryCard(idx)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                      idx === currentSummaryCard
                                        ? 'bg-purple-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              <button
                                onClick={() => setCurrentSummaryCard(prev => Math.min(cards.length - 1, prev + 1))}
                                disabled={currentSummaryCard === cards.length - 1}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Start Quiz Button */}
                        <div className="flex justify-center pt-4">
                          <button
                            onClick={() => setQuizMode(true)}
                            className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                            Test Your Knowledge
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Generating summary...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics & Data Section */}
        {project.summary && extractStats(project.summary).length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg mb-6">
            <button
              onClick={() => setExpandedStats(!expandedStats)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Statistics & Data</h2>
              </div>
              {expandedStats ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            
            {expandedStats && (
              <div className="p-4 sm:p-6 pt-0 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {extractStats(project.summary).map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                      <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{stat}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline & Events Section */}
        {project.summary && extractTimeline(project.summary).length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg mb-6">
            <button
              onClick={() => setExpandedTimeline(!expandedTimeline)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Timeline & Events</h2>
              </div>
              {expandedTimeline ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            
            {expandedTimeline && (
              <div className="p-4 sm:p-6 pt-0 border-t border-gray-100">
                <div className="space-y-3 sm:space-y-4">
                  {extractTimeline(project.summary).map((event, index) => (
                    <div key={index} className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-100">
                        <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quotes & Insights Section */}
        {project.summary && extractQuotes(project.summary).length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg mb-6">
            <button
              onClick={() => setExpandedQuotes(!expandedQuotes)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Key Quotes</h2>
              </div>
              {expandedQuotes ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            
            {expandedQuotes && (
              <div className="p-4 sm:p-6 pt-0 border-t border-gray-100">
                <div className="space-y-3 sm:space-y-4">
                  {extractQuotes(project.summary).map((quote, index) => (
                    <div key={index} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 sm:p-6 border-l-4 border-amber-500 shadow-sm">
                      <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-2 sm:mb-3" />
                      <p className="text-base sm:text-lg text-gray-800 italic leading-relaxed">{quote}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* People & References Section */}
        {project.summary && extractPeople(project.summary).length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg mb-6">
            <button
              onClick={() => setExpandedPeople(!expandedPeople)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">People & References</h2>
              </div>
              {expandedPeople ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            
            {expandedPeople && (
              <div className="p-4 sm:p-6 pt-0 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {extractPeople(project.summary).map((person, index) => (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full px-3 py-2 sm:px-4 sm:py-2 border border-indigo-200">
                      <p className="text-sm sm:text-base font-medium text-indigo-900">{person}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive Quiz Modal */}
        {quizMode && project.quizCards && project.quizCards.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {!showResults ? (
                <div className="p-8">
                  {/* Quiz Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8 text-purple-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Knowledge Test</h2>
                    </div>
                    <button
                      onClick={() => setQuizMode(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Question {currentQuestion + 1} of {project.quizCards.length}</span>
                      <span>{Math.round(((currentQuestion) / project.quizCards.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion) / project.quizCards.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Question */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {project.quizCards[currentQuestion].question}
                    </h3>
                    
                    {/* Answer Options */}
                    <div className="space-y-3">
                      {project.quizCards[currentQuestion].options?.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selectedAnswer === null
                              ? 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                              : selectedAnswer === idx
                              ? project.quizCards[currentQuestion].correctAnswer === idx
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : project.quizCards[currentQuestion].correctAnswer === idx
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          } disabled:cursor-default`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                              selectedAnswer === null
                                ? 'border-gray-400 text-gray-600'
                                : selectedAnswer === idx
                                ? project.quizCards[currentQuestion].correctAnswer === idx
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-red-500 bg-red-500 text-white'
                                : project.quizCards[currentQuestion].correctAnswer === idx
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-400 text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg">{option}</span>
                            {selectedAnswer !== null && project.quizCards[currentQuestion].correctAnswer === idx && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                            {selectedAnswer === idx && project.quizCards[currentQuestion].correctAnswer !== idx && (
                              <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Explanation (shown after answering) */}
                  {selectedAnswer !== null && project.quizCards[currentQuestion].explanation && (
                    <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Explanation:</p>
                      <p className="text-blue-800">{project.quizCards[currentQuestion].explanation}</p>
                    </div>
                  )}
                  
                  {/* Next Button */}
                  {selectedAnswer !== null && (
                    <div className="flex justify-end">
                      <button
                        onClick={nextQuestion}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200"
                      >
                        {currentQuestion < project.quizCards.length - 1 ? 'Next Question' : 'See Results'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Quiz Results */
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-white">
                        {Math.round((quizResults.filter(r => r.correct).length / quizResults.length) * 100)}%
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                    <p className="text-lg text-gray-600">
                      You got {quizResults.filter(r => r.correct).length} out of {quizResults.length} correct
                    </p>
                  </div>
                  
                  {/* Results Breakdown */}
                  <div className="space-y-3 mb-8">
                    {project.quizCards.map((card, idx) => {
                      const result = quizResults.find(r => r.questionIndex === idx)
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border-2 ${
                            result?.correct
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {result?.correct ? (
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{card.question}</p>
                              {!result?.correct && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Correct answer: {card.options?.[card.correctAnswer]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={restartQuiz}
                      className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200"
                    >
                      Retry Quiz
                    </button>
                    <button
                      onClick={() => {
                        setQuizMode(false)
                        restartQuiz()
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
