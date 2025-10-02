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
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar with project list */}
      <Sidebar 
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
      
      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* User menu */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <User className="w-4 h-4 text-gray-600" />
                <span style={{ fontSize: '14px', color: '#4b5563' }}>
                  {user.isAnonymous ? 'Guest' : user.email || 'User'}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
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
