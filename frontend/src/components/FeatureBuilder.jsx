import { useApp } from '../context/AppContext'
import FeatureForm from './FeatureForm'
import FeaturePreview from './FeaturePreview'
import FeatureExport from './FeatureExport'
import ErrorDisplay from './ErrorDisplay'

export default function FeatureBuilder() {
  const { state } = useApp()

  // Show error if generation failed
  if (state.generationError) {
    return (
      <div className="space-y-6">
        <ErrorDisplay 
          error={state.generationError}
          title="Errore nella generazione"
        />
        <FeatureForm />
      </div>
    )
  }

  // Render based on active tab
  switch (state.activeTab) {
    case 'preview':
      return state.generatedFeature ? <FeaturePreview /> : <FeatureForm />
    
    case 'export':
      return state.generatedFeature ? <FeatureExport /> : <FeatureForm />
    
    case 'input':
    default:
      return <FeatureForm />
  }
}