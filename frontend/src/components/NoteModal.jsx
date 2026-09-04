import { useState, useEffect, useRef, useMemo } from 'react';
import { MdClose } from 'react-icons/md';
import { FiCornerUpLeft, FiCornerUpRight } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import PropTypes from 'prop-types';
import 'react-quill-new/dist/quill.snow.css';

export function NoteModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(null);

  const quillRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setEditorKey(null);
      return;
    }
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || initialData.body || initialData.description || '');
      setIsPinned(initialData.is_pinned === 1 || initialData.is_pinned === true);
      setIsArchived(initialData.is_archived === 1 || initialData.is_archived === true);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsArchived(false);
    }
    setEditorKey(initialData?.id || 'new');
  }, [initialData, isOpen]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
    history: { delay: 500, maxStack: 100, userOnly: true },
  }), []);

  if (!isOpen) return null;

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isContentEmpty = !content || content === '<p><br></p>';
    
    if (!title.trim() && isContentEmpty) {
      setError('Note must have a title or content before saving.');
      return;
    }

    try {
      setIsLoading(true);
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        title,
        content,
        is_pinned: isPinned,       
        is_archived: isArchived,   
      });
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      
      if (!err.response) {
        setError('Network error: Unable to connect to the server. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Failed to save note. Please try again.');
      }
    }
  };

  const handleUndo = () => {
    quillRef.current?.getEditor()?.history.undo();
  };

  const handleRedo = () => {
    quillRef.current?.getEditor()?.history.redo();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 max-h-[90vh] and overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-purple-100 p-8 shadow-2xl border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl bg-[#7C77C6]/10 text-[#7C77C6] hover:bg-[#7C77C6]/20 transition-all shadow-sm"
          title="Close"
        >
          <MdClose className="text-2xl" />
        </button>

        <h2 className="mb-6 text-2xl font-extrabold text-[#7C77C6] pr-12">
          {initialData ? 'Edit Note' : 'Create Note'}
        </h2>

        {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-base text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
           <label htmlFor="note-title" className="block font-semibold text-[#6c67ac] mb-2 text-xl">Title</label>
<input
  id="note-title" 
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full..."
  placeholder="Note title"
/>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label  htmlFor="note-content" className="block font-semibold text-[#6c67ac] text-xl">Content</label>
             <div className="flex gap-1">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={handleUndo}
                    aria-label="Undo" 
                    className="p-2 rounded-lg bg-white border border-purple-300 text-[#7C77C6] hover:bg-purple-50 transition-colors"
                  >
                    <FiCornerUpLeft className="text-lg" />
                  </button>
                  <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    Undo
                  </span>
                </div>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={handleRedo}
                    aria-label="Redo" 
                    className="p-2 rounded-lg bg-white border border-purple-300 text-[#7C77C6] hover:bg-purple-50 transition-colors"
                  >
                    <FiCornerUpRight className="text-lg" />
                  </button>
                  <span className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    Redo
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-purple-300 note-editor">
              {editorKey !== null && (
                <ReactQuill
                  id="note-content"  
                  key={editorKey}
                  ref={quillRef}
                  theme="snow"
                  defaultValue={content}
                  onChange={setContent}
                  modules={modules}
                  placeholder="Write your note here..."
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-8 py-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => {
                  setIsPinned(e.target.checked);
                  if (e.target.checked) setIsArchived(false);
                }}
                className="h-5 w-5 rounded border-gray-300 text-[#7C77C6] focus:ring-[#7C77C6]"
              />
              <span className="text-base font-semibold text-[#7C77C6]">Pin Note</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => {
                  setIsArchived(e.target.checked);
                  if (e.target.checked) setIsPinned(false);
                }}
                className="h-5 w-5 rounded border-gray-300 text-[#7C77C6] focus:ring-[#7C77C6]"
              />
              <span className="text-base font-semibold text-[#7C77C6]">Archive Note</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-6 py-3 text-base font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#7C77C6' }}
              className="rounded-xl px-7 py-3 text-base font-bold text-white shadow-md hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    content: PropTypes.string,
    body: PropTypes.string,
    description: PropTypes.string,
    is_pinned: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    is_archived: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  }),
};

export default NoteModal;