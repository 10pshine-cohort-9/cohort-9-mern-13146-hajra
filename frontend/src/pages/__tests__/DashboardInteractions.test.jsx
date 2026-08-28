import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { noteService } from '../../services/noteService';

if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: jest.fn(() => 'mocked-object-url'),
    writable: true,
  });
}

if (typeof URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: jest.fn(),
    writable: true,
  });
}

jest.mock('../../services/noteService', () => ({
  noteService: {
    getNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    togglePin: jest.fn(),
    toggleArchive: jest.fn(),
    searchNotes: jest.fn(),
  },
}));

jest.mock('react-quill-new', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="mock-quill-editor"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe('Dashboard Interactions and Edge Cases', () => {
  const mockNotes = [
    {
      id: 1,
      title: 'First Pinned Note',
      content: 'Content one',
      is_pinned: 1,
      is_archived: 0,
      updated_at: '2026-06-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Second Note',
      content: 'Content two',
      is_pinned: false,
      is_archived: 0,
      updated_at: '2026-06-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles note editing, color change errors, modal close, and update failure branches', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);
    noteService.updateNote.mockRejectedValueOnce({
      response: { data: { message: 'Failed to update note' } },
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit Note');
    fireEvent.click(editButtons[1]);

    await waitFor(() => {
      expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit Note')).not.toBeInTheDocument();
    });

    fireEvent.click(editButtons[1]);
    await waitFor(() => {
      expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save note/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update note')).toBeInTheDocument();
    });

    const paletteButtons = screen.getAllByTitle('Change Color');
    fireEvent.click(paletteButtons[0]);

    await waitFor(() => {
      const lavenderBtn = screen.getByTitle('Lavender');
      expect(lavenderBtn).toBeInTheDocument();
      fireEvent.click(lavenderBtn);
    });
  });

  test('handles color update, color update failure, and search empty/error fallback branches', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);
    noteService.updateNote.mockResolvedValue({});
    noteService.searchNotes.mockRejectedValueOnce({});

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const paletteButtons = screen.getAllByTitle('Change Color');
    fireEvent.click(paletteButtons[0]);

    await waitFor(() => {
      const lavenderBtn = screen.getByTitle('Lavender');
      expect(lavenderBtn).toBeInTheDocument();
      fireEvent.click(lavenderBtn);
    });

    fireEvent.click(paletteButtons[0]);

    await waitFor(() => {
      const lavenderBtn = screen.getByTitle('Lavender');
      expect(lavenderBtn).toBeInTheDocument();
      fireEvent.click(lavenderBtn);
    });

    const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
    fireEvent.change(searchInput, { target: { value: '   ' } });
    
    await waitFor(() => {
      expect(noteService.getNotes).toHaveBeenCalled();
    });

    fireEvent.change(searchInput, { target: { value: 'TriggerError' } });
    await waitFor(() => {
      expect(screen.getByText('Failed to search notes')).toBeInTheDocument();
    });
  });

  test('explicitly covers search whitespace, search error fallback, and note palette branches', async () => {
    const mockNotesData = [
      {
        id: 1,
        title: 'Alpha Note',
        content: 'Content Alpha',
        is_pinned: 0,
        is_archived: false,
        updated_at: '2026-06-01T10:00:00Z',
      },
    ];

    noteService.getNotes.mockResolvedValue(mockNotesData);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Alpha Note')).toBeInTheDocument();
    });

    const paletteBtn = screen.getByTitle('Change Color');
    fireEvent.click(paletteBtn);

    await waitFor(() => {
      const lavenderOption = screen.getByTitle('Lavender');
      expect(lavenderOption).toBeInTheDocument();
      fireEvent.click(lavenderOption);
    });

    const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
    
    noteService.searchNotes.mockResolvedValueOnce(mockNotesData);
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    
    await waitFor(() => {
      expect(noteService.searchNotes).toHaveBeenCalledWith({ q: 'Alpha' });
    });

    fireEvent.change(searchInput, { target: { value: '   ' } });
    await waitFor(() => {
      expect(noteService.getNotes).toHaveBeenCalledTimes(2);
    });

    noteService.searchNotes.mockRejectedValueOnce({});
    fireEvent.change(searchInput, { target: { value: 'TriggerError' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to search notes')).toBeInTheDocument();
    });
  });

  test('fully covers search reset, search error catch, and color selection branches', async () => {
    const mockNotesList = [
      {
        id: 1,
        title: 'Dashboard Note',
        content: 'Sample text',
        is_pinned: 1,
        is_archived: false,
        updated_at: '2026-06-01T10:00:00Z',
      },
    ];

    noteService.getNotes.mockResolvedValue(mockNotesList);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Note')).toBeInTheDocument();
    });

    const paletteTrigger = screen.getByTitle('Change Color');
    fireEvent.click(paletteTrigger);

    await waitFor(() => {
      const lavenderBtn = screen.getByTitle('Lavender');
      expect(lavenderBtn).toBeInTheDocument();
      fireEvent.click(lavenderBtn);
    });

    const searchField = screen.getByPlaceholderText(/search notes by title or content/i);
    noteService.searchNotes.mockResolvedValueOnce(mockNotesList);
    
    fireEvent.change(searchField, { target: { value: 'Dashboard' } });
    await waitFor(() => {
      expect(noteService.searchNotes).toHaveBeenCalledWith({ q: 'Dashboard' });
    });

    fireEvent.change(searchField, { target: { value: '     ' } });
    await waitFor(() => {
      expect(noteService.getNotes).toHaveBeenCalledTimes(2);
    });

    noteService.searchNotes.mockRejectedValueOnce({});
    fireEvent.change(searchField, { target: { value: 'BadQuery' } });

    await waitFor(() => {
      expect(screen.getByText('Failed to search notes')).toBeInTheDocument();
    });
  });

  describe('Dashboard - remaining error and date fallback branches', () => {
    test('handles fetchNotes error when response has no error message', async () => {
      noteService.getNotes.mockRejectedValueOnce({});
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText('Failed to fetch notes')).toBeInTheDocument());
    });

    test('handles searchNotes error when response has no error message', async () => {
      noteService.getNotes.mockResolvedValue([]);
      noteService.searchNotes.mockRejectedValueOnce({});
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());
      
      fireEvent.change(screen.getByPlaceholderText(/search notes by title or content/i), {
        target: { value: 'test' },
      });
      await waitFor(() => expect(screen.getByText('Failed to search notes')).toBeInTheDocument());
    });

    test('handles handleDelete error when response has no error message', async () => {
      noteService.getNotes.mockResolvedValue([
        { id: 10, title: 'Delete Me', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
      ]);
      noteService.deleteNote.mockRejectedValueOnce({});
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText('Delete Me')).toBeInTheDocument());
      
      fireEvent.click(screen.getByTitle('Delete Note'));
      await waitFor(() => expect(screen.getByText('Failed to delete note')).toBeInTheDocument());
    });

    test('falls back to created_at when updated_at is missing for sorting and date display', async () => {
      noteService.getNotes.mockResolvedValue([
        { id: 11, title: 'No Updated At', content: 'x', is_pinned: 0, is_archived: 0, created_at: '2026-06-05T10:00:00Z' },
      ]);
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText('No Updated At')).toBeInTheDocument());
      
      fireEvent.change(screen.getByDisplayValue('Sort Notes'), { target: { value: 'newest' } });
      await waitFor(() => expect(screen.getByText('No Updated At')).toBeInTheDocument());
    });
  });
});