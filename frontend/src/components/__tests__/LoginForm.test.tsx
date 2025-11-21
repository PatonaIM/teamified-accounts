import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import * as authService from '../../services/authService';

// Mock the authentication service
vi.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper component to provide router context
const LoginFormWrapper = () => (
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
);

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

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
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('should show error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('should show error for password too short', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test');
      
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('should handle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      expect(rememberMeCheckbox).not.toBeChecked();
      
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();
      
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('should update form state on input changes', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Form Submission', () => {
    it('should successfully submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockLoginResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: { id: '1', email: 'test@example.com', role: 'user' }
      };
      
      mockedAuthService.login.mockResolvedValueOnce(mockLoginResponse);
      
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockedAuthService.login.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          accessToken: 'token',
          refreshToken: 'refresh',
          user: { id: '1', email: 'test@example.com', role: 'user' }
        }), 100))
      );
      
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle login failure and show error message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      
      mockedAuthService.login.mockRejectedValueOnce(new Error(errorMessage));
      
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
      
      expect(submitButton).not.toBeDisabled();
    });

    it('should include remember me state in login request', async () => {
      const user = userEvent.setup();
      const mockLoginResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: { id: '1', email: 'test@example.com', role: 'user' }
      };
      
      mockedAuthService.login.mockResolvedValueOnce(mockLoginResponse);
      
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);
      await user.click(submitButton);
      
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and descriptions', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      // Trigger validation errors to test aria-describedby
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
    });

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<LoginFormWrapper />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      const emailError = screen.getByText(/email is required/i);
      expect(emailError).toHaveAttribute('role', 'alert');
    });

    it('should support keyboard navigation', () => {
      render(<LoginFormWrapper />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Test that elements are focusable
      emailInput.focus();
      expect(emailInput).toHaveFocus();
      
      passwordInput.focus();
      expect(passwordInput).toHaveFocus();
      
      submitButton.focus();
      expect(submitButton).toHaveFocus();
    });
  });
});
