import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from '../App';

jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn().mockResolvedValue({ success: false }),
    login: jest.fn(),
    register: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

jest.mock('react-quill-new', () => ({
  __esModule: true,
  default: () => null,
}));

describe('App', () => {
  it('renders the application shell without crashing', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.innerHTML.length).toBeGreaterThan(0);
    });
  });
});