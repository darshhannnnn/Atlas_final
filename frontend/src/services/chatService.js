import api from './api'

export const chatService = {
  async createConversation(title = 'New Conversation') {
    const response = await api.post('/chat/conversations', { title })
    return response.data
  },

  async getConversations() {
    const response = await api.get('/chat/conversations')
    return response.data
  },

  async getMessages(conversationId) {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`)
    return response.data
  },

  async sendMessage(conversationId, message, mode = 'pipeline', selectedAgent = null, files = [], signal = null) {
    // Upload files first if any
    let fileIds = []
    if (files.length > 0) {
      try {
        const uploadResult = await this.uploadFiles(files, signal)
        fileIds = uploadResult.file_ids || []
      } catch (error) {
        if (error.name === 'AbortError') throw error
        console.error('File upload failed:', error)
        throw new Error('Failed to upload files: ' + (error.response?.data?.detail || error.message))
      }
    }

    const response = await api.post('/chat/message', {
      message,
      conversation_id: conversationId,
      mode,
      selected_agent: selectedAgent,
      file_ids: fileIds
    }, {
      signal: signal
    })
    return response.data
  },

  async deleteConversation(conversationId) {
    await api.delete(`/chat/conversations/${conversationId}`)
  },

  async updateConversationTitle(conversationId, title) {
    const response = await api.patch(`/chat/conversations/${conversationId}/title`, null, {
      params: { title }
    })
    return response.data
  },

  async uploadFiles(files, signal = null) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: signal
    })
    return response.data
  },
}
