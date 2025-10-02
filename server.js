import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { YoutubeTranscriptApi } from 'youtube-transcript-api'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Function to get YouTube transcript using youtube-transcript-api
async function getYouTubeTranscript(videoId) {
  try {
    console.log(`📝 Fetching transcript for video: ${videoId}`)
    
    // Fetch transcript
    const transcript = await YoutubeTranscriptApi.fetchTranscript(videoId)
    
    if (!transcript || transcript.length === 0) {
      console.log('⚠️ No transcript available for this video')
      return null
    }
    
    console.log(`✅ Found transcript with ${transcript.length} segments`)
    
    // Format transcript with timestamps
    const formattedTranscript = transcript
      .map(segment => {
        const timestamp = formatTimestamp(segment.offset / 1000) // offset is in milliseconds
        const text = segment.text.replace(/\n/g, ' ').trim()
        return `[${timestamp}] ${text}`
      })
      .join('\n')
    
    console.log(`📊 Transcript extracted: ${formattedTranscript.length} characters`)
    console.log(`🎯 Sample: ${formattedTranscript.substring(0, 200)}...`)
    
    return formattedTranscript
    
  } catch (error) {
    console.error('⚠️ Transcript extraction failed:', error.message)
    
    // Try without language specification as fallback
    try {
      console.log('🔄 Trying alternative extraction method...')
      const transcript = await YoutubeTranscriptApi.fetchTranscript(videoId, { lang: 'en' })
      
      if (transcript && transcript.length > 0) {
        const formatted = transcript
          .map(s => `[${formatTimestamp(s.offset / 1000)}] ${s.text.replace(/\n/g, ' ').trim()}`)
          .join('\n')
        console.log(`✅ Alternative method succeeded: ${formatted.length} characters`)
        return formatted
      }
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message)
    }
    
    return null
  }
}

// Helper function to format seconds into MM:SS
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Anthropic API proxy endpoint
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { videoTitle, videoDescription, videoId } = req.body
    
    console.log('🚀 Generating summary for:', videoTitle)
    
    // Try to get transcript using official YouTube API
    let transcript = null
    if (videoId) {
      transcript = await getYouTubeTranscript(videoId)
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: transcript 
              ? `You are a meticulous educational researcher creating an EXHAUSTIVELY DETAILED summary. Extract and document EVERY significant piece of information from this video.

Title: "${videoTitle}"
Description: "${videoDescription}"

FULL VIDEO TRANSCRIPT (with timestamps):
${transcript.length > 25000 ? transcript.substring(0, 25000) + '\n\n[Transcript continues - extract all remaining key information]' : transcript}

🎯 MISSION: Create the most comprehensive, detailed summary possible. Someone should be able to learn EVERYTHING from your summary without watching the video.

📊 CRITICAL - EXTRACT EVERYTHING:

**Statistics & Numbers:**
- Every statistic, percentage, measurement mentioned
- Growth rates, comparisons, financial figures
- Sample sizes, time periods, quantities
- Ratings, scores, rankings

**Names & People:**
- Every person mentioned (with their role/title)
- Organizations, companies, institutions
- Historical figures, experts cited
- Authors, researchers, sources

**Dates & Timeline:**
- Specific dates, years, time periods
- Historical events and when they occurred
- Deadlines, milestones, timelines
- Before/after comparisons

**Quotes & Direct Statements:**
- Exact quotes from the video creator
- Quotes from experts or other sources
- Key phrases and memorable statements
- Controversial or important claims

**Examples & Case Studies:**
- Every specific example mentioned
- Real-world applications and scenarios
- Success/failure stories
- Anecdotes and illustrations

**Technical Details:**
- Definitions of all technical terms
- Step-by-step processes or methods
- Technical specifications
- Scientific explanations

**References & Sources:**
- Studies mentioned
- Books, articles, research cited
- Websites or resources recommended
- Related topics or concepts

📚 STRUCTURE (15-20 sections):

**1. Video Overview & Context [timestamp]**
Full paragraph explaining: What is this video about? Who is the creator? What's their background/authority? Why did they make this? What problem are they addressing? What's the intended audience? (7-10 sentences)

**2. Opening Thesis & Main Arguments [timestamp]**
What is the central claim? What are they trying to prove or teach? What's their main position? Include any opening statistics or hooks they use. (6-8 sentences)

**3-5. Core Concepts (3 sections) [timestamps throughout]**
For EACH major concept, provide:
- Detailed explanation (what it is)
- Why it matters (significance)
- Supporting evidence (stats, studies, examples)
- How it works (mechanisms, processes)
- Real-world applications
- Counter-arguments or limitations mentioned
(8-12 sentences each)

**6-12. Supporting Topics (7 sections) [timestamps throughout]**
Deep dive into each additional topic, theme, or argument:
- Full context and background
- Specific details, names, dates
- Examples and case studies mentioned
- Statistics and data points
- Quotes from the video
- Connections to other concepts
- Practical implications
(6-10 sentences each)

**13. Methodologies & Processes [timestamps]**
Any step-by-step processes, methods, frameworks, or systems explained. Include specific instructions or steps. (6-8 sentences)

**14. Evidence & Data Presentation [timestamps]**
Comprehensive list of ALL statistics, studies, research, expert opinions cited. Format: "According to [source/study], [specific finding with numbers/dates]." (8-12 points)

**15. Practical Applications & Examples [timestamps]**
Every real-world example, success story, case study, or practical use case mentioned with specific details. (7-10 sentences)

**16. Challenges, Criticisms & Limitations [timestamps]**
Any problems, criticisms, counter-arguments, limitations, or challenges discussed. (5-7 sentences)

**17. Recommendations & Action Steps [timestamps]**
Specific advice, recommendations, or action steps the creator suggests. Be detailed and actionable. (6-8 sentences)

**18. Conclusions & Final Thoughts [timestamps]**
How does the creator wrap up? What are the key takeaways? What final message do they leave? (6-8 sentences)

**19. Additional Context**
Background information, historical context, or related topics mentioned that add depth. (5-7 sentences)

**20. References & Resources**
List all sources, studies, books, websites, tools, or resources mentioned or recommended.

✍️ WRITING REQUIREMENTS:
- Include [timestamp] references for EVERY section
- Quote specific phrases in "quotation marks"
- Cite every statistic with context
- Name every person/organization mentioned
- Include ALL dates and timeframes
- Explain every technical term
- Provide examples for abstract concepts
- Write in clear, educational prose
- Each section must be detailed and comprehensive

❌ FORBIDDEN:
- Generic statements without specifics
- Skipping any information from the transcript
- Single-sentence sections
- Vague summaries
- Assuming the reader knows anything

This is a COMPREHENSIVE EDUCATIONAL DOCUMENT. Be thorough, detailed, and exhaustive.`
              : `Create a comprehensive educational summary of this YouTube video:

Title: "${videoTitle}"
Description: "${videoDescription}"

⚠️ Note: Transcript was not available for this video. Based on the title and description, provide:

1. **Topic Overview** (full paragraph) - What this video likely covers and why it's important
2. **Key Concepts** (full paragraph) - Main ideas typically associated with this subject
3. **Historical Context** (full paragraph) - Background and development of these ideas
4. **Common Arguments** (full paragraph) - Typical points made in content like this
5. **Practical Applications** (full paragraph) - How this knowledge is applied
6. **Educational Value** (full paragraph) - Why this topic matters for learners

Each section should be a FULL PARAGRAPH with 5-8 sentences.`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Anthropic API Error:', errorText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Summary generated successfully')
    res.json({ summary: data.content[0].text })
  } catch (error) {
    console.error('💥 Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { videoTitle, summary } = req.body
    
    console.log('🎯 Generating quiz for:', videoTitle)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `Based on this detailed YouTube video summary, create an EXTENSIVE, EDUCATIONAL quiz:

Title: "${videoTitle}"
Summary: "${summary.substring(0, 5000)}"

Create 8-10 comprehensive multiple-choice questions that deeply test understanding.

🎯 QUESTION REQUIREMENTS:
1. **Variety of Cognitive Levels:**
   - 2-3 Knowledge/Recall questions (remembering key facts)
   - 2-3 Comprehension/Application questions (understanding and using concepts)
   - 2-3 Analysis/Synthesis questions (connecting ideas, evaluating arguments)
   - 1-2 Critical Thinking questions (implications, what-ifs, deeper meaning)

2. **Question Quality:**
   - Reference specific content from the video
   - Test actual understanding, not just memorization
   - Be clear, specific, and unambiguous
   - Avoid trick questions or trivial details

3. **Answer Options:**
   - All options should be plausible to someone who didn't watch carefully
   - Wrong answers should represent common misconceptions
   - Make options similar in length and complexity
   - Avoid "all of the above" or "none of the above"

4. **Explanations (CRITICAL - Make these DETAILED):**
   - 4-6 sentences minimum per explanation
   - Explain WHY the correct answer is right
   - Explain WHY wrong answers are incorrect
   - Add educational value beyond just identifying the answer
   - Reference specific video content
   - Connect to broader concepts when relevant

Return ONLY valid JSON (no markdown, no code blocks):
[
  {
    "question": "Comprehensive question based on video content...",
    "options": ["Detailed option A", "Detailed option B", "Detailed option C", "Detailed option D"],
    "correctAnswer": 0,
    "explanation": "EXTENSIVE explanation (4-6 sentences) that teaches the concept, explains why this answer is correct, why others are wrong, and adds educational context from the video..."
  }
]

Make this quiz a valuable LEARNING EXPERIENCE, not just a test.`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Anthropic API Error:', errorText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Try to parse JSON
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const quizCards = JSON.parse(jsonMatch[0])
        console.log('✅ Quiz generated successfully')
        res.json({ quizCards })
        return
      }
    } catch (parseError) {
      console.error('⚠️ JSON parsing error:', parseError)
    }
    
    // Fallback
    res.json({
      quizCards: [
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
        }
      ]
    })
  } catch (error) {
    console.error('💥 Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Video metadata endpoint
app.get('/api/video-metadata/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params
    console.log('📺 Fetching metadata for:', videoId)
    
    // Try to fetch from YouTube oEmbed (no API key needed)
    const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    
    if (!oembed.ok) {
      throw new Error('oEmbed fetch failed')
    }
    
    const data = await oembed.json()
    
    // Try to scrape video page for description
    try {
      const videoPage = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
      const html = await videoPage.text()
      
      // Extract description from meta tags
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/)
      const description = descMatch ? descMatch[1] : ''
      
      console.log('✅ Metadata fetched with description')
      res.json({
        title: data.title,
        thumbnail: data.thumbnail_url,
        description: description || `A video titled "${data.title}". This YouTube video explores various aspects of the topic mentioned in the title.`
      })
    } catch (scrapeError) {
      // If scraping fails, return basic info
      console.log('⚠️ Description scraping failed, using basic info')
      res.json({
        title: data.title,
        thumbnail: data.thumbnail_url,
        description: `A YouTube video titled "${data.title}". This video discusses topics related to the title and provides insights into the subject matter.`
      })
    }
  } catch (error) {
    console.error('💥 Metadata fetch error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Absorbey API Server running on http://localhost:${PORT}`)
  console.log(`🔑 Anthropic API Key: ${process.env.VITE_ANTHROPIC_API_KEY ? '✅' : '❌'}`)
  console.log(`📺 YouTube API Key: ${process.env.YOUTUBE_API_KEY ? '✅' : '❌'}`)
  console.log(`📋 Endpoints:`)
  console.log(`   POST /api/generate-summary - Generate AI summary (with transcript)`)
  console.log(`   POST /api/generate-quiz - Generate quiz questions`)
  console.log(`   GET  /api/video-metadata/:videoId - Fetch video metadata`)
})

