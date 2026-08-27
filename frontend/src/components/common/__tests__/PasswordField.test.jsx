import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PasswordField from '../PasswordField';

describe('PasswordField Component', () => {
  it('toggles input type between password and text when button is clicked', () => {
    const { container } = render(<PasswordField id="password" name="password" placeholder="Password" />);
    
    const inputElement = container.querySelector('input');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'password');

    const toggleButton = container.querySelector('button');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(inputElement).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(inputElement).toHaveAttribute('type', 'password');
  });
});