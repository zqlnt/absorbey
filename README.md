# 🎓 Absorbey

**Transform YouTube videos into comprehensive learning experiences with AI-powered summaries and interactive quizzes.**

Absorbey automatically extracts video transcripts, generates detailed educational summaries with timestamps, and creates interactive quizzes to test your understanding—all powered by Claude AI.

![Absorbey Banner](https://via.placeholder.com/1200x400/8B5CF6/FFFFFF?text=Absorbey+-+Learn+from+YouTube+Videos)

---

## ✨ Features

### 📝 **Comprehensive Summaries**
- **15-20 detailed sections** covering every aspect of the video
- **Extracts statistics, dates, names, quotes** mentioned in the video
- **Timestamp references** throughout for easy video navigation
- **Educational context** with explanations and background information

### 🎯 **Interactive Quizzes**
- **8-10 comprehensive questions** testing different cognitive levels
- **Detailed explanations** (4-6 sentences) for every answer
- **Progress tracking** with quiz history and scores
- **Immediate feedback** with correct/incorrect indicators

### 🔥 **Modern UI**
- **Animated lava lamp logo** with smooth transitions
- **Collapsible sidebar** for project management
- **Summary card carousel** with progress tracking
- **Flashcard notes** for personalized study aids
- **Study progress analytics** showing completion and scores

### 🔐 **Authentication**
- **Google Sign-In** for full access
- **Guest mode** for quick testing
- **Firebase integration** ready for cloud storage

### 📊 **Learning Analytics**
- Track quiz attempts and scores over time
- Monitor summary cards viewed
- Average score calculation
- Last studied timestamps

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.18+ (recommended: 24.x)
- **npm** or **yarn**
- **Anthropic API Key** ([get one here](https://console.anthropic.com/))
- **Firebase Project** ([create one here](https://console.firebase.google.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/absorbey.git
cd absorbey
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Anthropic API (Claude AI)
VITE_ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# Firebase Configuration
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"

# YouTube API (Optional - for enhanced metadata)
YOUTUBE_API_KEY="your_youtube_api_key"
```

4. **Run the development servers**

**Terminal 1 - API Server:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:5173` to use the app!

---

## 📦 Tech Stack

### Frontend
- **React 19** with Hooks
- **Vite 7** for blazing-fast builds
- **Tailwind CSS 3** for styling
- **Lucide React** for icons
- **Firebase** for authentication

### Backend
- **Node.js** + **Express**
- **Anthropic Claude 3.5 Sonnet** for AI generation
- **@distube/ytdl-core** for YouTube transcript extraction
- **CORS** enabled for local development

### Storage
- **localStorage** (current)
- **Firestore** (planned for production)

---

## 🏗️ Architecture

```
absorbey/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx           # Project list & navigation
│   │   ├── WelcomeScreen.jsx     # Landing page with input
│   │   ├── ProjectView.jsx       # Summary & quiz display
│   │   ├── AuthModal.jsx         # Authentication UI
│   │   └── LavaOrb.jsx           # Animated logo
│   ├── context/
│   │   ├── ProjectContext.jsx    # Project state management
│   │   └── AuthContext.jsx       # Authentication state
│   ├── services/
│   │   └── anthropicService.js   # API calls to backend
│   ├── config/
│   │   └── firebase.js           # Firebase initialization
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── server.js                     # Express API server
├── package.json
└── .env.local                    # Environment variables (not in git)
```

---

## 🎨 How It Works

### 1. **Video Input**
User pastes a YouTube URL into the input field.

### 2. **Transcript Extraction**
The backend server extracts the video transcript using `ytdl-core`, including:
- Timestamp data
- Full caption text
- Multiple language support

### 3. **AI Processing**
The transcript is sent to Claude 3.5 Sonnet with a comprehensive prompt to generate:
- **15-20 detailed summary sections**
- **8-10 educational quiz questions**

### 4. **Interactive Learning**
Users can:
- Read through summary cards
- Take quizzes with instant feedback
- Add personal notes to flashcards
- Track their learning progress

---

## 🔧 Configuration

### Anthropic API
Get your API key from [Anthropic Console](https://console.anthropic.com/):
1. Create an account
2. Go to API Keys
3. Generate a new key
4. Add to `.env.local` as `VITE_ANTHROPIC_API_KEY`

### Firebase Setup
1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** > **Google** and **Anonymous**
3. Copy your config from Project Settings > General
4. Add all values to `.env.local`

### YouTube API (Optional)
For enhanced video metadata:
1. Enable YouTube Data API v3 in Google Cloud Console
2. Create an API key
3. Add as `YOUTUBE_API_KEY` in `.env.local`

---

## 🚢 Deployment

### Vercel (Recommended)

#### Frontend Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Add Environment Variables**
In Vercel Dashboard:
- Go to Project Settings > Environment Variables
- Add all `VITE_*` variables from `.env.local`

#### Backend Deployment

The API server (`server.js`) needs to be deployed separately:

**Option 1: Vercel Serverless Functions**
- Move API endpoints to `api/` directory
- Convert to serverless function format

**Option 2: Railway/Render**
- Deploy `server.js` as a Node.js app
- Update `API_SERVER_URL` in frontend to your backend URL

### Environment Variables for Production

```env
# Same as .env.local but for production
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
# ... etc
```

---

## 📝 Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run server     # Start Express API server
npm run lint       # Run ESLint
```

---

## 🔒 Security

### ⚠️ Important Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **API keys in frontend** - Currently for development only
3. **Production setup** - Move API keys to backend/serverless functions
4. **Firebase rules** - Set up proper Firestore security rules before going live

See `SECURITY.md` for detailed security recommendations.

---

## 🗺️ Roadmap

- [ ] **Firestore Integration** - Replace localStorage with cloud storage
- [ ] **Video Library** - Browse and search saved projects
- [ ] **Spaced Repetition** - Smart flashcard review system
- [ ] **Export Options** - PDF, Markdown, Anki cards
- [ ] **Collaborative Learning** - Share projects with friends
- [ ] **Mobile App** - React Native version
- [ ] **More Video Sources** - Vimeo, Coursera, etc.
- [ ] **Advanced Analytics** - Learning insights and recommendations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude AI
- **Firebase** for authentication and storage
- **@distube/ytdl-core** for YouTube transcript extraction
- **Tailwind CSS** for beautiful styling
- **Lucide** for icons

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ by the Absorbey Team**

Transform your learning experience, one video at a time.
