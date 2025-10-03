import { useState } from 'react'
import { X, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import LavaOrb from './LavaOrb'

export default function Sidebar({ selectedProjectId, onSelectProject, isOpen, onClose }) {
  const { projects, deleteProject } = useProjects()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`
        fixed lg:sticky top-0 left-0 h-screen
        ${collapsed ? 'lg:w-20' : 'w-[280px] sm:w-72 lg:w-80'}
        bg-gradient-to-b from-white to-gray-50 border-r border-gray-200
        flex flex-col
        z-50
        transform transition-all duration-300 ease-in-out
        shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 relative">
        {collapsed ? (
          // Collapsed: Just orb, button below
          <div className="flex flex-col items-center w-full gap-1">
            <LavaOrb size="small" />
            {/* Collapse button below logo when collapsed */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        ) : (
          // Expanded: Logo and title on left, button on right
          <>
            <div className="flex items-center gap-3">
              <LavaOrb size="small" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Absorbey</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Learn from videos</p>
              </div>
            </div>
            
            {/* Collapse button (desktop) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
        
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* New Project Button */}
      {!collapsed && (
        <div className="p-3 lg:p-4">
          <button
            onClick={() => {
              onSelectProject(null); // Go to home
              onClose(); // Close sidebar on mobile
            }}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-purple-200 transition-all flex items-center justify-center gap-2 font-medium text-gray-700 min-h-[44px] shadow-sm"
          >
            <Plus className="w-5 h-5 text-purple-600" />
            <span className="text-sm">New Project</span>
          </button>
        </div>
      )}

      {/* Projects Header */}
      {projects.length > 0 && !collapsed && (
        <div className="px-4 lg:px-6 pb-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your Projects ({projects.length})
          </h2>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3 lg:px-4 pb-4">
        {projects.length === 0 ? (
          !collapsed && (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No projects yet</p>
              <p className="text-xs text-gray-500">Paste a YouTube link to start learning</p>
            </div>
          )
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative"
              >
                <button
                  onClick={() => {
                    onSelectProject(project.id);
                    onClose(); // Close on mobile
                  }}
                  className={`
                    w-full text-left p-3 rounded-xl transition-all
                    min-h-[44px] flex items-center gap-3
                    ${
                      selectedProjectId === project.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {/* Thumbnail */}
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt=""
                      className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} object-cover rounded-lg flex-shrink-0 ${
                        selectedProjectId === project.id ? 'ring-2 ring-white/30' : ''
                      }`}
                    />
                  ) : (
                    <div className={`${collapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                      selectedProjectId === project.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {project.title?.[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                  
                  {/* Title and Date - hide when collapsed */}
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm truncate mb-1 ${
                        selectedProjectId === project.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        {project.title || 'Untitled Project'}
                      </h3>
                      <p className={`text-xs ${
                        selectedProjectId === project.id ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </button>

                {/* Delete button - only show on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${project.title || 'Untitled Project'}"?`)) {
                      if (project.id === selectedProjectId) {
                        onSelectProject(null)
                      }
                      deleteProject(project.id)
                    }
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 ${
                    selectedProjectId === project.id
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  } opacity-0 group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center`}
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {projects.length > 0 && (
        <div className="border-t border-gray-200 p-4 text-center bg-white">
          <p className="text-xs text-gray-500">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
      )}
    </div>
  )
}
