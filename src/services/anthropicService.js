// Use local API server to proxy Anthropic API calls (bypasses CORS and secures API key)
const API_SERVER_URL = 'http://localhost:3001'

export const generateVideoSummary = async (videoTitle, videoDescription = '', videoId = null) => {
  try {
    console.log('🚀 Generating summary via API server for:', videoTitle)
    if (videoId) {
      console.log('📝 Extracting transcript for video:', videoId)
    }
    
    const response = await fetch(`${API_SERVER_URL}/api/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoTitle,
        videoDescription,
        videoId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ API Server Error:', errorData)
      throw new Error(`API Server error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Summary received from API server')
    return data.summary
  } catch (error) {
    console.error('💥 Error generating summary:', error)
    console.error('💥 Make sure the API server is running: npm run server')
    // Return a fallback summary
    return `Key Points about "${videoTitle}":

1. This video provides valuable insights into the main topic and concepts discussed.

2. The content offers educational material designed to help viewers understand complex ideas in an accessible way.

3. Important takeaways include practical knowledge and actionable information related to the subject matter.

4. The video breaks down key concepts to make them easier to grasp and apply.

5. Viewers can expect to gain a deeper understanding of the topic through this comprehensive overview.

Note: Real AI summary requires the API server to be running. Start it with: npm run server`
  }
}

export const generateQuizCards = async (videoTitle, summary) => {
  try {
    console.log('🎯 Generating quiz via API server for:', videoTitle)
    
    const response = await fetch(`${API_SERVER_URL}/api/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoTitle,
        summary
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ API Server Error:', errorData)
      throw new Error(`API Server error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Quiz received from API server')
    
    // Validate the format
    if (Array.isArray(data.quizCards) && data.quizCards.length > 0 && data.quizCards[0].options) {
      return data.quizCards
    }
    
    return generateFallbackQuiz(videoTitle, summary)
  } catch (error) {
    console.error('💥 Error generating quiz:', error)
    console.error('💥 Make sure the API server is running: npm run server')
    return generateFallbackQuiz(videoTitle, summary)
  }
}

// Helper function to generate fallback quiz
const generateFallbackQuiz = (videoTitle, summary) => {
  // Extract first sentence or key point from summary
  const firstPoint = summary.split(/[.!?]\s/)[0] || summary.substring(0, 100)
  
  return [
    {
      question: `What is the main focus of "${videoTitle}"?`,
      options: [
        "The video's main topic and key concepts",
        "Unrelated content",
        "Random information",
        "None of the above"
      ],
      correctAnswer: 0,
      explanation: "This video focuses on explaining the key concepts and main ideas related to the topic."
    },
    {
      question: "According to the video, what is one of the key takeaways?",
      options: [
        firstPoint.length > 50 ? firstPoint.substring(0, 50) + "..." : firstPoint,
        "Something completely different",
        "This was not mentioned",
        "An unrelated topic"
      ],
      correctAnswer: 0,
      explanation: "This is one of the main points discussed in the video's content."
    },
    {
      question: "How would you best describe the content of this video?",
      options: [
        "Educational and informative",
        "Completely fictional",
        "Not related to the title",
        "Entertainment only"
      ],
      correctAnswer: 0,
      explanation: "The video provides educational content to help viewers learn about the topic."
    },
    {
      question: "What type of knowledge does this video aim to provide?",
      options: [
        "Practical insights and understanding",
        "Misinformation",
        "Unverified claims",
        "Random facts"
      ],
      correctAnswer: 0,
      explanation: "The video is designed to provide valuable, practical knowledge about the subject matter."
    },
    {
      question: "Who would benefit most from watching this video?",
      options: [
        "Anyone interested in learning about this topic",
        "People who already know everything",
        "Nobody at all",
        "Only experts"
      ],
      correctAnswer: 0,
      explanation: "This video is educational and designed to help anyone interested in the topic learn more."
    }
  ]
}

export const getVideoMetadata = async (videoId) => {
  try {
    console.log('📺 Fetching video metadata via API server for:', videoId)
    
    const response = await fetch(`${API_SERVER_URL}/api/video-metadata/${videoId}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Video metadata received')
      return data
    }
    
    throw new Error('Failed to fetch video metadata')
  } catch (error) {
    console.error('Error fetching video metadata:', error)
    
    // Fallback using YouTube oEmbed
    try {
      const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      if (oembed.ok) {
        const data = await oembed.json()
        return {
          title: data.title,
          thumbnail: data.thumbnail_url,
          description: `Video about: ${data.title}. This content explores topics related to the title. For better summaries, we recommend using the YouTube Data API.`
        }
      }
    } catch (oembedError) {
      console.error('oEmbed also failed:', oembedError)
    }
    
    // Final fallback
    return {
      title: `YouTube Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      description: 'Unable to fetch video details. The summary will be based on the title only.'
    }
  }
}
