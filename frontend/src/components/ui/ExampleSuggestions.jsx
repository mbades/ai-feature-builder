export default function ExampleSuggestions({ examples, onSelectExample, currentExample }) {
  const quickExamples = [
    "Sistema di autenticazione",
    "Dashboard analytics", 
    "E-commerce platform",
    "Chat real-time"
  ]

  return (
    <div className="mb-6">
      {/* Current rotating example */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
          <span className="text-blue-600 text-sm">💡</span>
          <span className="text-blue-800 text-sm font-medium">
            Prova: "{currentExample}"
          </span>
        </div>
      </div>

      {/* Quick example buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {quickExamples.map((example, index) => (
          <button
            key={example}
            onClick={() => onSelectExample(example)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-gray-700 hover:text-blue-700"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}