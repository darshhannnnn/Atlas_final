import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import AtlasLogo from '../components/AtlasLogo'

const Login = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tokenData = await authService.login(formData.email, formData.password)
      setAuth(null, tokenData.access_token)
      
      const userData = await authService.getCurrentUser()
      setAuth(userData, tokenData.access_token)
      
      toast.success('Welcome to ATLAS!')
      navigate('/chat')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#2C2C2C] relative overflow-hidden">
      {/* Header Navigation */}
      <header className="relative z-20 border-b border-[#3C3C3C] bg-[#1E1E1E]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AtlasLogo size="sm" animated={false} />
              <span className="text-xl font-display font-bold text-[#FFF8F0] italic">ATLAS</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Features</a>
              <a href="#about" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">About</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Pricing</a>
              <Link to="/register" className="text-sm bg-[#C9A574] hover:bg-[#D9B584] text-[#1E1E1E] px-4 py-2 rounded-lg font-semibold transition-all">
                Try ATLAS
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#C9A574] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#C9A574] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#C9A574] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#C9A574] rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-radial-gradient"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        {/* Login Card */}
        <div className="max-w-md w-full space-y-8 bg-[#1E1E1E]/90 backdrop-blur-xl border border-[#3C3C3C] p-12 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <AtlasLogo size="lg" animated={true} />
            </div>
            <h2 className="text-5xl font-display font-bold text-[#FFF8F0] italic tracking-tight">
              ATLAS
            </h2>
            <p className="mt-3 text-sm text-[#C9A574] font-semibold tracking-widest uppercase">
              Visionary Intelligence
            </p>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Sign in to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3.5 border border-[#4C4C4C] bg-[#3C3C3C] text-[#FFF8F0] placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-[#C9A574] focus:border-transparent shadow-sm text-[15px]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3.5 border border-[#4C4C4C] bg-[#3C3C3C] text-[#FFF8F0] placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-[#C9A574] focus:border-transparent shadow-sm text-[15px]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-[#1E1E1E] bg-[#C9A574] hover:bg-[#D9B584] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A574] disabled:opacity-50 font-bold shadow-xl hover:shadow-2xl transition-all text-sm tracking-wide"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center">
              <Link
                to="/register"
                className="font-semibold text-sm text-[#C9A574] hover:text-[#D9B584]"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-16 px-6 bg-[#1E1E1E]/50 backdrop-blur-sm border-t border-[#3C3C3C]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold text-[#FFF8F0] mb-4">Meet ATLAS</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ATLAS is a next-generation AI assistant built to be safe, accurate, and secure to help you do your best work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#2C2C2C]/50 rounded-2xl border border-[#3C3C3C] hover:border-[#C9A574] transition-all">
              <div className="w-12 h-12 bg-[#C9A574]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C9A574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#FFF8F0] mb-2">Create with ATLAS</h4>
              <p className="text-sm text-gray-400">Draft and iterate on websites, graphics, documents, and code alongside your chat with Artifacts.</p>
            </div>

            <div className="text-center p-6 bg-[#2C2C2C]/50 rounded-2xl border border-[#3C3C3C] hover:border-[#C9A574] transition-all">
              <div className="w-12 h-12 bg-[#C9A574]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C9A574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#FFF8F0] mb-2">Bring your knowledge</h4>
              <p className="text-sm text-gray-400">Upload documents and files to enhance ATLAS's understanding of your specific needs and context.</p>
            </div>

            <div className="text-center p-6 bg-[#2C2C2C]/50 rounded-2xl border border-[#3C3C3C] hover:border-[#C9A574] transition-all">
              <div className="w-12 h-12 bg-[#C9A574]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#C9A574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#FFF8F0] mb-2">Share and collaborate</h4>
              <p className="text-sm text-gray-400">Work together with your team using shared conversations and collaborative features.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#1E1E1E] border-t border-[#3C3C3C] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-sm font-semibold text-[#FFF8F0] mb-4">Product</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-[#FFF8F0] mb-4">Solutions</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">AI Agents</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Research</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Education</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-[#FFF8F0] mb-4">Resources</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-[#FFF8F0] mb-4">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#3C3C3C] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AtlasLogo size="sm" animated={false} />
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Usage Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Login

