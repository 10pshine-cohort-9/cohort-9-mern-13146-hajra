
import { useState, useEffect, useCallback ,useRef } from 'react';
import { noteService } from '../services/noteService';
import { NoteModal } from '../components/NoteModal';

import DOMPurify from 'dompurify';

import { 
  FiPlus, 
  FiArchive, 
  FiEdit2, 
  FiTrash2, 
  FiRotateCcw,
  FiDownload,
    FiUpload 
} from 'react-icons/fi';
import { MdPalette, MdCheck, MdPushPin } from 'react-icons/md';

const THEMED_PASTEL_PALETTES = [
  { name: 'Lavender', bg: 'bg-[#7C77C6]/10', border: 'border-[#7C77C6]/30', text: 'text-[#7C77C6]' },
  { name: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  { name: 'Indigo', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  { name: 'Violet', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
  { name: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  { name: 'Sky', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600' },
  { name: 'Slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' },
  { name: 'Zinc', bg: 'bg-zinc-100', border: 'border-zinc-200', text: 'text-zinc-600' }
];

export function Dashboard({ searchQuery = '', filter: filterProp, onFilterChange }) {
    const [notes, setNotes] = useState([]);
  const [internalFilter, setInternalFilter] = useState('all');
  const filter = filterProp !== undefined ? filterProp : internalFilter;
  const handleFilterChange = onFilterChange || setInternalFilter;
  const [sortOrder, setSortOrder] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [error, setError] = useState('');
  const [noteColors, setNoteColors] = useState({});
  const [activePaletteMenu, setActivePaletteMenu] = useState(null);

const fetchNotes = useCallback(async () => {
    try {
      setError('');
      const data = await noteService.getNotes();
      const fetchedNotes = Array.isArray(data) ? data : data.notes || [];
      setNotes(fetchedNotes);

      setNoteColors((prevColors) => {
        const updatedColors = { ...prevColors };
        fetchedNotes.forEach((note, index) => {
          if (updatedColors[note.id] === undefined) {
            updatedColors[note.id] = index % THEMED_PASTEL_PALETTES.length;
          }
        });
        return updatedColors;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);


const handleSaveNote = async (noteData) => {
  const { id, title, content, is_pinned, is_archived } = noteData;

  if (id) {
    await noteService.updateNote(id, { title, content });

    const wasPinned = selectedNote?.is_pinned === 1 || selectedNote?.is_pinned === true;
    if (Boolean(is_pinned) !== wasPinned) {
      await noteService.togglePin(id);
    }

    const wasArchived = selectedNote?.is_archived === 1 || selectedNote?.is_archived === true;
    if (Boolean(is_archived) !== wasArchived) {
      await noteService.toggleArchive(id);
    }
  } else {
    const savedNote = await noteService.createNote({ title, content });
    const newNoteId = savedNote.id || savedNote;

    if (is_pinned) await noteService.togglePin(newNoteId);
    if (is_archived) await noteService.toggleArchive(newNoteId);
  }

  if (is_archived) handleFilterChange('archived');
  else if (is_pinned) handleFilterChange('pinned');

  await fetchNotes();
};

const runNoteAction = async (action, fallbackMsg) => {
  try {
    setError('');
    await action();
    fetchNotes();
  } catch (err) {
    setError(err.response?.data?.message || fallbackMsg);
  }
};

const handleDelete = (id) =>
  runNoteAction(() => noteService.deleteNote(id), 'Failed to delete note');

const handleTogglePin = (id) =>
  runNoteAction(() => noteService.togglePin(id), 'Failed to update note pin status');

const handleToggleArchive = (id) =>
  runNoteAction(() => noteService.toggleArchive(id), 'Failed to update note archive status');

  const downloadAsFile = (content, filename, mimeType) => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(file);

  element.href = objectUrl;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  URL.revokeObjectURL(objectUrl);
};

const handleDownloadNote = (note) => {
  const rawTitle = note.title ? note.title.trim() : '';
  const fileTitle = rawTitle !== '' ? rawTitle : 'Untitled Note';

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = note.content || '';
  const plainTextContent = tempDiv.textContent || tempDiv.innerText || '';

  const fileContent = `Title: ${fileTitle}\n\n${plainTextContent}`;
  const filename = `${fileTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;

  downloadAsFile(fileContent, filename, 'text/plain;charset=utf-8');
};

 const handleExportNotes = () => {
  const exportData = notes.map(({ title, content, is_pinned, is_archived }) => ({
    title,
    content,
    is_pinned: !!is_pinned,
    is_archived: !!is_archived,
  }));

  const fileContent = JSON.stringify(exportData, null, 2);
  const filename = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;

  downloadAsFile(fileContent, filename, 'application/json');
};

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleImportFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setError('');
    const text = await file.text();
    const fileName = file.name || '';
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';

    let notesToImport = [];

    if (extension === 'json') {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setError('Invalid JSON file: expected a list of notes.');
        return;
      }
      notesToImport = parsed.map((item) => ({
        title: item.title || '',
        content: item.content || '',
        is_pinned: !!item.is_pinned,
        is_archived: !!item.is_archived,
      }));
    } else if (extension === 'txt' || extension === 'md' || file.type.startsWith('text/')) {
      const titleFromFilename = fileName.replace(/\.[^/.]+$/, '') || 'Imported Note';
      notesToImport = [
        {
          title: titleFromFilename,
          content: text,
          is_pinned: false,
          is_archived: false,
        },
      ];
    } else {
      setError('Unsupported file type. Please import a .json, .txt, or .md file.');
      return;
    }

    for (const item of notesToImport) {
      if (!item.title && !item.content) continue; 
      const created = await noteService.createNote({
        title: item.title,
        content: item.content,
      });
      const newId = created.id || created;
      if (item.is_pinned) await noteService.togglePin(newId);
      if (item.is_archived) await noteService.toggleArchive(newId);
    }

    await fetchNotes();
  } catch (err) {
    setError('Failed to import notes. Please check the file format.');
  } finally {
    e.target.value = ''; 
  }
};

  const fileInputRef = useRef(null);
const categoryFiltered = notes.filter((note) => {
    const isArchived = note.is_archived === 1 || note.is_archived === true;
    const isPinned = note.is_pinned === 1 || note.is_pinned === true;

    if (filter === 'pinned') return isPinned && !isArchived;
    if (filter === 'archived') return isArchived;
    return !isArchived;
  });

  const searchedAndFiltered = searchQuery.trim()
  ? notes.filter((note) => {
      const query = searchQuery.toLowerCase();
      const titleMatch = (note.title || '').toLowerCase().includes(query);
      const contentMatch = (note.content || '').toLowerCase().includes(query);
      return titleMatch || contentMatch;
    })
  : categoryFiltered;

  const filteredNotes = [...searchedAndFiltered].sort((a, b) => {
    const aPinned = a.is_pinned === 1 || a.is_pinned === true;
    const bPinned = b.is_pinned === 1 || b.is_pinned === true;

    if (aPinned !== bPinned) return aPinned ? -1 : 1; // pinned first, regardless of tab

    if (sortOrder === 'newest') {
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    }
    if (sortOrder === 'oldest') {
      return new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at);
    }
    if (sortOrder === 'az') return (a.title || '').localeCompare(b.title || '');
    if (sortOrder === 'za') return (b.title || '').localeCompare(a.title || '');
    return 0;
  });

  const changeNoteColor = (noteId, paletteIndex) => {
    setNoteColors((prev) => ({ ...prev, [noteId]: paletteIndex }));
    setActivePaletteMenu(null);
  };

  return (
    <div className="w-full pl-3 pr-2">
      
      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-base text-red-700 shadow-sm">{error}</div>}

 <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
  <div className="flex flex-wrap items-center gap-4">
    <div className="flex flex-wrap gap-2.5">
          {['all', 'pinned', 'archived'].map((tab) => (
        <button
          key={tab}
          onClick={() => handleFilterChange(tab)}
          style={filter === tab ? { backgroundColor: '#7C77C6' } : {}}
          className={`rounded-xl px-5 py-2.5 text-base font-semibold capitalize transition-all ${
            filter === tab
              ? 'text-white shadow-md'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="rounded-xl border border-gray-200 px-4.5 py-2.5 text-base font-semibold bg-gray-50 text-gray-700 focus:outline-none focus:border-[#7C77C6]"
    >
      <option value="" disabled>Sort Notes</option>
      <option value="newest">Newest to Oldest</option>
      <option value="oldest">Oldest to Newest</option>
      <option value="az">Alphabetical (A-Z)</option>
      <option value="za">Alphabetical (Z-A)</option>
    </select>
  </div>

<div className="flex items-center gap-3">
 <input
  type="file"
  accept=".json,application/json,.txt,text/plain,.md,text/markdown"
  ref={fileInputRef}
  onChange={handleImportFileChange}
  className="hidden"
/>

  <button
    onClick={handleImportClick}
    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-[#7C77C6] bg-white border-2 border-[#7C77C6]/30 hover:bg-[#7C77C6]/10 transition-all shrink-0"
    title="Import notes from a JSON file"
  >
    <FiUpload className="text-xl" /> Import
  </button>

  <button
    onClick={handleExportNotes}
    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-[#7C77C6] bg-white border-2 border-[#7C77C6]/30 hover:bg-[#7C77C6]/10 transition-all shrink-0"
    title="Export all notes as a JSON file"
  >
    <FiDownload className="text-xl" /> Export
  </button>

  <button
    onClick={() => {
      setSelectedNote(null);
      setIsModalOpen(true);
    }}
    style={{ backgroundColor: '#7C77C6' }}
    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-bold text-white shadow-md hover:opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#7C77C6] focus:ring-offset-2 shrink-0"
  >
    <FiPlus className="text-xl" /> Create Note
  </button>
</div>
</div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredNotes.map((note) => {
        const colorIndex = noteColors[note.id] ;
        const currentPalette = THEMED_PASTEL_PALETTES[colorIndex % THEMED_PASTEL_PALETTES.length];

          return (
            <div
              key={note.id}
              className={`group relative flex flex-col justify-between rounded-2xl p-6 border transition-all duration-200 shadow-sm ${currentPalette.bg} ${currentPalette.border}`}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-[#6a66a6] tracking-tight line-clamp-1">{note.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`p-2 rounded-xl transition-colors shadow-sm ${
                        note.is_pinned
                          ? 'bg-[#7C77C6] text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-[#7C77C6]'
                      }`}
                      title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
                    >
                      <MdPushPin className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(note.id)}
                      className={`p-2 rounded-xl transition-colors shadow-sm ${
                        note.is_archived
                          ? 'bg-[#7C77C6] text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-[#7C77C6]'
                      }`}
                      title={note.is_archived ? 'Unarchive' : 'Archive'}
                    >
                      {note.is_archived ? <FiRotateCcw className="text-lg" /> : <FiArchive className="text-lg" />}
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setActivePaletteMenu(activePaletteMenu === note.id ? null : note.id)}
                        className="p-2 rounded-xl bg-white/80 text-gray-600 hover:bg-white hover:text-[#7C77C6] transition-colors shadow-sm"
                        title="Change Color"
                      >
                        <MdPalette className="text-lg" />
                      </button>
                      {activePaletteMenu === note.id && (
                        <div className="absolute right-0 mt-2 z-20 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 grid grid-cols-4 gap-2 w-48">
                          {THEMED_PASTEL_PALETTES.map((palette, pIdx) => (
                            <button
                              key={palette.name}
                              onClick={() => changeNoteColor(note.id, pIdx)}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform hover:scale-110 ${palette.bg} ${palette.border}`}
                              title={palette.name}
                            >
                              {colorIndex === pIdx && <MdCheck className={`text-sm ${palette.text}`} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-base text-[#6a66a6] line-clamp-4 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
/>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-xs text-purple-900 font-medium">
                  {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadNote(note)}
                    className="p-2.5 rounded-xl bg-white/80 text-[#7C77C6] hover:bg-white hover:scale-105 transition-all shadow-sm"
                    title="Download Note (.txt)"
                  >
                    <FiDownload className="text-lg" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/80 text-[#7C77C6] hover:bg-white hover:scale-105 transition-all shadow-sm"
                    title="Edit Note"
                  >
                    <FiEdit2 className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2.5 rounded-xl bg-white/80 text-rose-600 hover:bg-white hover:scale-105 transition-all shadow-sm"
                    title="Delete Note"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div 
              style={{ backgroundColor: '#7C77C620', color: '#7C77C6' }}
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 text-xl font-bold"
            >
              📝
            </div>
            <p className="text-gray-500 font-medium text-base">No notes found.</p>
            <p className="text-sm text-gray-400 mt-1">Try creating a new note or changing your search/filter.</p>
          </div>
        )}
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        initialData={selectedNote}
      />
    </div>
  );
}

export default Dashboard;