import React from 'react';
import { render, screen } from '@testing-library/react';
import Input from '../Input';

describe('Input Component', () => {
  it('renders correctly with default optional props', () => {
    render(<Input id="test-input" name="testInput" placeholder="Enter text" />);
    
    const inputElement = screen.getByPlaceholderText(/enter text/i);
    expect(inputElement).toBeInTheDocument();
  });

  it('applies custom classes and props correctly', () => {
    render(
      <Input 
        id="email" 
        type="email" 
        placeholder="Email address"
        className="custom-input" 
        containerClassName="custom-container" 
      />
    );
    const inputElement = screen.getByPlaceholderText(/email address/i);
    expect(inputElement).toHaveAttribute('type', 'email');
    expect(inputElement).toHaveClass('custom-input');
  });
});