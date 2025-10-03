import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ProjectView from './components/ProjectView';
import AuthModal from './components/AuthModal';
import LavaOrb from './components/LavaOrb';
import { Menu, LogOut, User } from 'lucide-react';

function AppContent() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - overlay on mobile, fixed on desktop */}
      <Sidebar
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => {
          setSelectedProjectId(id);
          setSidebarOpen(false); // Close on mobile after selection
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content area - full width, sidebar overlays it */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation bar */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          {/* Left: Hamburger menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Center: Logo/title on desktop - only show on larger screens to avoid overlap */}
          <div className="hidden xl:flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <LavaOrb size="small" />
            <span className="font-bold text-gray-900 whitespace-nowrap">Absorbey</span>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                <span className="hidden md:inline text-sm text-gray-600 truncate max-w-[100px] lg:max-w-[150px]">
                  {user.isAnonymous ? 'Guest' : user.email || 'User'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline whitespace-nowrap">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors min-h-[44px] whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {selectedProjectId ? (
            <ProjectView 
              projectId={selectedProjectId} 
              onBackToHome={() => setSelectedProjectId(null)}
            />
          ) : (
            <WelcomeScreen onProjectCreated={handleProjectCreated} />
          )}
        </div>
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
