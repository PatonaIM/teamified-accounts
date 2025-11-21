import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InvitationForm from '../InvitationForm';
import invitationService from '../../services/invitationService';

// Mock the invitation service
vi.mock('../../services/invitationService', () => ({
  default: {
    getClients: vi.fn(),
    createInvitation: vi.fn(),
  },
}));

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>;

describe('InvitationForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockClients = [
    { id: '1', name: 'Client A', code: 'CA' },
    { id: '2', name: 'Client B', code: 'CB' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvitationService.getClients.mockResolvedValue(mockClients);
  });

  it('renders the form with all required fields', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Wait for clients to load
    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Check form fields
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create invitation/i })).toBeInTheDocument();
  });

  it('loads clients on mount', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(mockInvitationService.getClients).toHaveBeenCalledTimes(1);
    });

    // Check client options are populated
    await waitFor(() => {
      expect(screen.getByText('Client A (CA)')).toBeInTheDocument();
      expect(screen.getByText('Client B (CB)')).toBeInTheDocument();
    });
  });

  it('shows loading state while clients are loading', () => {
    mockInvitationService.getClients.mockImplementation(() => new Promise(() => {}));
    
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Loading clients...')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create invitation/i });
    fireEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Client selection is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email address/i);
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockCreatedInvitation = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      country: 'IN' as const,
      role: 'EOR' as const,
      clientId: '1',
      token: 'token123',
      expiresAt: '2024-02-05T00:00:00Z',
      createdAt: '2024-01-29T00:00:00Z',
      createdBy: 'admin',
      status: 'pending' as const,
    };

    mockInvitationService.createInvitation.mockResolvedValue(mockCreatedInvitation);

    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/client/i), { target: { value: '1' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create invitation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInvitationService.createInvitation).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        country: 'IN',
        role: 'EOR',
        clientId: '1',
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles form submission errors', async () => {
    const errorMessage = 'Failed to create invitation';
    mockInvitationService.createInvitation.mockRejectedValue(new Error(errorMessage));

    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/client/i), { target: { value: '1' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create invitation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('clears validation errors when user starts typing', async () => {
    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Try to submit to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /create invitation/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });

    // Start typing in first name field
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'J' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    mockInvitationService.createInvitation.mockImplementation(() => new Promise(() => {}));

    render(<InvitationForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Create New Invitation')).toBeInTheDocument();
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/client/i), { target: { value: '1' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create invitation/i });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('Creating Invitation...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});

