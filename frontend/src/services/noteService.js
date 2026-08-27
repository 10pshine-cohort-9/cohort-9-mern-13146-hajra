import api from '../services/api';

export const noteService = {
  getNotes: async (params = {}) => {
    const response = await api.get('/notes', { params });
    return response.data.data || response.data.notes || response.data;
  },

  searchNotes: async (searchParams) => {
    const response = await api.get('/notes/search', { params: searchParams });
    return response.data.data || response.data.notes || response.data;
  },

createNote: async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data.data || response.data.note || response.data;
},

updateNote: async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data.data || response.data.note || response.data;
},

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  togglePin: async (id) => {
    const response = await api.patch(`/notes/${id}/pin`);
    return response.data;
  },

  toggleArchive: async (id) => {
    const response = await api.patch(`/notes/${id}/archive`);
    return response.data;
  },
};

export default noteService;