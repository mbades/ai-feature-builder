import { getQualityColors, getQualityEmoji } from '../../utils/styleUtils'
import { FEATURE_EMOJIS } from '../../config/promptCategories'

export default function ProgressFeedback({ analysis }) {
  const { completeness, feedback, quality, suggestions, missingElements, detectedFeatures } = analysis

  const qualityColors = getQualityColors(quality)
  const qualityEmoji = getQualityEmoji(quality)

  return (
    <div className="mt-4 space-y-3">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${qualityColors.bg}`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600 min-w-0">
          {completeness}%
        </span>
      </div>

      {/* Feedback Message */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className={qualityColors.text} aria-hidden="true">
            {qualityEmoji}
          </span>
          
          <span className={`text-sm font-medium ${qualityColors.text}`}>
            {feedback}
          </span>
        </div>
      </div>

      {/* Detected Features */}
      {detectedFeatures && detectedFeatures.length > 0 && (
        <div className={`${qualityColors.bgLight} rounded-lg p-3 border ${qualityColors.borderLight}`}>
          <div className={`text-xs font-medium ${qualityColors.text} mb-2`}>
            🎯 Feature rilevate:
          </div>
          <div className="flex flex-wrap gap-1">
            {detectedFeatures.map((feature, index) => (
              <span 
                key={`feature-${index}`} 
                className={`inline-flex items-center gap-1 px-2 py-1 ${qualityColors.bgLight} ${qualityColors.text} rounded-full text-xs border ${qualityColors.borderLight}`}
              >
                <span aria-hidden="true">
                  {FEATURE_EMOJIS[feature] || '⚡'}
                </span>
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Elements */}
      {missingElements && missingElements.length > 0 && completeness < 80 && (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="text-xs font-medium text-yellow-800 mb-2">
            📋 Elementi mancanti:
          </div>
          <div className="flex flex-wrap gap-1">
            {missingElements.map((element, index) => (
              <span 
                key={`missing-${index}`} 
                className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"
              >
                + {element}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-2">
            💡 Suggerimenti per migliorare:
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div 
                key={`suggestion-${index}`} 
                className="text-xs text-blue-700 flex items-center gap-1"
              >
                <span className="w-1 h-1 bg-blue-400 rounded-full" aria-hidden="true"></span>
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}