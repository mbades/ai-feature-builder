import { useState } from 'react'

export default function TabView({ children, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const tabs = Array.isArray(children) ? children : [children]

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === index
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-opacity duration-300">
        {tabs[activeTab]}
      </div>
    </div>
  )
}

export function Tab({ label, children }) {
  return <div>{children}</div>
}