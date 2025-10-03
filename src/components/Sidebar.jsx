import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import LavaOrb from './LavaOrb'

export default function Sidebar({ selectedProjectId, onSelectProject }) {
  const { projects, deleteProject } = useProjects()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}>
        {/* Logo Section */}
        <div className={`${sidebarCollapsed ? 'p-4' : 'px-6 py-5'} border-b border-gray-100 relative`}>
          {sidebarCollapsed ? (
            // Collapsed: Centered orb
            <div className="flex flex-col items-center">
              <LavaOrb size="small" />
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="mt-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ) : (
            // Expanded: Logo + collapse button
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LavaOrb size="default" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Absorbey</h1>
                  <p className="text-xs text-gray-500">Learn from videos</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>

      {/* Projects Header */}
      {!sidebarCollapsed && (
        <div className="px-6 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Your Projects ({projects.length})
          </h2>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 ? (
          <div className={`text-center ${sidebarCollapsed ? 'py-8 px-2' : 'py-12 px-6'}`}>
            {!sidebarCollapsed && (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-gray-900 font-medium text-sm mb-1">No projects yet</p>
                <p className="text-gray-500 text-xs">Paste a YouTube link to start learning</p>
              </>
            )}
          </div>
        ) : (
          <div className={sidebarCollapsed ? 'space-y-1 px-2' : 'space-y-1 px-3'}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`group relative transition-all duration-200 ${
                  sidebarCollapsed ? 'mx-0' : 'mx-0'
                }`}
              >
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={`w-full ${
                    selectedProjectId === project.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  } rounded-xl transition-all duration-200 ${
                    sidebarCollapsed ? 'p-2' : 'p-3'
                  } flex items-center gap-3`}
                  title={sidebarCollapsed ? project.title : undefined}
                >
                  {sidebarCollapsed ? (
                    // Collapsed: Icon only
                    <div className="flex items-center justify-center w-full">
                      {project.thumbnail ? (
                        <img 
                          src={project.thumbnail} 
                          alt={project.title}
                          className={`w-12 h-12 object-cover rounded-lg ${
                            selectedProjectId === project.id ? 'ring-2 ring-white' : ''
                          }`}
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                          selectedProjectId === project.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {project.title?.[0]?.toUpperCase() || 'P'}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Expanded: Full details
                    <>
                      <div className="flex-shrink-0">
                        {project.thumbnail ? (
                          <img 
                            src={project.thumbnail} 
                            alt={project.title}
                            className={`w-16 h-16 object-cover rounded-lg ${
                              selectedProjectId === project.id ? 'ring-2 ring-white/30' : ''
                            }`}
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg ${
                            selectedProjectId === project.id 
                              ? 'bg-white/20 text-white' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {project.title?.[0]?.toUpperCase() || 'P'}
                          </div>
                        )}
                      </div>
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
                    </>
                  )}
                </button>
                
                {/* Delete button - only show on expanded and hover */}
                {!sidebarCollapsed && (
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
                    } opacity-0 group-hover:opacity-100`}
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Project count or action */}
      {!sidebarCollapsed && projects.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            <button 
              onClick={() => onSelectProject(null)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              + New Project
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
