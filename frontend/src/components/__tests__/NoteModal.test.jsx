import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NoteModal } from '../../components/NoteModal';

const mockGetEditor = {
  history: {
    undo: jest.fn(),
    redo: jest.fn(),
  },
};

jest.mock('react-quill-new', () => {
  const ReactMock = require('react');
  return {
    __esModule: true,
    default: ReactMock.forwardRef(({ defaultValue, onChange, placeholder }, ref) => {
      ReactMock.useImperativeHandle(ref, () => ({
        getEditor: () => mockGetEditor,
      }));

      return (
        <textarea
          data-testid="mock-quill-editor"
          defaultValue={defaultValue || ''}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
        />
      );
    }),
  };
});

describe('NoteModal Component Comprehensive Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    initialData: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(<NoteModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders correctly with initialData using content, body, or description properties and handles colors/pins/archives', () => {
    const { rerender } = render(
      <NoteModal 
        {...defaultProps} 
        initialData={{ id: 1, title: 'T1', content: 'C1', color: '#ffffff', is_pinned: true, is_archived: false }} 
      />
    );
    expect(screen.getByDisplayValue('C1')).toBeInTheDocument();

    rerender(
      <NoteModal 
        {...defaultProps} 
        initialData={{ id: 2, title: 'T2', body: 'B1', color: '#123456', is_pinned: false, is_archived: true }} 
      />
    );
    expect(screen.getByDisplayValue('B1')).toBeInTheDocument();

    rerender(
      <NoteModal 
        {...defaultProps} 
        initialData={{ id: 3, title: 'T3', description: 'D1' }} 
      />
    );
    expect(screen.getByDisplayValue('D1')).toBeInTheDocument();

    rerender(
      <NoteModal 
        {...defaultProps} 
        initialData={{ id: 4 }} 
      />
    );
    expect(screen.getByPlaceholderText('Note title')).toHaveValue('');
    expect(screen.getByTestId('mock-quill-editor')).toHaveValue('');
  });

  test('handles input changes for title, content, color buttons, and form submission', async () => {
    const onSave = jest.fn().mockResolvedValue({});
    const onClose = jest.fn();
    
    render(<NoteModal {...defaultProps} onSave={onSave} onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText('Note title');
    fireEvent.change(titleInput, { target: { value: 'New Test Title' } });
    expect(titleInput.value).toBe('New Test Title');

    const editor = screen.getByTestId('mock-quill-editor');
    fireEvent.change(editor, { target: { value: 'New Test Content' } });
    expect(editor.value).toBe('New Test Content');

    const colorButtons = document.querySelectorAll('button[style*="background"]');
    if (colorButtons.length > 0) {
      fireEvent.click(colorButtons[0]);
    }

    const saveButton = screen.getByRole('button', { name: /saving\.\.\.|save note/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Title',
          content: 'New Test Content',
          is_pinned: false,
          is_archived: false,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('shows validation error when title and content are both empty or set to empty quill tags', () => {
    const onSave = jest.fn();
    render(<NoteModal {...defaultProps} onSave={onSave} />);

    const editor = screen.getByTestId('mock-quill-editor');
    fireEvent.change(editor, { target: { value: '<p><br></p>' } });

    const saveButton = screen.getByRole('button', { name: /saving\.\.\.|save note/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Note must have a title or content before saving.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test('handles undo and redo toolbar action triggers via ref', () => {
    render(<NoteModal {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    if (buttons.length > 2) {
      fireEvent.click(buttons[1]);
      fireEvent.click(buttons[2]);
    }

    expect(mockGetEditor.history.undo).toHaveBeenCalled();
    expect(mockGetEditor.history.redo).toHaveBeenCalled();
  });

  test('handles pin and archive mutual exclusivity checkboxes', () => {
    render(<NoteModal {...defaultProps} />);

    const pinCheckbox = screen.getByLabelText(/pin note/i);
    const archiveCheckbox = screen.getByLabelText(/archive note/i);

    fireEvent.click(pinCheckbox);
    expect(pinCheckbox).toBeChecked();
    expect(archiveCheckbox).not.toBeChecked();

    fireEvent.click(archiveCheckbox);
    expect(archiveCheckbox).toBeChecked();
    expect(pinCheckbox).not.toBeChecked();
  });

  test('calls onClose when cancel or close button is clicked', () => {
    const onClose = jest.fn();
    render(<NoteModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeIconButton = screen.getByTitle(/close/i);
    fireEvent.click(closeIconButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('handles network or server error during submission', async () => {
    const onSave = jest.fn().mockRejectedValue({
      response: { data: { message: 'Server validation failed' } },
    });

    render(<NoteModal {...defaultProps} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText('Note title');
    fireEvent.change(titleInput, { target: { value: 'Error Test' } });

    const saveButton = screen.getByRole('button', { name: /saving\.\.\.|save note/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Server validation failed')).toBeInTheDocument();
    });
  });

  test('handles generic network error without response object', async () => {
    const onSave = jest.fn().mockRejectedValue({});

    render(<NoteModal {...defaultProps} onSave={onSave} />);

    const titleInput = screen.getByPlaceholderText('Note title');
    fireEvent.change(titleInput, { target: { value: 'Network Error Test' } });

    const saveButton = screen.getByRole('button', { name: /saving\.\.\.|save note/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Network error: Unable to connect to the server. Please check your connection.')
      ).toBeInTheDocument();
    });
  });
});

test('shows generic save error when server error has no message', async () => {
  const onSave = jest.fn().mockRejectedValue({ response: { data: {} } });
  render(<NoteModal isOpen={true} onClose={jest.fn()} onSave={onSave} initialData={null} />);

  fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'Test' } });
  fireEvent.click(screen.getByRole('button', { name: /save note/i }));

  try {
    await screen.findByText('Failed to save note. Please try again.');
  } catch (error) {
    throw new Error(`Expected fallback error message was not found: ${error.message}`);
  }
});

test('unchecking Archive does not touch pinned state', async () => {
  render(
    <NoteModal
      isOpen={true}
      onClose={jest.fn()}
      onSave={jest.fn()}
      initialData={{ id: 1, title: 'Archived Note', content: 'x', is_pinned: false, is_archived: true }}
    />
  );
  const archiveCheckbox = screen.getByLabelText(/archive note/i);
  expect(archiveCheckbox).toBeChecked();

  fireEvent.click(archiveCheckbox); // unchecking
  expect(archiveCheckbox).not.toBeChecked();
  expect(screen.getByLabelText(/pin note/i)).not.toBeChecked();
});