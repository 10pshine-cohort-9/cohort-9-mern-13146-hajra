import api from '../api';
import { noteService } from '../noteService';

jest.mock('../api');

describe('noteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotes returns response.data.data when present', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 1, title: 'Note 1' }] } });

    const result = await noteService.getNotes();

    expect(api.get).toHaveBeenCalledWith('/notes', { params: {} });
    expect(result).toEqual([{ id: 1, title: 'Note 1' }]);
  });

  it('getNotes falls back to response.data.notes when data.data is absent', async () => {
    api.get.mockResolvedValue({ data: { notes: [{ id: 2 }] } });

    const result = await noteService.getNotes({ q: 'test' });

    expect(api.get).toHaveBeenCalledWith('/notes', { params: { q: 'test' } });
    expect(result).toEqual([{ id: 2 }]);
  });

  it('searchNotes calls the search endpoint with params', async () => {
    api.get.mockResolvedValue({ data: { data: [{ id: 3 }] } });

    const result = await noteService.searchNotes({ q: 'meeting' });

    expect(api.get).toHaveBeenCalledWith('/notes/search', { params: { q: 'meeting' } });
    expect(result).toEqual([{ id: 3 }]);
  });

  it('createNote posts note data and returns response.data.note when present', async () => {
    api.post.mockResolvedValue({ data: { note: { id: 4, title: 'New' } } });

    const result = await noteService.createNote({ title: 'New', content: 'Body' });

    expect(api.post).toHaveBeenCalledWith('/notes', { title: 'New', content: 'Body' });
    expect(result).toEqual({ id: 4, title: 'New' });
  });

  it('createNote falls back to raw response.data when no known key is present', async () => {
    api.post.mockResolvedValue({ data: { id: 5 } });

    const result = await noteService.createNote({ title: 'New' });

    expect(result).toEqual({ id: 5 });
  });

  it('updateNote puts to the correct id endpoint', async () => {
    api.put.mockResolvedValue({ data: { data: { id: 6, title: 'Updated' } } });

    const result = await noteService.updateNote(6, { title: 'Updated' });

    expect(api.put).toHaveBeenCalledWith('/notes/6', { title: 'Updated' });
    expect(result).toEqual({ id: 6, title: 'Updated' });
  });

  it('deleteNote calls delete on the correct id endpoint', async () => {
    api.delete.mockResolvedValue({ data: { data: { success: true } } });

    const result = await noteService.deleteNote(7);

    expect(api.delete).toHaveBeenCalledWith('/notes/7');
    expect(result).toEqual({ success: true });
  });

  it('togglePin patches the pin endpoint for the given id', async () => {
    api.patch.mockResolvedValue({ data: { data: { id: 8, is_pinned: true } } });

    const result = await noteService.togglePin(8);

    expect(api.patch).toHaveBeenCalledWith('/notes/8/pin');
    expect(result).toEqual({ id: 8, is_pinned: true });
  });

  it('toggleArchive patches the archive endpoint for the given id', async () => {
    api.patch.mockResolvedValue({ data: { data: { id: 9, is_archived: true } } });

    const result = await noteService.toggleArchive(9);

    expect(api.patch).toHaveBeenCalledWith('/notes/9/archive');
    expect(result).toEqual({ id: 9, is_archived: true });
  });

  it('throws a custom error with the server message when the request fails', async () => {
    const serverError = {
      response: { status: 400, data: { message: 'Invalid note data' } },
    };
    api.post.mockRejectedValue(serverError);

    await expect(noteService.createNote({})).rejects.toThrow('Invalid note data');
  });

  it('throws a custom error with the generic error message when no server message exists', async () => {
    const genericError = new Error('Network Error');
    api.get.mockRejectedValue(genericError);

    await expect(noteService.getNotes()).rejects.toThrow('Network Error');
  });

  it('throws a fallback message when neither a server message nor an error message exists', async () => {
    api.get.mockRejectedValue({});

    await expect(noteService.getNotes()).rejects.toThrow('An unexpected error occurred');
  });
});