/**
 * Utility functions for consistent styling across components
 * Eliminates code duplication and ensures consistent design
 */

export const getQualityColors = (quality) => {
  const colorMap = {
    excellent: {
      text: 'text-green-600',
      bg: 'bg-green-500',
      border: 'border-green-500',
      bgLight: 'bg-green-50',
      borderLight: 'border-green-200'
    },
    good: {
      text: 'text-blue-600',
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-200'
    },
    fair: {
      text: 'text-yellow-600',
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      bgLight: 'bg-yellow-50',
      borderLight: 'border-yellow-200'
    },
    poor: {
      text: 'text-gray-500',
      bg: 'bg-gray-300',
      border: 'border-gray-300',
      bgLight: 'bg-gray-50',
      borderLight: 'border-gray-200'
    }
  }

  return colorMap[quality] || colorMap.poor
}

export const getQualityEmoji = (quality) => {
  const emojiMap = {
    excellent: '✨',
    good: '👍',
    fair: '💡',
    poor: '✏️'
  }

  return emojiMap[quality] || emojiMap.poor
}

export const getButtonStyles = (variant = 'primary', size = 'md', disabled = false) => {
  const baseStyles = 'font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles}`
}

export const getCardStyles = (variant = 'default') => {
  const variants = {
    default: 'bg-white rounded-2xl border border-gray-200 shadow-sm',
    elevated: 'bg-white rounded-2xl border border-gray-200 shadow-md',
    success: 'bg-green-50 rounded-2xl border border-green-200',
    warning: 'bg-yellow-50 rounded-2xl border border-yellow-200',
    error: 'bg-red-50 rounded-2xl border border-red-200',
    info: 'bg-blue-50 rounded-2xl border border-blue-200'
  }

  return variants[variant] || variants.default
}