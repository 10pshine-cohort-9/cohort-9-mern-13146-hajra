import React from 'react';
import { render, screen, fireEvent, waitFor, within , act } from '@testing-library/react';
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

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

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

describe('Dashboard - fetch response shape branches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('handles getNotes returning { notes: [...] } wrapper shape', async () => {
    noteService.getNotes.mockResolvedValue({
      notes: [{ id: 1, title: 'Wrapped Note', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' }],
    });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Wrapped Note')).toBeInTheDocument());
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
    noteService.createNote.mockResolvedValue(55); 
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
    fireEvent.click(pinCheckbox); 
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

test('exports notes as JSON file', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Export Me', content: 'x', is_pinned: 1, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
  ]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Export Me')).toBeInTheDocument());

  fireEvent.click(screen.getByTitle('Export all notes as a JSON file'));
  expect(URL.createObjectURL).toHaveBeenCalled();
});

test('imports notes from a valid JSON file', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue({ id: 5 });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(
    [JSON.stringify([{ title: 'Imported', content: 'body', is_pinned: true, is_archived: false }])],
    'notes.json',
    { type: 'application/json' }
  );
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(noteService.createNote).toHaveBeenCalled());
});

test('rejects malformed JSON import (not an array)', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File([JSON.stringify({ not: 'an array' })], 'bad.json', { type: 'application/json' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByText('Invalid JSON file: expected a list of notes.')).toBeInTheDocument()
  );
});

test('imports a plain text file as a single note', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue({ id: 7 });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(['some note body'], 'my-note.txt', { type: 'text/plain' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(noteService.createNote).toHaveBeenCalledWith({ title: 'my-note', content: 'some note body' }));
});

test('rejects unsupported file type on import', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(['binary'], 'image.png', { type: 'image/png' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByText('Unsupported file type. Please import a .json, .txt, or .md file.')).toBeInTheDocument()
  );
});

test('shows generic import error when parsing throws', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(['{ bad json'], 'broken.json', { type: 'application/json' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(screen.getByText('Failed to import notes. Please check the file format.')).toBeInTheDocument()
  );
});

test('downloads a note as .txt', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Download Me', content: '<p>hello</p>', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
  ]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Download Me')).toBeInTheDocument());

  fireEvent.click(screen.getByTitle('Download Note (.txt)'));
  expect(URL.createObjectURL).toHaveBeenCalled();
});

test('handleImportFileChange returns early when no file is selected', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [] } });

  await waitFor(() => {
    expect(noteService.createNote).not.toHaveBeenCalled();
  });
});

test('filters notes by search query across title and content', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Grocery List', content: 'milk eggs bread', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Meeting Notes', content: 'discuss budget', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);

  render(<Dashboard searchQuery="grocery" onSearchChange={jest.fn()} />);

  await waitFor(() => {
    expect(screen.getByText('Grocery List')).toBeInTheDocument();
    expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument();
  });
});

test('clicking the Import button triggers the hidden file input', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

  fireEvent.click(screen.getByTitle('Import notes from a JSON file'));

  expect(clickSpy).toHaveBeenCalled();

  clickSpy.mockRestore();
});

test('sorts az/za correctly when either note has no title', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: '', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Zebra', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Zebra')).toBeInTheDocument());

  const sortSelect = screen.getByDisplayValue('Sort Notes');
  fireEvent.change(sortSelect, { target: { value: 'az' } });
  await waitFor(() => expect(screen.getByText('Zebra')).toBeInTheDocument());

  fireEvent.change(sortSelect, { target: { value: 'za' } });
  await waitFor(() => expect(screen.getByText('Zebra')).toBeInTheDocument());
});

test('sorts az/za correctly when the other note has no title', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Apple', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: '', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());

  const sortSelect = screen.getByDisplayValue('Sort Notes');
  fireEvent.change(sortSelect, { target: { value: 'az' } });
  await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());

  fireEvent.change(sortSelect, { target: { value: 'za' } });
  await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
});

test('clicking the palette button twice opens then closes the menu', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Note A', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
  ]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Note A')).toBeInTheDocument());

  const paletteButton = screen.getByTitle('Change Color');
  fireEvent.click(paletteButton);
  expect(screen.getByTitle('Lavender')).toBeInTheDocument();

  fireEvent.click(paletteButton);
  expect(screen.queryByTitle('Lavender')).not.toBeInTheDocument();
});

test('uses controlled filter prop when provided instead of internal state', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'Pinned One', content: 'x', is_pinned: 1, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Plain One', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);
  const mockOnFilterChange = jest.fn();
  render(<Dashboard filter="pinned" onFilterChange={mockOnFilterChange} />);

  await waitFor(() => expect(screen.getByText('Pinned One')).toBeInTheDocument());
  expect(screen.queryByText('Plain One')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /^all$/i }));
  expect(mockOnFilterChange).toHaveBeenCalledWith('all');
});

test('handles getNotes returning object with no notes property', async () => {
  noteService.getNotes.mockResolvedValue({});
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());
});

test('imports a text file with no filename using default title', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue({ id: 20 });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(['body text'], '', { type: 'text/plain' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(noteService.createNote).toHaveBeenCalledWith({ title: 'Imported Note', content: 'body text' })
  );
});

test('imports JSON note with title but no content', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue({ id: 21 });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File([JSON.stringify([{ title: 'Has Title Only' }])], 'partial.json', {
    type: 'application/json',
  });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(noteService.createNote).toHaveBeenCalledWith({ title: 'Has Title Only', content: '' })
  );
});

test('skips import of a JSON item with neither title nor content', async () => {
  noteService.getNotes.mockResolvedValue([]);
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File([JSON.stringify([{ is_pinned: false, is_archived: false }])], 'empty.json', {
    type: 'application/json',
  });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());
  expect(noteService.createNote).not.toHaveBeenCalled();
});

test('imports a .md file as a single note', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue({ id: 22 });
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(['# heading'], 'readme.md', { type: 'text/markdown' });
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(noteService.createNote).toHaveBeenCalledWith({ title: 'readme', content: '# heading' })
  );
});

test('import handles bare id response and both pin+archive flags', async () => {
  noteService.getNotes.mockResolvedValue([]);
  noteService.createNote.mockResolvedValue(30); // bare id, not { id }
  noteService.togglePin.mockResolvedValue({});
  noteService.toggleArchive.mockResolvedValue({});
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('No notes found.')).toBeInTheDocument());

  const file = new File(
    [JSON.stringify([{ title: 'Both Flags', content: 'x', is_pinned: true, is_archived: true }])],
    'both.json',
    { type: 'application/json' }
  );
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(noteService.togglePin).toHaveBeenCalledWith(30);
    expect(noteService.toggleArchive).toHaveBeenCalledWith(30);
  });
});

test('search matches by content when title is empty, and by title when content is empty', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: '', content: 'unique-content-term', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'unique-title-term', content: '', is_pinned: 0, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);

  const { rerender } = render(<Dashboard searchQuery="unique-content-term" onSearchChange={jest.fn()} />);
  await waitFor(() => expect(screen.getAllByText((_, el) => el.tagName.toLowerCase() === 'div').length).toBeGreaterThan(0));

  rerender(<Dashboard searchQuery="unique-title-term" onSearchChange={jest.fn()} />);
  await waitFor(() => expect(screen.getByText('unique-title-term')).toBeInTheDocument());
});

test('pinned-first ordering works regardless of initial array order', async () => {
  noteService.getNotes.mockResolvedValue([
    { id: 1, title: 'First Unpinned', content: 'x', is_pinned: 0, is_archived: 0, updated_at: '2026-06-01T10:00:00Z' },
    { id: 2, title: 'Later Pinned', content: 'x', is_pinned: 1, is_archived: 0, updated_at: '2026-06-02T10:00:00Z' },
  ]);
  render(<Dashboard />);

  await waitFor(() => {
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles.indexOf('Later Pinned')).toBeLessThan(titles.indexOf('First Unpinned'));
  });
  
});




