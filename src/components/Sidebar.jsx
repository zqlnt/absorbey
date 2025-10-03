import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useProjects } from '../context/ProjectContext'
import LavaOrb from './LavaOrb'

export default function Sidebar({ selectedProjectId, onSelectProject }) {
  const { projects, deleteProject } = useProjects()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-gray-50 to-white border-r-2 border-gray-100 shadow-lg flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200 relative flex items-center justify-center`}>
          {sidebarCollapsed ? (
            // Collapsed: Just the orb centered
            <div className="flex flex-col items-center gap-2">
              <LavaOrb size="small" />
            </div>
          ) : (
            // Expanded: Orb + text with collapse button
            <div className="flex items-center gap-3 w-full pr-8">
              <LavaOrb size="default" />
              <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Absorbey</h1>
            </div>
          )}
          
          {/* Collapse button - positioned differently based on state */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute ${sidebarCollapsed ? 'top-2 right-2' : 'top-6 right-2'} p-1 rounded-lg hover:bg-gray-100 transition-colors`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

      {/* Projects list */}
      <div className="flex-1 overflow-y-auto p-4">
        {projects.length === 0 ? (
          <div className={`text-center py-12 ${sidebarCollapsed ? 'px-2' : ''}`}>
            {!sidebarCollapsed && (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                </div>
                <p className="text-gray-500 text-sm mb-2">No projects yet</p>
                <p className="text-gray-400 text-xs">Paste a YouTube link to start</p>
              </>
            )}
          </div>
        ) : (
              <div className="space-y-2">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className={`relative group ${
                      selectedProjectId === project.id
                        ? 'bg-purple-50 border-l-4 border-purple-600'
                        : 'hover:bg-gray-100'
                    } rounded-lg transition-all duration-200`}
                  >
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="w-full text-left p-3 rounded-lg"
                      title={sidebarCollapsed ? project.title : undefined}
                    >
                      {sidebarCollapsed ? (
                        // Collapsed: Show a small thumbnail or colored dot
                        <div className="flex justify-center">
                          {project.thumbnail ? (
                            <img 
                              src={project.thumbnail} 
                              alt={project.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-purple-200 rounded flex items-center justify-center">
                              <span className="text-purple-700 font-bold text-sm">
                                {project.title?.[0]?.toUpperCase() || 'P'}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Expanded: Show full details
                        <>
                          {project.thumbnail && (
                            <img 
                              src={project.thumbnail} 
                              alt={project.title}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                          )}
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {project.title || 'Untitled Project'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </button>
                    
                    {/* Delete button */}
                    {!sidebarCollapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this project?')) {
                            // If deleting the currently selected project, go home
                            if (project.id === selectedProjectId) {
                              onSelectProject(null)
                            }
                            deleteProject(project.id)
                          }
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}
