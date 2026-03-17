import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import AtlasLogo from '../components/AtlasLogo'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting registration with:', formData)
      const result = await authService.register(formData)
      console.log('Registration successful:', result)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      toast.error(error.response?.data?.detail || error.message || 'Registration failed')
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
              <Link to="/login" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Sign in</Link>
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
        {/* Register Card */}
        <div className="max-w-md w-full space-y-8 bg-[#1E1E1E]/90 backdrop-blur-xl border border-[#3C3C3C] p-12 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <AtlasLogo size="lg" animated={true} />
            </div>
            <h2 className="text-5xl font-display font-bold text-[#FFF8F0] italic tracking-tight">
              ATLAS
            </h2>
            <p className="mt-3 text-sm text-[#C9A574] font-semibold tracking-widest uppercase">
              Create your account
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
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3.5 border border-[#4C4C4C] bg-[#3C3C3C] text-[#FFF8F0] placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-[#C9A574] focus:border-transparent shadow-sm text-[15px]"
                />
              </div>
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-300 mb-2 tracking-wide">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3.5 border border-[#4C4C4C] bg-[#3C3C3C] text-[#FFF8F0] placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-[#C9A574] focus:border-transparent shadow-sm text-[15px]"
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
                  minLength={6}
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
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Creating account...' : 'Sign up'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="font-semibold text-sm text-[#C9A574] hover:text-[#D9B584]"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#1E1E1E]/50 backdrop-blur-sm border-t border-[#3C3C3C] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <AtlasLogo size="sm" animated={false} />
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-[#C9A574] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Register
