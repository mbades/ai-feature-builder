import { useState } from 'react'

/**
 * Componente per esportare la specifica in diversi formati
 */
export default function FeatureExport({ data }) {
  const [activeTab, setActiveTab] = useState('readme')

  if (!data?.data?.feature) return null

  const feature = data.data.feature

  // Genera README.md
  const generateReadme = () => {
    const readme = `# 🤖 ${feature.metadata.name}

> **Specifica tecnica generata da AI Feature Builder**
> 
> ${feature.metadata.description}

---

## 📊 Informazioni Specifica

| Proprietà | Valore |
|-----------|--------|
| **🎯 Complessità** | ${feature.metadata.complexity} |
| **⏱️ Stima sviluppo** | ${feature.metadata.estimatedHours}h |
| **🏷️ Categorie** | ${feature.metadata.tags?.join(', ') || 'N/A'} |
| **📦 Versione specifica** | ${feature.metadata.version} |
| **🤖 Generata il** | ${new Date().toLocaleDateString('it-IT')} |

---

## 🎯 Requisiti Funzionali

${feature.requirements.functional?.map((req, index) => 
  `### ${index + 1}. ${req.title}

**📝 Descrizione:** ${req.description}

**🔥 Priorità:** \`${req.priority}\` | **📂 Categoria:** \`${req.category}\`

${req.dependencies?.length > 0 ? `**🔗 Dipendenze:** ${req.dependencies.join(', ')}` : ''}

---
`).join('\n') || '> ⚠️ Nessun requisito funzionale definito'}

## 🏗️ Architettura Tecnica

### 🔌 API Endpoints

${feature.architecture.apiEndpoints?.map((endpoint, index) => 
  `#### ${index + 1}. \`${endpoint.method}\` ${endpoint.path}

**📋 Descrizione:** ${endpoint.description}

**🎯 Requisiti correlati:** ${endpoint.relatedRequirements?.join(', ') || 'N/A'}

---
`).join('\n') || '> ⚠️ Nessun endpoint API definito'}

## 💻 Implementazione

### 🧩 Componenti

${feature.implementation.components?.map((comp, index) => 
  `#### ${index + 1}. ${comp.name} \`(${comp.type})\`

**📝 Descrizione:** ${comp.description}

**🎯 Requisiti correlati:** ${comp.relatedRequirements?.join(', ') || 'N/A'}

---
`).join('\n') || '> ⚠️ Nessun componente definito'}

## 🧪 Testing & Qualità

### ✅ Test Cases

${feature.testing.testCases?.map((test, index) => 
  `#### ${index + 1}. ${test.title}

**📝 Descrizione:** ${test.description}

**🎯 Requisiti correlati:** ${test.relatedRequirements?.join(', ') || 'N/A'}

---
`).join('\n') || '> ⚠️ Nessun test case definito'}

## 🚀 Deployment & Infrastruttura

### 📋 Requisiti di Sistema

${feature.deployment.requirements?.map((req, index) => 
  `${index + 1}. **${req.category}:** ${req.description} *(Priorità: ${req.priority})*`
).join('\n') || '> ⚠️ Nessun requisito di deployment specificato'}

---

## 📋 Come utilizzare questa specifica

Questa specifica è stata generata automaticamente da **AI Feature Builder** e contiene tutti gli elementi tecnici necessari per implementare la feature richiesta.

### 🚀 Prossimi passi suggeriti:

1. **Revisione tecnica**: Valuta i requisiti e l'architettura proposta
2. **Pianificazione sprint**: Suddividi i requisiti in task implementabili  
3. **Setup ambiente**: Configura le dipendenze tecniche indicate
4. **Implementazione**: Segui l'ordine dei requisiti per priorità
5. **Testing**: Implementa i test case suggeriti

### 🔧 Integrazione nel progetto:

- Importa questa specifica nel tuo project management tool
- Usa i requisiti funzionali come user stories
- Implementa gli endpoint API seguendo le specifiche
- Crea i modelli dati come indicato nella sezione architettura

---

<div align="center">

**🤖 Generato da [AI Feature Builder](https://ai-feature-builder.app)**

*Trasforma idee in specifiche tecniche strutturate*

</div>
`
    return readme
  }

  // Genera Task List per project management
  const generateTaskList = () => {
    const tasks = []
    
    // Tasks dai requisiti
    feature.requirements.functional?.forEach(req => {
      tasks.push({
        id: req.id,
        title: req.title,
        description: req.description,
        priority: req.priority,
        category: 'Requirements',
        estimatedHours: Math.ceil(feature.metadata.estimatedHours / feature.requirements.functional.length)
      })
    })

    // Tasks dai componenti
    feature.implementation.components?.forEach(comp => {
      tasks.push({
        id: `IMPL-${comp.name}`,
        title: `Implementa ${comp.name}`,
        description: comp.description,
        priority: 'medium',
        category: 'Implementation',
        estimatedHours: 4
      })
    })

    // Tasks dai test
    feature.testing.testCases?.forEach(test => {
      tasks.push({
        id: test.id,
        title: `Test: ${test.title}`,
        description: test.description,
        priority: 'low',
        category: 'Testing',
        estimatedHours: 2
      })
    })

    return tasks
  }

  // Genera codice React base
  const generateReactCode = () => {
    const componentName = feature.implementation.components?.[0]?.name || 'FeatureComponent'
    
    return `import React, { useState, useEffect } from 'react'

/**
 * ${feature.metadata.description}
 * 
 * Requisiti implementati:
${feature.requirements.functional?.map(req => ` * - ${req.id}: ${req.title}`).join('\n') || ' * Nessun requisito'}
 */
export default function ${componentName}() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  // TODO: Implementare logica per ${feature.metadata.name}
  useEffect(() => {
    // Inizializzazione componente
  }, [])

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      // TODO: Chiamata API
${feature.architecture.apiEndpoints?.map(endpoint => 
      `      // ${endpoint.method} ${endpoint.path} - ${endpoint.description}`
    ).join('\n') || '      // Nessun endpoint definito'}
      
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>

  return (
    <div className="feature-component">
      <h1>${feature.metadata.name}</h1>
      <p>${feature.metadata.description}</p>
      
      {/* TODO: Implementare UI */}
      <div>
        <p>Componente da implementare</p>
        <ul>
${feature.requirements.functional?.map(req => 
          `          <li>${req.title}</li>`
        ).join('\n') || '          <li>Nessun requisito</li>'}
        </ul>
      </div>
    </div>
  )
}

// Stili CSS (opzionale)
const styles = {
  featureComponent: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  }
}
`
  }

  // Genera API Schema (OpenAPI)
  const generateApiSchema = () => {
    const schema = {
      openapi: '3.0.0',
      info: {
        title: feature.metadata.name,
        description: feature.metadata.description,
        version: feature.metadata.version
      },
      paths: {}
    }

    feature.architecture.apiEndpoints?.forEach(endpoint => {
      const path = endpoint.path
      const method = endpoint.method.toLowerCase()
      
      if (!schema.paths[path]) {
        schema.paths[path] = {}
      }
      
      schema.paths[path][method] = {
        summary: endpoint.description,
        tags: [feature.metadata.name],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad Request'
          },
          '500': {
            description: 'Internal Server Error'
          }
        }
      }
    })

    return JSON.stringify(schema, null, 2)
  }

  const tabs = [
    { id: 'readme', label: '📄 README.md', content: generateReadme() },
    { id: 'tasks', label: '📋 Task List', content: JSON.stringify(generateTaskList(), null, 2) },
    { id: 'react', label: '⚛️ React Code', content: generateReactCode() },
    { id: 'api', label: '🔌 API Schema', content: generateApiSchema() }
  ]

  const downloadFile = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      alert('✅ Copiato negli appunti!')
    } catch (err) {
      alert('❌ Errore nella copia')
    }
  }

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content || ''

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          🚀 Esporta Specifica
        </h3>
        <p className="text-sm text-gray-600">
          Trasforma il JSON in formati utili per lo sviluppo
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => copyToClipboard(activeContent)}
            className="flex-1 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
          >
            📋 Copia
          </button>
          <button
            onClick={() => {
              const extensions = {
                readme: '.md',
                tasks: '.json',
                react: '.jsx',
                api: '.json'
              }
              const filename = `${feature.metadata.name.toLowerCase().replace(/\s+/g, '-')}${extensions[activeTab] || '.txt'}`
              downloadFile(activeContent, filename)
            }}
            className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            💾 Download
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
          <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
            {activeContent}
          </pre>
        </div>
      </div>
    </div>
  )
}