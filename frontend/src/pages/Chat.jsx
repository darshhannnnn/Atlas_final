import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useLocation } from 'react-router-dom'
import { chatService } from '../services/chatService'
import toast from 'react-hot-toast'
import AtlasLogo from '../components/AtlasLogo'

export default function Chat() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState([])
  const [mode, setMode] = useState('solo')
  const [selectedAgent, setSelectedAgent] = useState('search')
  const [loading, setLoading] = useState(false)
  const [showTrace, setShowTrace] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const userMenuRef = useRef(null)

  const agents = [
    { id: 'search', name: 'Search Agent', desc: 'Web & doc search' },
    { id: 'outliner', name: 'Outliner Agent', desc: 'Structure content' },
    { id: 'writer', name: 'Writer Agent', desc: 'Write full content' },
    { id: 'verifier', name: 'Verifier Agent', desc: 'Fact-check' },
    { id: 'summarizer', name: 'Summarizer Agent', desc: 'Summarize' },
    { id: 'update', name: 'Update Agent', desc: 'Refine content' }
  ]

  useEffect(() => {
    loadConversations()
    
    // Handle initial prompt from onboarding
    if (location.state?.initialPrompt) {
      setInput(location.state.initialPrompt)
      // Clear the state
      window.history.replaceState({}, document.title)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      toast.error('Failed to load conversations')
    }
  }

  const createNewConversation = async () => {
    // Just clear the current conversation and messages
    // The actual conversation will be created when the first message is sent
    setCurrentConversation(null)
    setMessages([])
  }

  const deleteConversation = async (convId, e) => {
    e.stopPropagation()
    
    if (!confirm('Delete this conversation?')) return
    
    try {
      await chatService.deleteConversation(convId)
      setConversations(conversations.filter(c => c.id !== convId))
      
      if (currentConversation?.id === convId) {
        setCurrentConversation(null)
        setMessages([])
      }
      
      toast.success('Conversation deleted')
    } catch (error) {
      toast.error('Failed to delete conversation')
    }
  }

  const generateConversationTitle = (message) => {
    const words = message.trim().split(/\s+/)
    if (words.length <= 6) {
      return message
    }
    return words.slice(0, 6).join(' ') + '...'
  }

  const updateConversationTitle = async (convId, firstMessage) => {
    try {
      const title = generateConversationTitle(firstMessage)
      
      console.log('Updating conversation title:', { convId, title })
      await chatService.updateConversationTitle(convId, title)
      
      // Reload conversations to get updated title
      await loadConversations()
      
      // Update current conversation
      if (currentConversation?.id === convId) {
        setCurrentConversation({ ...currentConversation, title })
      }
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  const loadConversation = async (convId) => {
    try {
      const msgs = await chatService.getMessages(convId)
      setMessages(msgs)
      setCurrentConversation(conversations.find(c => c.id === convId))
    } catch (error) {
      toast.error('Failed to load messages')
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const validTypes = ['.pdf', '.docx', '.txt']
    const invalidFiles = selectedFiles.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return !validTypes.includes(ext)
    })
    
    if (invalidFiles.length > 0) {
      toast.error(`Invalid file types. Only PDF, DOCX, and TXT are allowed.`)
      return
    }
    
    setFiles(selectedFiles)
    toast.success(`${selectedFiles.length} file(s) selected`)
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
      toast.success('Generation stopped')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() && files.length === 0) return
    
    const currentInput = input
    const currentFiles = files
    
    // Create conversation if needed
    let conversation = currentConversation
    if (!conversation) {
      try {
        conversation = await chatService.createConversation('New Conversation')
        setConversations([conversation, ...conversations])
        setCurrentConversation(conversation)
      } catch (error) {
        toast.error('Failed to create conversation')
        return
      }
    }
    
    const isFirstMessage = messages.length === 0

    const userMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    }
    
    if (currentFiles.length > 0) {
      userMessage.content += `\n\n📎 Files: ${currentFiles.map(f => f.name).join(', ')}`
    }
    
    setMessages([...messages, userMessage])
    setInput('')
    setFiles([])
    setLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      const response = await chatService.sendMessage(
        conversation.id,
        currentInput,
        mode,
        mode === 'solo' ? selectedAgent : null,
        currentFiles,
        abortControllerRef.current.signal
      )
      
      if (isFirstMessage) {
        await updateConversationTitle(conversation.id, currentInput)
      }
      
      const content = response.content || response.response || 'No response generated'
      const traces = response.agent_traces || response.agent_trace || []
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: content,
        agent_trace: traces,
        timestamp: new Date().toISOString()
      }])
      
      await loadConversations()
    } catch (error) {
      if (error.name === 'AbortError' || error.message?.includes('abort')) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ Generation stopped by user',
          timestamp: new Date().toISOString()
        }])
        return
      }
      
      const errorDetail = error.response?.data?.detail || error.message || 'Failed to process your message'
      toast.error(typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail))
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail, null, 2)}`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="flex h-screen bg-[#2C2C2C]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-[#1E1E1E] border-r border-[#3C3C3C] flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-[#3C3C3C]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AtlasLogo size="sm" animated={false} />
              <h1 className="text-xl font-display font-bold text-[#FFF8F0] italic tracking-tight">
                ATLAS
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-300 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-[10px] text-[#C9A574] font-semibold tracking-widest uppercase">
            Visionary Intelligence
          </p>
        </div>
        
        <div className="p-3">
          <button
            onClick={createNewConversation}
            className="w-full bg-[#3C3C3C] hover:bg-[#4C4C4C] text-[#FFF8F0] py-2.5 px-4 rounded-lg transition-all font-medium text-sm flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            New chat
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 py-2 space-y-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-[#3C3C3C] hover:text-[#FFF8F0] rounded-lg transition-all flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-[#C9A574] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-[#3C3C3C] hover:text-[#FFF8F0] rounded-lg transition-all flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-[#C9A574] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Customize</span>
          </button>
        </div>

        {/* Search Box */}
        {showSearch && (
          <div className="px-3 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#3C3C3C] border border-[#4C4C4C] text-[#FFF8F0] placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A574]"
            />
          </div>
        )}

        <div className="px-3 py-2 mt-2">
          <p className="text-xs text-gray-500 font-semibold mb-2 px-3">Recents</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-1">
          {conversations
            .filter(conv => 
              searchQuery === '' || 
              conv.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(conv => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`px-3 py-2.5 mb-1 rounded-lg cursor-pointer group relative transition-all ${
                currentConversation?.id === conv.id
                  ? 'bg-[#3C3C3C] text-[#FFF8F0]'
                  : 'text-gray-400 hover:bg-[#3C3C3C] hover:text-[#FFF8F0]'
              }`}
            >
              <p className="text-sm font-medium truncate pr-6 leading-relaxed">
                {conv.title}
              </p>
              
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                title="Delete conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          {searchQuery && conversations.filter(conv => 
            conv.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              No conversations found
            </div>
          )}
        </div>

        {/* Bottom section - User Profile */}
        <div className="p-4 border-t border-[#3C3C3C] relative" ref={userMenuRef}>
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-2 py-2 hover:bg-[#3C3C3C] rounded-lg cursor-pointer transition-all"
          >
            <div className="w-8 h-8 bg-[#C9A574] rounded-full flex items-center justify-center text-sm font-bold text-[#1E1E1E] overflow-hidden">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 font-medium truncate">{user?.email}</p>
              <p className="text-xs text-gray-500">Free plan</p>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1E1E1E] border border-[#3C3C3C] rounded-lg shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-[#3C3C3C]">
                <p className="text-sm text-gray-300 font-medium truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">User ID: {user?.id}</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    setShowSettings(true)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#3C3C3C] transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    setShowProfile(true)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#3C3C3C] transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    toast.success('Upgrade feature coming soon!')
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#C9A574] hover:bg-[#3C3C3C] transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro
                </button>
              </div>
              
              <div className="border-t border-[#3C3C3C] py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    logout()
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[#3C3C3C] transition-all flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-[#1E1E1E] border border-[#3C3C3C] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#FFF8F0]">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Default Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-[#3C3C3C] border border-[#4C4C4C] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A574]"
                >
                  <option value="solo">Solo Agent</option>
                  <option value="full_research">Full Research</option>
                </select>
              </div>

              {mode === 'solo' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Default Agent
                  </label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full bg-[#3C3C3C] border border-[#4C4C4C] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A574]"
                  >
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Show Agent Trace</span>
                  <button
                    onClick={() => setShowTrace(!showTrace)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showTrace ? 'bg-[#C9A574]' : 'bg-[#3C3C3C]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showTrace ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div className="pt-4 border-t border-[#3C3C3C]">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-[#C9A574] hover:bg-[#D9B584] text-[#1E1E1E] py-2 px-4 rounded-lg transition-all font-semibold"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowProfile(false)}>
          <div className="bg-[#1E1E1E] border border-[#3C3C3C] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#FFF8F0]">My Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#C9A574] rounded-full flex items-center justify-center text-3xl font-bold text-[#1E1E1E]">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#FFF8F0]">
                    {user?.name || user?.username || 'User'}
                  </h3>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <div className="bg-[#3C3C3C] rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Username</p>
                  <p className="text-sm text-[#FFF8F0]">{user?.username}</p>
                </div>

                <div className="bg-[#3C3C3C] rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Email</p>
                  <p className="text-sm text-[#FFF8F0]">{user?.email}</p>
                </div>

                {user?.name && (
                  <div className="bg-[#3C3C3C] rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Display Name</p>
                    <p className="text-sm text-[#FFF8F0]">{user.name}</p>
                  </div>
                )}

                {user?.interests && user.interests.length > 0 && (
                  <div className="bg-[#3C3C3C] rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#C9A574] text-[#1E1E1E] rounded-full text-xs font-medium"
                        >
                          {interest.charAt(0).toUpperCase() + interest.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#3C3C3C] rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Account Type</p>
                  <p className="text-sm text-[#FFF8F0]">Free Plan</p>
                </div>

                <div className="bg-[#3C3C3C] rounded-lg p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Member Since</p>
                  <p className="text-sm text-[#FFF8F0]">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#3C3C3C] space-y-2">
                <button
                  onClick={() => {
                    setShowProfile(false)
                    toast.success('Edit profile feature coming soon!')
                  }}
                  className="w-full bg-[#C9A574] hover:bg-[#D9B584] text-[#1E1E1E] py-2.5 px-4 rounded-lg transition-all font-semibold"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full bg-[#3C3C3C] hover:bg-[#4C4C4C] text-gray-300 py-2.5 px-4 rounded-lg transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-[#2C2C2C] border-b border-[#3C3C3C] px-6 py-4 flex items-center justify-between">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-300 text-xl mr-4"
            >
              ☰
            </button>
          )}
          
          <div className="flex items-center gap-4 flex-1">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-[#3C3C3C] border border-[#4C4C4C] text-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A574]"
            >
              <option value="solo">Solo Agent</option>
              <option value="full_research">Full Research</option>
            </select>

            {mode === 'solo' && (
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="bg-[#3C3C3C] border border-[#4C4C4C] text-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A574]"
              >
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => setShowTrace(!showTrace)}
            className="text-sm text-[#C9A574] hover:text-[#D9B584] font-medium"
          >
            {showTrace ? 'Hide trace' : 'Show trace'}
          </button>
        </div>

        {/* Messages - Centered */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xl">
                  <AtlasLogo size="xl" animated={true} />
                  <h2 className="text-3xl font-display font-bold text-[#FFF8F0] mb-4 italic mt-6">
                    Good evening, {user?.username || 'there'}
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    How can I help you today?
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-full rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-[#3C3C3C] text-[#FFF8F0]'
                      : 'bg-transparent text-[#FFF8F0]'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-xs mt-3 text-gray-500 font-medium">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                {msg.agent_trace && showTrace && (
                  <div className="mt-3 p-4 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl text-xs">
                    <p className="font-semibold text-gray-400 mb-2 tracking-wide">Agent Execution Trace:</p>
                    <pre className="text-gray-500 overflow-x-auto font-mono text-[11px]">
                      {JSON.stringify(msg.agent_trace, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-4 w-4 border-2 border-[#C9A574] border-t-transparent rounded-full"></div>
                    <span className="text-gray-400 font-medium text-sm">Thinking...</span>
                    <button
                      onClick={stopGeneration}
                      className="ml-2 px-3 py-1.5 bg-[#3C3C3C] hover:bg-[#4C4C4C] text-gray-300 text-xs rounded-lg transition-all font-medium"
                    >
                      Stop
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Centered */}
        <div className="bg-[#2C2C2C] border-t border-[#3C3C3C]">
          <div className="max-w-3xl mx-auto px-6 py-6">
            {files.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-[#3C3C3C] text-[#C9A574] px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-[#4C4C4C]"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500 font-semibold">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <label className="cursor-pointer" title="Upload files">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                />
                <div className="p-3 text-gray-400 hover:text-[#C9A574] hover:bg-[#3C3C3C] rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
              </label>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type / for skills"
                  className="w-full bg-[#3C3C3C] border border-[#4C4C4C] text-[#FFF8F0] placeholder-gray-500 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A574] focus:border-transparent text-[15px] leading-relaxed"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!input.trim() && files.length === 0}
                className="bg-[#C9A574] hover:bg-[#D9B584] text-[#1E1E1E] p-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
              >
                <span className="text-xl">↑</span>
              </button>
            </div>

            {/* Bottom hints */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
              <button className="hover:text-[#C9A574] transition-all flex items-center gap-2 font-medium group">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-[#C9A574] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Code</span>
              </button>
              <button className="hover:text-[#C9A574] transition-all flex items-center gap-2 font-medium group">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-[#C9A574] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Write</span>
              </button>
              <button className="hover:text-[#C9A574] transition-all flex items-center gap-2 font-medium group">
                <svg className="w-4 h-4 text-gray-500 group-hover:text-[#C9A574] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Learn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
