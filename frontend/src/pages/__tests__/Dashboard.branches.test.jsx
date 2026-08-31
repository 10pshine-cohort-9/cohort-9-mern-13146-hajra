
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

const editNote = async (title) => {
  const editButtons = screen.getAllByTitle('Edit Note');
  const cards = screen.getAllByRole('heading', { level: 3 });
  const idx = cards.findIndex((h) => h.textContent === title);
  fireEvent.click(editButtons[idx]);
  await waitFor(() => expect(screen.getByText('Edit Note')).toBeInTheDocument());
};

const saveModal = () => {
  fireEvent.click(screen.getByRole('button', { name: /save note/i }));
};

describe('Dashboard - fetch/search response shape branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('handles getNotes returning { notes: [...] } wrapper shape', async () => {
    noteService.getNotes.mockResolvedValue({
      notes: [{ id: 1, title: 'Wrapped Note', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' }],
    });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Wrapped Note')).toBeInTheDocument());
  });

  test('handles searchNotes returning { notes: [...] } wrapper shape', async () => {
    noteService.getNotes.mockResolvedValue([]);
    noteService.searchNotes.mockResolvedValue({
      notes: [{ id: 2, title: 'Found Via Search', content: 'x', is_pinned: 0, is_archived: 0 }],
    });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/search notes by title or content/i), {
      target: { value: 'Found' },
    });
    await waitFor(() => expect(screen.getByText('Found Via Search')).toBeInTheDocument());
  });
});

describe('Dashboard - handleSaveNote create branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    noteService.getNotes.mockResolvedValue([]);
  });

  const openCreateModal = async () => {
    fireEvent.click(screen.getAllByRole('button', { name: /create note/i })[0]);
    await waitFor(() => expect(screen.getAllByText('Create Note').length).toBeGreaterThan(0));
    fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'New Note' } });
  };

  test('create with only pin checked calls togglePin but not toggleArchive', async () => {
    noteService.createNote.mockResolvedValue({ id: 100 });
    render(<Dashboard />);
    await openCreateModal();
    fireEvent.click(screen.getByLabelText(/pin note/i));
    saveModal();
    await waitFor(() => expect(noteService.togglePin).toHaveBeenCalledWith(100));
    expect(noteService.toggleArchive).not.toHaveBeenCalled();
  });

  test('create with only archive checked calls toggleArchive but not togglePin', async () => {
    noteService.createNote.mockResolvedValue({ id: 101 });
    render(<Dashboard />);
    await openCreateModal();
    fireEvent.click(screen.getByLabelText(/archive note/i));
    saveModal();
    await waitFor(() => expect(noteService.toggleArchive).toHaveBeenCalledWith(101));
    expect(noteService.togglePin).not.toHaveBeenCalled();
  });

  test('create with neither checked calls no toggle endpoints', async () => {
    noteService.createNote.mockResolvedValue({ id: 102 });
    render(<Dashboard />);
    await openCreateModal();
    saveModal();
    await waitFor(() => expect(noteService.createNote).toHaveBeenCalled());
    expect(noteService.togglePin).not.toHaveBeenCalled();
    expect(noteService.toggleArchive).not.toHaveBeenCalled();
  });

  test('falls back to raw id when createNote resolves a bare id instead of an object', async () => {
    noteService.createNote.mockResolvedValue(55); // no .id property
    render(<Dashboard />);
    await openCreateModal();
    fireEvent.click(screen.getByLabelText(/pin note/i));
    saveModal();
    await waitFor(() => expect(noteService.togglePin).toHaveBeenCalledWith(55));
  });
});

describe('Dashboard - handleSaveNote edit branches', () => {
  const mockNotes = [
    { id: 1, title: 'Pinned Item', content: 'c1', is_pinned: 1, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Plain Item', content: 'c2', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    noteService.getNotes.mockResolvedValue(mockNotes);
    noteService.updateNote.mockResolvedValue({});
  });

  test('unchanged pin/archive state triggers no toggle calls on edit', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Plain Item')).toBeInTheDocument());
    await editNote('Plain Item');
    saveModal();
    await waitFor(() => expect(noteService.updateNote).toHaveBeenCalledWith(2, { title: 'Plain Item', content: 'c2' }));
    expect(noteService.togglePin).not.toHaveBeenCalled();
    expect(noteService.toggleArchive).not.toHaveBeenCalled();
  });

  test('checking pin on a previously unpinned note calls togglePin', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Plain Item')).toBeInTheDocument());
    await editNote('Plain Item');
    fireEvent.click(screen.getByLabelText(/pin note/i));
    saveModal();
    await waitFor(() => expect(noteService.togglePin).toHaveBeenCalledWith(2));
    expect(noteService.toggleArchive).not.toHaveBeenCalled();
  });

  test('unchecking pin on an already-pinned note calls togglePin', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Pinned Item')).toBeInTheDocument());
    await editNote('Pinned Item');
    const pinCheckbox = screen.getByLabelText(/pin note/i);
    expect(pinCheckbox).toBeChecked();
    fireEvent.click(pinCheckbox); // uncheck
    saveModal();
    await waitFor(() => expect(noteService.togglePin).toHaveBeenCalledWith(1));
  });

  test('checking archive on edit calls toggleArchive only', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Plain Item')).toBeInTheDocument());
    await editNote('Plain Item');
    fireEvent.click(screen.getByLabelText(/archive note/i));
    saveModal();
    await waitFor(() => expect(noteService.toggleArchive).toHaveBeenCalledWith(2));
    expect(noteService.togglePin).not.toHaveBeenCalled();
  });

 test('toggleArchive failure during edit surfaces an error message', async () => {
  noteService.toggleArchive.mockRejectedValueOnce({
    response: { data: { message: 'Archive toggle failed' } },
  });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Plain Item')).toBeInTheDocument());
  await editNote('Plain Item');
  fireEvent.click(screen.getByLabelText(/archive note/i));
  saveModal();
  await screen.findByText('Archive toggle failed');
});
});

describe('Dashboard - pinned+archived combined filter branch', () => {
  test('a note that is both pinned and archived shows in Archived tab, not Pinned tab, and not in All tab', async () => {
    noteService.getNotes.mockResolvedValue([
      { id: 5, title: 'Both Flags Note', content: 'x', is_pinned: 1, is_archived: 1, updated_at: '2026-06-01T10:00:00Z' },
      { id: 6, title: 'Pinned Only Note', content: 'x', is_pinned: 1, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    ]);
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText('Pinned Only Note')).toBeInTheDocument());

    expect(screen.queryByText('Both Flags Note')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^pinned$/i }));
    expect(screen.getByText('Pinned Only Note')).toBeInTheDocument();
    expect(screen.queryByText('Both Flags Note')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^archived$/i }));
    expect(screen.getByText('Both Flags Note')).toBeInTheDocument();
    expect(screen.queryByText('Pinned Only Note')).not.toBeInTheDocument();
  });
});

describe('Dashboard - sort comparator branches actually reorder notes', () => {
  const notes = [
    { id: 1, title: 'Banana', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Apple', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-03T10:00:00Z' },
    { id: 3, title: 'Cherry', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ];

  const getTitlesInOrder = () =>
    screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

  beforeEach(() => {
    jest.clearAllMocks();
    noteService.getNotes.mockResolvedValue(notes);
  });

  test('sorts alphabetically A-Z', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Sort Notes'), { target: { value: 'az' } });
    await waitFor(() => expect(getTitlesInOrder()).toEqual(['Apple', 'Banana', 'Cherry']));
  });

  test('sorts alphabetically Z-A', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Sort Notes'), { target: { value: 'za' } });
    await waitFor(() => expect(getTitlesInOrder()).toEqual(['Cherry', 'Banana', 'Apple']));
  });

  test('sorts newest to oldest by updated_at', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Sort Notes'), { target: { value: 'newest' } });
    await waitFor(() => expect(getTitlesInOrder()).toEqual(['Apple', 'Cherry', 'Banana']));
  });

  test('sorts oldest to newest by updated_at', async () => {
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    fireEvent.change(screen.getByDisplayValue('Sort Notes'), { target: { value: 'oldest' } });
    await waitFor(() => expect(getTitlesInOrder()).toEqual(['Banana', 'Cherry', 'Apple']));
  });
});

describe('Dashboard - handleDownloadNote fallback branches', () => {
  let capturedAnchor = null;
  const realCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    capturedAnchor = null;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreateElement(tag);
      if (tag === 'a') capturedAnchor = el;
      return el;
    });
  });

  afterEach(() => {
    document.createElement.mockRestore();
  });

  test('uses "Untitled Note" filename fallback when title is empty', async () => {
    noteService.getNotes.mockResolvedValue([
      { id: 9, title: '', content: '', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    ]);

    render(<Dashboard />);
    await waitFor(() => expect(screen.getByTitle('Download Note (.txt)')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Download Note (.txt)'));

    expect(capturedAnchor.download).toBe('untitled_note.txt');
  });
});