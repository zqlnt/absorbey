import React from 'react'

const LavaOrb = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse shadow-lg shadow-purple-500/30 flex items-center justify-center`}>
      <div className={`${size === 'small' ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-blue-300 via-purple-400 to-pink-400 animate-spin`} style={{ animationDuration: '4s' }}></div>
    </div>
  )
}

export default LavaOrb
