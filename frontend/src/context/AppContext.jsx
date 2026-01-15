import { createContext, useContext, useReducer } from 'react'

// Initial state
const initialState = {
  // Feature generation state
  isGenerating: false,
  generatedFeature: null,
  generationError: null,
  
  // Templates state
  templates: [],
  templatesLoading: false,
  templatesError: null,
  
  // UI state
  activeTab: 'input', // 'input', 'preview', 'export'
  showTemplates: false,
  
  // Form state
  formData: {
    description: '',
    language: 'it',
    template: '',
    complexity: 'medium',
    includeTests: false
  },
  
  // Request tracking
  lastRequestId: null,
  requestHistory: []
}

// Action types
const ActionTypes = {
  // Feature generation
  GENERATE_START: 'GENERATE_START',
  GENERATE_SUCCESS: 'GENERATE_SUCCESS',
  GENERATE_ERROR: 'GENERATE_ERROR',
  CLEAR_GENERATION: 'CLEAR_GENERATION',
  
  // Templates
  TEMPLATES_LOADING: 'TEMPLATES_LOADING',
  TEMPLATES_SUCCESS: 'TEMPLATES_SUCCESS',
  TEMPLATES_ERROR: 'TEMPLATES_ERROR',
  
  // UI
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_TEMPLATES: 'TOGGLE_TEMPLATES',
  
  // Form
  UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
  RESET_FORM: 'RESET_FORM',
  APPLY_TEMPLATE: 'APPLY_TEMPLATE',
  
  // Request tracking
  ADD_REQUEST_HISTORY: 'ADD_REQUEST_HISTORY'
}

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.GENERATE_START:
      return {
        ...state,
        isGenerating: true,
        generationError: null,
        lastRequestId: action.payload.requestId
      }
    
    case ActionTypes.GENERATE_SUCCESS:
      return {
        ...state,
        isGenerating: false,
        generatedFeature: action.payload.feature,
        generationError: null,
        activeTab: 'preview'
      }
    
    case ActionTypes.GENERATE_ERROR:
      return {
        ...state,
        isGenerating: false,
        generationError: action.payload.error,
        generatedFeature: null
      }
    
    case ActionTypes.CLEAR_GENERATION:
      return {
        ...state,
        generatedFeature: null,
        generationError: null,
        activeTab: 'input'
      }
    
    case ActionTypes.TEMPLATES_LOADING:
      return {
        ...state,
        templatesLoading: true,
        templatesError: null
      }
    
    case ActionTypes.TEMPLATES_SUCCESS:
      return {
        ...state,
        templatesLoading: false,
        templates: action.payload.templates,
        templatesError: null
      }
    
    case ActionTypes.TEMPLATES_ERROR:
      return {
        ...state,
        templatesLoading: false,
        templatesError: action.payload.error
      }
    
    case ActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload.tab
      }
    
    case ActionTypes.TOGGLE_TEMPLATES:
      return {
        ...state,
        showTemplates: !state.showTemplates
      }
    
    case ActionTypes.UPDATE_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload.data
        }
      }
    
    case ActionTypes.RESET_FORM:
      return {
        ...state,
        formData: initialState.formData,
        generatedFeature: null,
        generationError: null,
        activeTab: 'input'
      }
    
    case ActionTypes.APPLY_TEMPLATE:
      return {
        ...state,
        formData: {
          ...state.formData,
          template: action.payload.template.id,
          description: action.payload.template.example || state.formData.description,
          complexity: action.payload.template.complexity || state.formData.complexity
        },
        showTemplates: false
      }
    
    case ActionTypes.ADD_REQUEST_HISTORY:
      return {
        ...state,
        requestHistory: [
          action.payload.request,
          ...state.requestHistory.slice(0, 9) // Keep last 10 requests
        ]
      }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  // Action creators
  const actions = {
    // Feature generation
    generateStart: (requestId) => {
      dispatch({ 
        type: ActionTypes.GENERATE_START, 
        payload: { requestId } 
      })
    },
    
    generateSuccess: (feature) => {
      dispatch({ 
        type: ActionTypes.GENERATE_SUCCESS, 
        payload: { feature } 
      })
    },
    
    generateError: (error) => {
      dispatch({ 
        type: ActionTypes.GENERATE_ERROR, 
        payload: { error } 
      })
    },
    
    clearGeneration: () => {
      dispatch({ type: ActionTypes.CLEAR_GENERATION })
    },
    
    // Templates
    templatesLoading: () => {
      dispatch({ type: ActionTypes.TEMPLATES_LOADING })
    },
    
    templatesSuccess: (templates) => {
      dispatch({ 
        type: ActionTypes.TEMPLATES_SUCCESS, 
        payload: { templates } 
      })
    },
    
    templatesError: (error) => {
      dispatch({ 
        type: ActionTypes.TEMPLATES_ERROR, 
        payload: { error } 
      })
    },
    
    // UI
    setActiveTab: (tab) => {
      dispatch({ 
        type: ActionTypes.SET_ACTIVE_TAB, 
        payload: { tab } 
      })
    },
    
    toggleTemplates: () => {
      dispatch({ type: ActionTypes.TOGGLE_TEMPLATES })
    },
    
    // Form
    updateFormData: (data) => {
      dispatch({ 
        type: ActionTypes.UPDATE_FORM_DATA, 
        payload: { data } 
      })
    },
    
    resetForm: () => {
      dispatch({ type: ActionTypes.RESET_FORM })
    },
    
    applyTemplate: (template) => {
      dispatch({ 
        type: ActionTypes.APPLY_TEMPLATE, 
        payload: { template } 
      })
    },
    
    // Request tracking
    addRequestHistory: (request) => {
      dispatch({ 
        type: ActionTypes.ADD_REQUEST_HISTORY, 
        payload: { request } 
      })
    }
  }
  
  const value = {
    state,
    actions
  }
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Selector hooks for specific state slices
export function useFeatureGeneration() {
  const { state } = useApp()
  return {
    isGenerating: state.isGenerating,
    generatedFeature: state.generatedFeature,
    generationError: state.generationError,
    lastRequestId: state.lastRequestId
  }
}

export function useTemplates() {
  const { state } = useApp()
  return {
    templates: state.templates,
    templatesLoading: state.templatesLoading,
    templatesError: state.templatesError,
    showTemplates: state.showTemplates
  }
}

export function useFormData() {
  const { state } = useApp()
  return {
    formData: state.formData,
    activeTab: state.activeTab
  }
}