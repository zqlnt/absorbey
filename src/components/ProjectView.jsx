import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { ChevronDown, ChevronUp, Loader2, Home, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, BookOpen, Brain } from 'lucide-react'

export default function ProjectView({ projectId, onBackToHome }) {
  const { projects, deleteProject } = useProjects()
  const [expandedSummary, setExpandedSummary] = useState(true)
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

  // Break summary into key points
  const getSummaryPoints = (summary) => {
    if (!summary) return []
    
    // Split by common delimiters and filter out empty lines
    const points = summary
      .split(/\n+|\.(?=\s+[A-Z])|(?<=\d\.)\s+/)
      .filter(p => p.trim().length > 20)
      .map(p => p.trim().replace(/^\d+\.\s*/, ''))
      .slice(0, 8) // Max 8 points
    
    return points.length > 0 ? points : [summary]
  }

  // Create summary cards (group points into cards)
  const getSummaryCards = (points) => {
    const cards = []
    for (let i = 0; i < points.length; i += 2) {
      cards.push({
        id: i / 2,
        points: points.slice(i, i + 2)
      })
    }
    return cards
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
    <div className="flex-1 overflow-y-auto pb-32 px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                deleteProject(projectId)
                onBackToHome()
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Project
          </button>
        </div>

        {/* Video header */}
        <div className="mb-8">
          {project.thumbnail && (
            <img 
              src={project.thumbnail} 
              alt={project.title}
              className="w-full h-64 object-cover rounded-2xl shadow-lg mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {project.title || 'Untitled Project'}
          </h1>
          <a 
            href={project.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 text-sm"
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
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Key Learnings</h2>
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
                        {/* Summary Card Carousel */}
                        <div className="relative">
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 min-h-[200px] flex flex-col justify-center">
                            <div className="space-y-4">
                              {cards[currentSummaryCard].points.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {currentSummaryCard * 2 + idx + 1}
                                  </div>
                                  <p className="text-gray-800 text-lg leading-relaxed flex-1">
                                    {point}
                                  </p>
                                </div>
                              ))}
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
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <Brain className="w-6 h-6" />
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
