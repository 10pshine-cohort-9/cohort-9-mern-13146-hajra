// src/pages/__tests__/Dashboard.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';
import { noteService } from '../../services/noteService';


beforeEach(() => {
    delete window.location;
    window.location = { href: '', assign: jest.fn(), replace: jest.fn() };
  });


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

describe('Dashboard Comprehensive Tests', () => {
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
    {
      id: 3,
      title: 'Archived Note',
      content: 'Content three',
      is_pinned: 0,
      is_archived: true,
      updated_at: '2026-06-03T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and handles empty notes state successfully', async () => {
    noteService.getNotes.mockResolvedValue([]);

    render(<Dashboard />);

    expect(screen.getByText('NotesApp')).toBeInTheDocument();
    expect(screen.getByText('Organize your thoughts, ideas, and tasks seamlessly.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No notes found.')).toBeInTheDocument();
    });
  });

  test('handles fetchNotes error gracefully', async () => {
    noteService.getNotes.mockRejectedValue({
      response: { data: { message: 'Failed to load notes server error' } },
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load notes server error')).toBeInTheDocument();
    });
  });

  test('handles fetchNotes generic error without response object', async () => {
    noteService.getNotes.mockRejectedValue({});

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch notes')).toBeInTheDocument();
    });
  });

  test('renders notes correctly and handles search input query changes and errors', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);
    noteService.searchNotes.mockResolvedValue([mockNotes[0]]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Pinned Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search notes by title or content/i);
    
    fireEvent.change(searchInput, { target: { value: 'First' } });
    await waitFor(() => {
      expect(noteService.searchNotes).toHaveBeenCalledWith({ q: 'First' });
      expect(screen.getByText('First Pinned Note')).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(noteService.getNotes).toHaveBeenCalledTimes(2);
    });

    noteService.searchNotes.mockRejectedValue({
      response: { data: { message: 'Search failed' } },
    });
    fireEvent.change(searchInput, { target: { value: 'FailQuery' } });
    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });

    noteService.searchNotes.mockRejectedValue({});
    fireEvent.change(searchInput, { target: { value: 'FailQuery2' } });
    await waitFor(() => {
      expect(screen.getByText('Failed to search notes')).toBeInTheDocument();
    });
  });

  test('handles category tab filters (pinned and archived)', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Pinned Note')).toBeInTheDocument();
    });

    const pinnedTab = screen.getByRole('button', { name: /^pinned$/i });
    fireEvent.click(pinnedTab);
    expect(screen.getByText('First Pinned Note')).toBeInTheDocument();
    expect(screen.queryByText('Second Note')).not.toBeInTheDocument();

    const archivedTab = screen.getByRole('button', { name: /^archived$/i });
    fireEvent.click(archivedTab);
    expect(screen.getByText('Archived Note')).toBeInTheDocument();
    expect(screen.queryByText('First Pinned Note')).not.toBeInTheDocument();
  });

  test('handles sorting notes by newest, oldest, az, and za', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('First Pinned Note')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('Sort Notes');

    fireEvent.change(sortSelect, { target: { value: 'newest' } });
    expect(sortSelect.value).toBe('newest');

    fireEvent.change(sortSelect, { target: { value: 'oldest' } });
    expect(sortSelect.value).toBe('oldest');

    fireEvent.change(sortSelect, { target: { value: 'az' } });
    expect(sortSelect.value).toBe('az');

    fireEvent.change(sortSelect, { target: { value: 'za' } });
    expect(sortSelect.value).toBe('za');
  });

  test('handles pin, unarchive/archive toggle, download, and delete actions with error handling', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);
    noteService.togglePin.mockResolvedValue({});
    noteService.toggleArchive.mockResolvedValue({});
    noteService.deleteNote.mockResolvedValue({});

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const pinButtons = screen.getAllByTitle(/pin note|unpin note/i);
    fireEvent.click(pinButtons[1]);
    await waitFor(() => {
      expect(noteService.togglePin).toHaveBeenCalledWith(2);
    });

    const archiveButtons = screen.getAllByTitle(/archive|unarchive/i);
    fireEvent.click(archiveButtons[1]);
    await waitFor(() => {
      expect(noteService.toggleArchive).toHaveBeenCalledWith(2);
    });

    const downloadButtons = screen.getAllByTitle('Download Note (.txt)');
    fireEvent.click(downloadButtons[0]);

    const deleteButtons = screen.getAllByTitle('Delete Note');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(noteService.deleteNote).toHaveBeenCalledWith(1);
    });
  });

  test('handles errors on togglePin, toggleArchive, and deleteNote', async () => {
    noteService.getNotes.mockResolvedValue(mockNotes);
    
    noteService.togglePin.mockRejectedValueOnce({});
    noteService.deleteNote.mockRejectedValueOnce({});
    noteService.toggleArchive.mockRejectedValueOnce({});

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });

    const pinButtons = screen.getAllByTitle(/pin note|unpin note/i);
    fireEvent.click(pinButtons[1]);
    await waitFor(() => {
      expect(screen.getByText(/Failed to (update note pin status|pin note)/i)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete Note');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete note/i)).toBeInTheDocument();
    });

    const archiveButtons = screen.getAllByTitle(/archive|unarchive/i);
    fireEvent.click(archiveButtons[1]);
    await waitFor(() => {
      expect(screen.getByText(/Failed to (update note archive status|archive note)/i)).toBeInTheDocument();
    });
  });

  test('opens create modal, and saves successfully', async () => {
    noteService.getNotes.mockResolvedValue([]);
    noteService.createNote.mockResolvedValue({ id: 10 });
    noteService.togglePin.mockResolvedValue({});
    noteService.toggleArchive.mockResolvedValue({});

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No notes found.')).toBeInTheDocument();
    });

    const createButton = screen.getAllByRole('button', { name: /create note/i })[0];
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getAllByText('Create Note').length).toBeGreaterThan(0);
    });

    const titleInput = screen.getByPlaceholderText('Note title');
    fireEvent.change(titleInput, { target: { value: 'Brand New Note' } });

    const editor = screen.getByTestId('mock-quill-editor');
    fireEvent.change(editor, { target: { value: 'Brand New Content' } });

    const pinCheckbox = screen.getByLabelText(/pin note/i);
    fireEvent.click(pinCheckbox);

    const archiveCheckbox = screen.getByLabelText(/archive note/i);
    fireEvent.click(archiveCheckbox);

    const saveButton = screen.getByRole('button', { name: /save note/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(noteService.createNote).toHaveBeenCalled();
    });
  });
});