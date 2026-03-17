import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import AtlasLogo from '../components/AtlasLogo'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(false)

  const interestOptions = [
    { 
      id: 'coding', 
      label: 'Coding & developing', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    },
    { 
      id: 'learning', 
      label: 'Learning & studying', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
    { 
      id: 'writing', 
      label: 'Writing & content creation', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    },
    { 
      id: 'business', 
      label: 'Business & strategy', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
    { 
      id: 'design', 
      label: 'Design & creativity', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    },
    { 
      id: 'life', 
      label: 'Life stuff', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      id: 'general', 
      label: "ATLAS's choice", 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    }
  ]

  const starterPrompts = {
    coding: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        text: 'Create API documentation for my REST endpoints' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        text: 'Build a React component with TypeScript' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        text: 'Debug this Python error and explain the fix' 
      }
    ],
    learning: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        text: 'Create a curriculum inspired by my favorite cultural movement' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        text: 'Explain quantum computing in simple terms' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        text: 'Create a study plan for learning machine learning' 
      }
    ],
    writing: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
        text: 'Write a blog post about sustainable technology' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
        text: 'Create engaging social media content for my brand' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
        text: 'Draft a professional email to a potential client' 
      }
    ],
    business: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        text: 'Analyze market trends for my startup idea' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        text: 'Create a business plan outline' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        text: 'Develop a go-to-market strategy' 
      }
    ],
    design: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        text: 'Generate color palette ideas for my brand' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        text: 'Create a UI/UX design system structure' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
        text: 'Design a logo concept with meaning' 
      }
    ],
    life: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        text: 'Plan a healthy meal prep for the week' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        text: 'Suggest productivity tips for remote work' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        text: 'Create a morning routine that boosts energy' 
      }
    ],
    general: [
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        text: 'Surprise me with an interesting fact' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        text: 'Help me brainstorm creative project ideas' 
      },
      { 
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        text: 'Explain a complex topic in a fun way' 
      }
    ]
  }

  const toggleInterest = (id) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id))
    } else {
      if (interests.length < 3) {
        setInterests([...interests, id])
      } else {
        toast.error('You can select up to 3 topics')
      }
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error('Please enter your name')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (interests.length === 0) {
        toast.error('Please select at least one topic')
        return
      }
      setStep(3)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      console.log('Updating profile with:', { name, interests, onboarding_completed: true })
      
      const updatedUser = await authService.updateProfile({
        name: name,
        interests: interests,
        onboarding_completed: true
      })
      
      console.log('Profile updated successfully:', updatedUser)
      
      // Update user in store
      setUser(updatedUser)
      
      toast.success('Profile setup complete!')
      navigate('/chat')
    } catch (error) {
      console.error('Profile update error:', error)
      console.error('Error response:', error.response)
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to save profile'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleStarterPrompt = async (prompt) => {
    setLoading(true)
    try {
      console.log('Updating profile with:', { name, interests, onboarding_completed: true })
      
      const updatedUser = await authService.updateProfile({
        name: name,
        interests: interests,
        onboarding_completed: true
      })
      
      console.log('Profile updated successfully:', updatedUser)
      
      // Update user in store
      setUser(updatedUser)
      
      // Navigate to chat with the prompt
      navigate('/chat', { state: { initialPrompt: prompt } })
    } catch (error) {
      console.error('Profile update error:', error)
      console.error('Error response:', error.response)
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to save profile'
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  const getRelevantPrompts = () => {
    if (interests.length === 0) return starterPrompts.general
    
    // Get prompts from first selected interest
    const primaryInterest = interests[0]
    return starterPrompts[primaryInterest] || starterPrompts.general
  }

  return (
    <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="mb-8">
          <AtlasLogo size="md" animated={true} />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <h1 className="text-4xl font-display font-bold text-[#FFF8F0] leading-tight">
              Before we get started, what should I call you?
            </h1>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="Enter your name"
                className="w-full bg-[#3C3C3C] border-2 border-[#4C4C4C] focus:border-[#C9A574] text-[#FFF8F0] placeholder-gray-500 rounded-2xl px-6 py-4 text-lg focus:outline-none transition-all"
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#C9A574] hover:bg-[#D9B584] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#1E1E1E] p-3 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <h1 className="text-4xl font-display font-bold text-[#FFF8F0] leading-tight">
              What are you into, {name}? Pick up to three topics to explore.
            </h1>

            <div className="flex flex-wrap gap-3">
              {interestOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className={`px-6 py-3 rounded-full border-2 transition-all flex items-center gap-3 text-base font-medium group ${
                    interests.includes(option.id)
                      ? 'bg-[#C9A574] border-[#C9A574] text-[#1E1E1E]'
                      : 'bg-[#3C3C3C] border-[#4C4C4C] text-[#FFF8F0] hover:border-[#C9A574]'
                  }`}
                >
                  <span className={interests.includes(option.id) ? 'text-[#1E1E1E]' : 'text-gray-400 group-hover:text-[#C9A574] transition-colors'}>
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-300 font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={interests.length === 0}
                className="bg-[#C9A574] hover:bg-[#D9B584] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#1E1E1E] px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Let's go
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Starter Prompts */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-4xl font-display font-bold text-[#FFF8F0] leading-tight mb-3">
                All set! Here are a few ideas just for you.
              </h1>
              <p className="text-xl text-gray-400">
                Where should we start?
              </p>
            </div>

            <div className="space-y-4">
              {getRelevantPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarterPrompt(prompt.text)}
                  className="w-full bg-[#3C3C3C] hover:bg-[#4C4C4C] border border-[#4C4C4C] hover:border-[#C9A574] text-[#FFF8F0] px-6 py-5 rounded-2xl transition-all text-left flex items-center gap-4 group"
                >
                  <span className="text-gray-400 group-hover:text-[#C9A574] transition-colors flex-shrink-0">
                    {prompt.icon}
                  </span>
                  <span className="text-lg font-medium group-hover:text-[#C9A574] transition-colors">
                    {prompt.text}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="text-gray-400 hover:text-gray-300 font-medium"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="text-gray-400 hover:text-[#C9A574] font-medium transition-colors"
              >
                {loading ? 'Saving...' : 'I have my own topic →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
