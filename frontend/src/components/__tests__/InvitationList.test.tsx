import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InvitationList from '../InvitationList';
import invitationService, { type Invitation, type Client } from '../../services/invitationService';

// Mock the invitation service
vi.mock('../../services/invitationService', () => ({
  default: {
    getInvitations: vi.fn(),
    getClients: vi.fn(),
    resendInvitation: vi.fn(),
    deleteInvitation: vi.fn(),
  },
}));

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>;

describe('InvitationList', () => {
  const mockInvitations: Invitation[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      country: 'IN',
      role: 'EOR',
      clientId: 'client1',
      token: 'token1',
      expiresAt: '2025-09-05T10:00:00Z',
      createdAt: '2025-08-29T10:00:00Z',
      createdBy: 'admin1',
      status: 'pending',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      country: 'LK',
      role: 'Admin',
      clientId: 'client2',
      token: 'token2',
      expiresAt: '2025-09-06T10:00:00Z',
      createdAt: '2025-08-30T10:00:00Z',
      createdBy: 'admin1',
      status: 'accepted',
    },
  ];

  const mockClients: Client[] = [
    { id: 'client1', name: 'Client A', code: 'CA' },
    { id: 'client2', name: 'Client B', code: 'CB' },
  ];

  const mockInvitationResponse = {
    invitations: mockInvitations,
    total: 2,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mocks BEFORE rendering
    mockInvitationService.getInvitations.mockResolvedValue(mockInvitationResponse);
    mockInvitationService.getClients.mockResolvedValue(mockClients);
    
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    // Mock window.alert
    window.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the invitation list with header and controls', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('Invitations')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Search invitations...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
  });

  it('loads invitations and clients on mount', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(mockInvitationService.getInvitations).toHaveBeenCalledWith(1, 10);
      expect(mockInvitationService.getClients).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  it('shows loading state while data is loading', () => {
    // Override the mock to never resolve
    mockInvitationService.getInvitations.mockImplementation(() => new Promise(() => {}));
    
    render(<InvitationList />);
    
    expect(screen.getByText('Loading invitations...')).toBeInTheDocument();
  });

  it('displays invitation data in table format', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Expires')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check invitation data
    expect(screen.getByText('IN')).toBeInTheDocument();
    expect(screen.getByText('EOR')).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('filters invitations by search term', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search invitations...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters invitations by status', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('All Status');
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('handles invitation resend', async () => {
    mockInvitationService.resendInvitation.mockResolvedValue();
    
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: /resend/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockInvitationService.resendInvitation).toHaveBeenCalledWith('1');
    });

    expect(window.alert).toHaveBeenCalledWith('Invitation resent successfully!');
  });

  it('handles invitation deletion with confirmation', async () => {
    mockInvitationService.deleteInvitation.mockResolvedValue();
    
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this invitation? This action cannot be undone.'
    );

    await waitFor(() => {
      expect(mockInvitationService.deleteInvitation).toHaveBeenCalledWith('1');
    });

    // Check that the invitation is removed from the list
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows no data message when no invitations match search', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search invitations...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText('No invitations match your search criteria')).toBeInTheDocument();
  });

  it('shows no data message when no invitations exist', async () => {
    // Override the mock for this specific test
    mockInvitationService.getInvitations.mockResolvedValue({
      invitations: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('No invitations found')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    // Override the mock for this specific test
    mockInvitationService.getInvitations.mockResolvedValue({
      invitations: mockInvitations,
      total: 25,
      page: 1,
      limit: 10,
    });

    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockInvitationService.getInvitations).toHaveBeenCalledWith(2, 10);
    });
  });

  it('disables pagination buttons appropriately', async () => {
    // Override the mock for this specific test
    mockInvitationService.getInvitations.mockResolvedValue({
      invitations: mockInvitations,
      total: 25,
      page: 1,
      limit: 10,
    });

    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onRefresh callback when data is updated', async () => {
    const mockOnRefresh = vi.fn();
    mockInvitationService.deleteInvitation.mockResolvedValue();
    
    render(<InvitationList onRefresh={mockOnRefresh} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockInvitationService.deleteInvitation).toHaveBeenCalled();
    });

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Override the mock for this specific test
    mockInvitationService.getInvitations.mockRejectedValue(new Error('API Error'));
    
    render(<InvitationList />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('formats dates correctly', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that dates are formatted (this will depend on the locale)
    expect(screen.getByText(/Aug 29/)).toBeInTheDocument();
    expect(screen.getByText(/Sep 5/)).toBeInTheDocument();
  });

  it('applies correct status badge classes', async () => {
    render(<InvitationList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const pendingBadge = screen.getByText('pending');
    const acceptedBadge = screen.getByText('accepted');

    expect(pendingBadge).toHaveClass('status-badge--pending');
    expect(acceptedBadge).toHaveClass('status-badge--accepted');
  });
});
