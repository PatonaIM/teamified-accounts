import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';

// Wrapper component to provide router context
const LoginFormWrapper = () => (
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
);

describe('LoginForm Component - Basic Rendering', () => {
  describe('Form Rendering', () => {
    it('should render all form elements', () => {
      render(<LoginFormWrapper />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('should have proper form labels and placeholders', () => {
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<LoginFormWrapper />);
      
      // Check for form element by tag name instead of role
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should have proper input types', () => {
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should have required attributes', () => {
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('UI Elements', () => {
    it('should have remember me checkbox', () => {
      render(<LoginFormWrapper />);
      
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should have forgot password link', () => {
      render(<LoginFormWrapper />);
      
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.tagName).toBe('A');
    });
  });
});
