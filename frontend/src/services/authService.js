import api from './api'

export const authService = {
  async register(userData) {
    console.log('authService.register called with:', userData)
    console.log('Making POST request to: /auth/register')
    const response = await api.post('/auth/register', userData)
    console.log('Registration response:', response)
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.patch('/auth/profile', profileData)
    return response.data
  },
}
