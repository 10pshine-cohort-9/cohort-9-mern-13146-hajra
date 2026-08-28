import api from './api';

const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data.data || response.data.notes || response.data.note || response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
    const customError = new Error(message);
    customError.response = err.response;
    customError.status = err.response?.status;
    throw customError;
  }
};

export const noteService = {
  getNotes: async (params = {}) => {
    return handleApiCall(() => api.get('/notes', { params }));
  },

  searchNotes: async (searchParams) => {
    return handleApiCall(() => api.get('/notes/search', { params: searchParams }));
  },

  createNote: async (noteData) => {
    return handleApiCall(() => api.post('/notes', noteData));
  },

  updateNote: async (id, noteData) => {
    return handleApiCall(() => api.put(`/notes/${id}`, noteData));
  },

  deleteNote: async (id) => {
    return handleApiCall(() => api.delete(`/notes/${id}`));
  },

  togglePin: async (id) => {
    return handleApiCall(() => api.patch(`/notes/${id}/pin`));
  },

  toggleArchive: async (id) => {
    return handleApiCall(() => api.patch(`/notes/${id}/archive`));
  },
};

export default noteService;