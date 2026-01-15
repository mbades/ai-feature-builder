import { useState } from 'react'
import { useLoading } from '../context/LoadingContext'

/**
 * Componente per integrare la specifica con strumenti di project management
 */
export default function ProjectIntegration({ data }) {
  const [activeIntegration, setActiveIntegration] = useState('trello-simple')
  const [apiKeys, setApiKeys] = useState({
    trello: { key: '', token: '' },
    notion: { token: '' },
    linear: { token: '' }
  })
  const { showLoading, hideLoading } = useLoading()

  if (!data?.data?.feature) return null

  const feature = data.data.feature

  // Genera struttura per Trello
  const generateTrelloData = () => {
    const board = {
      name: feature.metadata.name,
      desc: feature.metadata.description,
      lists: [
        { name: '📋 Backlog', cards: [] },
        { name: '🔄 In Progress', cards: [] },
        { name: '✅ Done', cards: [] }
      ]
    }

    // Aggiungi card dai requisiti
    feature.requirements.functional?.forEach(req => {
      board.lists[0].cards.push({
        name: `${req.id}: ${req.title}`,
        desc: `**Descrizione**: ${req.description}\n**Priorità**: ${req.priority}\n**Categoria**: ${req.category}`,
        labels: [req.priority, req.category],
        due: null,
        checklist: []
      })
    })

    // Aggiungi card dai componenti
    feature.implementation.components?.forEach(comp => {
      board.lists[0].cards.push({
        name: `Implementa ${comp.name}`,
        desc: `**Tipo**: ${comp.type}\n**Descrizione**: ${comp.description}`,
        labels: ['implementation', 'development'],
        due: null,
        checklist: [
          { name: 'Creare componente base', completed: false },
          { name: 'Implementare logica', completed: false },
          { name: 'Aggiungere stili', completed: false },
          { name: 'Test unitari', completed: false }
        ]
      })
    })

    // Aggiungi card dai test
    feature.testing.testCases?.forEach(test => {
      board.lists[0].cards.push({
        name: `${test.id}: ${test.title}`,
        desc: `**Test**: ${test.description}`,
        labels: ['testing', 'qa'],
        due: null,
        checklist: [
          { name: 'Scrivere test case', completed: false },
          { name: 'Implementare test', completed: false },
          { name: 'Verificare copertura', completed: false }
        ]
      })
    })

    return board
  }

  // Genera struttura per Notion
  const generateNotionData = () => {
    return {
      parent: { type: 'page_id', page_id: 'YOUR_PAGE_ID' },
      properties: {
        title: {
          title: [{ text: { content: feature.metadata.name } }]
        },
        Status: {
          select: { name: 'Planning' }
        },
        Priority: {
          select: { name: 'High' }
        },
        Complexity: {
          select: { name: feature.metadata.complexity }
        },
        'Estimated Hours': {
          number: feature.metadata.estimatedHours
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: 'Requisiti Funzionali' } }]
          }
        },
        ...feature.requirements.functional?.map(req => ({
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: `${req.id}: ${req.title}` } }],
            checked: false
          }
        })) || []
      ]
    }
  }

  // Genera struttura per Linear
  const generateLinearData = () => {
    const issues = []

    // Epic principale
    issues.push({
      title: feature.metadata.name,
      description: feature.metadata.description,
      priority: 1,
      estimate: feature.metadata.estimatedHours,
      labels: feature.metadata.tags || [],
      type: 'epic'
    })

    // Issues dai requisiti
    feature.requirements.functional?.forEach(req => {
      issues.push({
        title: req.title,
        description: req.description,
        priority: req.priority === 'high' ? 1 : req.priority === 'medium' ? 2 : 3,
        estimate: Math.ceil(feature.metadata.estimatedHours / feature.requirements.functional.length),
        labels: [req.category, 'requirement'],
        type: 'feature'
      })
    })

    return issues
  }

  // Genera CSV per import generico
  const generateCSV = () => {
    const tasks = []
    
    // Header compatibile con Trello CSV import
    tasks.push(['Card Name', 'Card Description', 'List Name', 'Labels', 'Due Date', 'Members'])

    // Tasks dai requisiti
    feature.requirements.functional?.forEach(req => {
      tasks.push([
        `${req.id}: ${req.title}`,
        req.description,
        '📋 Backlog',
        `${req.priority},requirement,${req.category}`,
        '', // Due date vuota
        '' // Members vuoti
      ])
    })

    // Tasks dai componenti
    feature.implementation.components?.forEach(comp => {
      tasks.push([
        `Implementa ${comp.name}`,
        comp.description,
        '📋 Backlog',
        'implementation,development',
        '',
        ''
      ])
    })

    // Tasks dai test
    feature.testing.testCases?.forEach(test => {
      tasks.push([
        `${test.id}: ${test.title}`,
        test.description,
        '📋 Backlog',
        'testing,qa',
        '',
        ''
      ])
    })

    return tasks.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  // Funzione semplice che apre Trello con dati pre-configurati (SEMPRE FUNZIONA)
  const openTrelloWithData = async () => {
    const boardData = generateTrelloData()
    
    // Genera istruzioni complete
    const instructions = generateManualInstructions(boardData)
    
    // Copia istruzioni negli appunti
    try {
      await navigator.clipboard.writeText(instructions)
      alert('📋 Istruzioni copiate negli appunti!\n\n🔗 Ora apro Trello per creare il board...')
    } catch (err) {
      console.warn('Clipboard not available:', err)
    }
    
    // Apri Trello con nome e descrizione pre-compilati
    const trelloUrl = `https://trello.com/b/new?name=${encodeURIComponent(boardData.name)}&desc=${encodeURIComponent(boardData.desc)}`
    window.open(trelloUrl, '_blank')
    
    // Mostra popup con istruzioni rapide
    setTimeout(() => {
      const quickInstructions = `✅ PASSI RAPIDI:\n\n1. Elimina le liste predefinite\n2. Crea 3 liste:\n   • 📋 Backlog\n   • 🔄 In Progress  \n   • ✅ Done\n\n3. Nella lista Backlog aggiungi ${boardData.lists[0].cards.length} card\n\n📋 Le istruzioni complete sono negli appunti!`
      alert(quickInstructions)
    }, 1000)
  }

  // Funzione per creare board Trello (richiede API key)
  const createTrelloBoard = async () => {
    if (!apiKeys.trello.key || !apiKeys.trello.token) {
      alert('⚠️ Inserisci API Key e Token di Trello')
      return
    }

    // Valida formato API key e token (più flessibile)
    if (apiKeys.trello.key.length < 20) {
      alert('❌ API Key troppo corta. Verifica di aver copiato la chiave completa.')
      return
    }

    if (apiKeys.trello.token.length < 40) {
      alert('❌ Token troppo corto. Verifica di aver copiato il token completo.')
      return
    }

    const boardData = generateTrelloData()
    
    try {
      // Mostra loading full screen
      showLoading('🗂️ Creando board Trello...')
      
      // Usa JSONP o proxy per evitare CORS
      const baseUrl = 'https://api.trello.com/1'
      const credentials = `key=${encodeURIComponent(apiKeys.trello.key)}&token=${encodeURIComponent(apiKeys.trello.token)}`
      
      // Test connessione prima di creare il board
      console.log('🔍 Testing Trello API connection...')
      
      // Prova prima con fetch normale
      let testResponse
      try {
        testResponse = await fetch(`${baseUrl}/members/me?${credentials}`, {
          method: 'GET',
          mode: 'cors'
        })
      } catch (corsError) {
        console.warn('⚠️ CORS error, trying alternative method:', corsError.message)
        
        // Fallback: apri direttamente il link per creare il board manualmente
        const manualUrl = `https://trello.com/b/new?name=${encodeURIComponent(boardData.name)}&desc=${encodeURIComponent(boardData.desc)}`
        
        // Genera istruzioni per creazione manuale
        const instructions = generateManualInstructions(boardData)
        
        hideLoading()
        
        if (confirm(`❌ Impossibile creare il board automaticamente (CORS policy).\n\n✅ Vuoi aprire Trello per crearlo manualmente?\n\nRiceverai le istruzioni dettagliate.`)) {
          // Copia le istruzioni negli appunti
          await navigator.clipboard.writeText(instructions)
          alert('📋 Istruzioni copiate negli appunti!\n\n🔗 Ora apro Trello...')
          window.open(manualUrl, '_blank')
        }
        return
      }
      
      if (!testResponse.ok) {
        let errorMessage = 'Errore sconosciuto'
        try {
          const errorText = await testResponse.text()
          console.error('❌ Trello API test failed:', errorText)
          
          // Prova a parsare come JSON
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorText
          } catch {
            errorMessage = errorText
          }
        } catch {
          errorMessage = `HTTP ${testResponse.status}: ${testResponse.statusText}`
        }
        
        throw new Error(`Credenziali non valide: ${errorMessage}`)
      }

      const userInfo = await testResponse.json()
      console.log('✅ Trello API connection successful:', userInfo.username || userInfo.fullName)
      
      // Crea board
      console.log('📋 Creating Trello board...')
      const boardResponse = await fetch(`${baseUrl}/boards?${credentials}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: boardData.name,
          desc: boardData.desc,
          defaultLists: false,
          prefs_permissionLevel: 'private'
        })
      })
      
      if (!boardResponse.ok) {
        const errorText = await boardResponse.text()
        console.error('❌ Board creation failed:', errorText)
        throw new Error(`Errore creazione board: ${errorText}`)
      }

      const board = await boardResponse.json()
      console.log('✅ Board created:', board.id)
      
      if (!board.id) {
        throw new Error('Board creato ma ID mancante')
      }

      // Crea liste
      const createdLists = []
      for (const listData of boardData.lists) {
        console.log(`📝 Creating list: ${listData.name}`)
        const listResponse = await fetch(`${baseUrl}/lists?${credentials}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: listData.name,
            idBoard: board.id
          })
        })
        
        if (!listResponse.ok) {
          const errorText = await listResponse.text()
          console.error(`❌ List creation failed for ${listData.name}:`, errorText)
          continue
        }

        const list = await listResponse.json()
        createdLists.push({ ...list, originalData: listData })
        console.log(`✅ List created: ${list.name}`)
        
        // Crea card per questa lista (solo per Backlog)
        if (listData.name.includes('Backlog') && listData.cards.length > 0) {
          // Limita a 5 card per evitare rate limiting
          const cardsToCreate = listData.cards.slice(0, 5)
          
          for (const cardData of cardsToCreate) {
            console.log(`🃏 Creating card: ${cardData.name}`)
            try {
              const cardResponse = await fetch(`${baseUrl}/cards?${credentials}`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  name: cardData.name.substring(0, 100), // Limita lunghezza
                  desc: cardData.desc.substring(0, 500), // Limita lunghezza
                  idList: list.id
                })
              })

              if (cardResponse.ok) {
                const card = await cardResponse.json()
                console.log(`✅ Card created: ${card.name}`)
              } else {
                const errorText = await cardResponse.text()
                console.error(`❌ Card creation failed for ${cardData.name}:`, errorText)
              }
              
              // Pausa per evitare rate limiting
              await new Promise(resolve => setTimeout(resolve, 100))
              
            } catch (cardError) {
              console.error(`❌ Card creation error:`, cardError)
            }
          }
          
          if (listData.cards.length > 5) {
            console.log(`ℹ️ Created ${cardsToCreate.length} of ${listData.cards.length} cards (rate limit protection)`)
          }
        }
      }

      hideLoading()
      alert(`✅ Board Trello creato con successo!\n📋 ${board.name}\n🔗 Apro il board...`)
      window.open(board.url, '_blank')
      
    } catch (error) {
      console.error('❌ Full error:', error)
      hideLoading()
      
      // Messaggio di errore più dettagliato
      let errorMsg = error.message
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        errorMsg = 'Errore CORS: il browser blocca le chiamate dirette a Trello.\n\nSoluzione: usa l\'esportazione CSV o crea il board manualmente.'
      }
      
      alert(`❌ Errore: ${errorMsg}\n\n💡 Alternative:\n- Usa "CSV Export" per importare in Trello\n- Crea board manualmente con le istruzioni\n- Verifica API Key e Token`)
    }
  }

  // Genera istruzioni per creazione manuale
  const generateManualInstructions = (boardData) => {
    let instructions = `🗂️ ISTRUZIONI CREAZIONE BOARD TRELLO\n\n`
    instructions += `📋 Nome Board: ${boardData.name}\n`
    instructions += `📝 Descrizione: ${boardData.desc}\n\n`
    instructions += `📚 LISTE DA CREARE:\n`
    
    boardData.lists.forEach((list, index) => {
      instructions += `${index + 1}. ${list.name}\n`
    })
    
    instructions += `\n🃏 CARD PER LISTA "📋 Backlog":\n`
    boardData.lists[0].cards.forEach((card, index) => {
      instructions += `${index + 1}. ${card.name}\n`
      instructions += `   Descrizione: ${card.desc.substring(0, 100)}...\n\n`
    })
    
    instructions += `\n💡 PASSI:\n`
    instructions += `1. Crea nuovo board con nome e descrizione\n`
    instructions += `2. Elimina liste predefinite\n`
    instructions += `3. Crea le 3 liste sopra\n`
    instructions += `4. Aggiungi le card nella lista Backlog\n`
    instructions += `5. Personalizza etichette e date se necessario`
    
    return instructions
  }

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

  const integrations = [
    {
      id: 'trello-simple',
      name: '🗂️ Trello (Semplice)',
      description: 'Apri Trello con board pre-configurato - SEMPRE FUNZIONA',
      action: 'Apri Trello',
      handler: () => openTrelloWithData()
    },
    {
      id: 'trello-api',
      name: '🔧 Trello (API)',
      description: 'Creazione automatica via API (può essere bloccata)',
      action: 'Crea Board',
      handler: createTrelloBoard
    },
    {
      id: 'csv',
      name: '📊 CSV Export',
      description: 'Formato Trello CSV + compatibile con Asana, Monday.com',
      action: 'Download CSV',
      handler: () => downloadFile(generateCSV(), `${feature.metadata.name}-trello.csv`, 'text/csv')
    },
    {
      id: 'notion',
      name: '📝 Notion',
      description: 'Formato JSON per Notion API',
      action: 'Copia JSON',
      handler: () => navigator.clipboard.writeText(JSON.stringify(generateNotionData(), null, 2))
    },
    {
      id: 'linear',
      name: '📈 Linear',
      description: 'Issues strutturate per Linear',
      action: 'Copia JSON',
      handler: () => navigator.clipboard.writeText(JSON.stringify(generateLinearData(), null, 2))
    }
  ]

  const activeIntegrationData = integrations.find(int => int.id === activeIntegration)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          🔗 Integrazione Project Management
        </h3>
        <p className="text-sm text-gray-600">
          Esporta la specifica nei tuoi strumenti di gestione progetti preferiti
        </p>
      </div>

      {/* Integration Selector */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {integrations.map(integration => (
            <button
              key={integration.id}
              onClick={() => setActiveIntegration(integration.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                activeIntegration === integration.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-medium text-sm mb-1">{integration.name}</div>
              <div className="text-xs text-gray-500">{integration.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Simple Trello Info */}
      {activeIntegration === 'trello-simple' && (
        <div className="p-4 sm:p-6 bg-green-50 border-b border-gray-200">
          <h4 className="font-medium text-green-900 mb-3">✅ Metodo Semplice (Consigliato)</h4>
          <div className="text-sm text-green-800 space-y-2">
            <p>🎯 <strong>Questo metodo funziona sempre!</strong></p>
            <p>📋 Copia automaticamente le istruzioni negli appunti</p>
            <p>🔗 Apre Trello con nome e descrizione già compilati</p>
            <p>⚡ Nessuna configurazione API necessaria</p>
            <p>🛡️ Nessun problema di CORS o permessi</p>
          </div>
        </div>
      )}

      {/* Configuration */}
      {activeIntegration === 'trello-api' && (
        <div className="p-4 sm:p-6 bg-yellow-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">🔑 Configurazione Trello</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKeys.trello.key}
                onChange={(e) => setApiKeys(prev => ({
                  ...prev,
                  trello: { ...prev.trello, key: e.target.value }
                }))}
                placeholder="La tua API Key di Trello (es: a1b2c3d4e5f6...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
              {apiKeys.trello.key && apiKeys.trello.key.length < 20 && (
                <p className="text-xs text-red-600 mt-1">❌ API Key troppo corta (minimo 20 caratteri)</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <input
                type="text"
                value={apiKeys.trello.token}
                onChange={(e) => setApiKeys(prev => ({
                  ...prev,
                  trello: { ...prev.trello, token: e.target.value }
                }))}
                placeholder="Il tuo Token di Trello (es: a1b2c3d4e5f6...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
              {apiKeys.trello.token && apiKeys.trello.token.length < 40 && (
                <p className="text-xs text-red-600 mt-1">❌ Token troppo corto (minimo 40 caratteri)</p>
              )}
            </div>
            
            {/* Test Button */}
            {apiKeys.trello.key && apiKeys.trello.token && (
              <button
                onClick={async () => {
                  try {
                    const credentials = `key=${encodeURIComponent(apiKeys.trello.key)}&token=${encodeURIComponent(apiKeys.trello.token)}`
                    const response = await fetch(`https://api.trello.com/1/members/me?${credentials}`, {
                      method: 'GET',
                      mode: 'cors'
                    })
                    
                    if (response.ok) {
                      const user = await response.json()
                      alert(`✅ Connessione riuscita!\n👤 Utente: ${user.fullName || user.username}`)
                    } else {
                      const errorText = await response.text()
                      let errorMsg = errorText
                      try {
                        const errorJson = JSON.parse(errorText)
                        errorMsg = errorJson.message || errorText
                      } catch {}
                      alert(`❌ Errore: ${errorMsg}`)
                    }
                  } catch (err) {
                    if (err.message.includes('CORS') || err.name === 'TypeError') {
                      alert(`⚠️ Errore CORS: impossibile testare da browser.\n\n✅ Le credenziali verranno testate durante la creazione del board.\n\n💡 Se hai dubbi, verifica su: https://trello.com/app-key`)
                    } else {
                      alert(`❌ Errore di connessione: ${err.message}`)
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                🧪 Testa Connessione
              </button>
            )}
            
            <div className="text-xs text-gray-600 bg-white p-3 rounded border">
              💡 <strong>Come ottenere le credenziali:</strong><br/>
              1. Vai su <a href="https://trello.com/app-key" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://trello.com/app-key</a><br/>
              2. Copia la tua <strong>API Key</strong><br/>
              3. Clicca su "Token" per generare il <strong>Token</strong><br/>
              4. Incolla entrambi qui sopra<br/>
              5. Clicca "Crea Board" (il test potrebbe non funzionare per CORS)<br/><br/>
              
              ⚠️ <strong>Nota CORS:</strong> I browser moderni bloccano le chiamate dirette alle API esterne. Se la creazione automatica fallisce, usa l'esportazione CSV o le istruzioni manuali.
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="p-4 sm:p-6">
        <h4 className="font-medium text-gray-900 mb-3">
          👀 Anteprima {activeIntegrationData?.name}
        </h4>
        
        {(activeIntegration === 'trello-simple' || activeIntegration === 'trello-api') && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">📋 Board: {feature.metadata.name}</h5>
              <p className="text-sm text-blue-700 mb-3">{feature.metadata.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {generateTrelloData().lists.map(list => (
                  <div key={list.name} className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-gray-900 mb-2">{list.name}</h6>
                    <div className="space-y-2">
                      {list.cards.slice(0, 3).map((card, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="font-medium">{card.name}</div>
                          <div className="text-gray-600 mt-1">{card.labels?.join(', ')}</div>
                        </div>
                      ))}
                      {list.cards.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{list.cards.length - 3} altre card...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeIntegration === 'csv' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">📊 CSV Preview (Trello Compatible)</h5>
            <pre className="text-xs text-green-800 overflow-x-auto">
              {generateCSV().split('\n').slice(0, 5).join('\n')}
              {generateCSV().split('\n').length > 5 && '\n...'}
            </pre>
            <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
              💡 <strong>Come importare in Trello:</strong><br/>
              1. Scarica il CSV<br/>
              2. Vai su Trello → Crea Board<br/>
              3. Menu Board → Altro → Stampa ed esporta → Importa da CSV<br/>
              4. Carica il file scaricato
            </div>
          </div>
        )}

        {(activeIntegration === 'notion' || activeIntegration === 'linear') && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">📝 JSON Preview</h5>
            <pre className="text-xs text-purple-800 overflow-x-auto max-h-40 overflow-y-auto">
              {JSON.stringify(
                activeIntegration === 'notion' ? generateNotionData() : generateLinearData(),
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={activeIntegrationData?.handler}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-sm"
          >
            {activeIntegrationData?.action}
          </button>
        </div>
      </div>
    </div>
  )
}