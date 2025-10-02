import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ProjectView from './components/ProjectView';
import AuthModal from './components/AuthModal';
import { LogOut, User } from 'lucide-react';

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut } = useAuth();

  const handleProjectCreated = (projectId) => {
    // Show auth modal if user is not signed in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedProjectId(projectId);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar with project list - hidden on mobile when project selected */}
      <div className={`${selectedProjectId ? 'hidden md:block' : 'block'}`}>
        <Sidebar 
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* User menu */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-end items-center gap-2 sm:gap-3 bg-white">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline truncate max-w-[100px]">
                  {user.isAnonymous ? 'Guest' : user.email || 'User'}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg cursor-pointer text-xs sm:text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white border-none rounded-lg cursor-pointer text-xs sm:text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        {selectedProjectId ? (
          <ProjectView 
            projectId={selectedProjectId} 
            onBackToHome={() => setSelectedProjectId(null)}
          />
        ) : (
          <WelcomeScreen onProjectCreated={handleProjectCreated} />
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          console.log('User signed in successfully');
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
