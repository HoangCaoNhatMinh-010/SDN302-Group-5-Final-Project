import { apiClient } from './apiClient';

export const chatService = {
  getContacts: async () => {
    return await apiClient.get('/chat/contacts');
  },

  getMessages: async (channelType = 'STORE', staffId = null) => {
    const params = new URLSearchParams({ channelType });
    if (staffId) params.set('staffId', staffId);
    return await apiClient.get(`/chat/messages?${params.toString()}`);
  },

  sendMessage: async ({ channelType = 'STORE', staffId = null, content }) => {
    return await apiClient.post('/chat/messages', {
      channelType,
      staffId,
      content,
    });
  },

  askAiConsultant: async ({ question, petId = null }) => {
    return await apiClient.post('/chat/ai-consult', {
      question,
      petId,
    });
  },
};

