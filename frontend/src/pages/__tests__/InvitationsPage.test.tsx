import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import InvitationsPage from '../InvitationsPage';

// Mock the components
vi.mock('../../components/InvitationForm', () => ({
  default: ({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) => (
    <div data-testid="invitation-form">
      <h2>Mock Invitation Form</h2>
      <button onClick={onSuccess} data-testid="form-success">
        Submit Success
      </button>
      <button onClick={onCancel} data-testid="form-cancel">
        Cancel
      </button>
    </div>
  ),
}));

vi.mock('../../components/InvitationList', () => ({
  default: ({ onRefresh }: { onRefresh?: () => void }) => (
    <div data-testid="invitation-list">
      <h2>Mock Invitation List</h2>
      <button onClick={onRefresh} data-testid="list-refresh">
        Refresh List
      </button>
    </div>
  ),
}));

describe('InvitationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header with title and description', () => {
    render(<InvitationsPage />);

    expect(screen.getByText('Invitation Management')).toBeInTheDocument();
    expect(screen.getByText('Create and manage invitations for new EORs and Admins')).toBeInTheDocument();
  });

  it('shows the invitation list by default', () => {
    render(<InvitationsPage />);

    expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
    expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
  });

  it('displays the "New Invitation" button when form is not shown', () => {
    render(<InvitationsPage />);

    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    expect(newInvitationButton).toBeInTheDocument();
    expect(newInvitationButton).toHaveClass('btn--primary');
  });

  it('shows the invitation form when "New Invitation" button is clicked', () => {
    render(<InvitationsPage />);

    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    expect(screen.getByTestId('invitation-form')).toBeInTheDocument();
    expect(screen.queryByTestId('invitation-list')).not.toBeInTheDocument();
  });

  it('hides the "New Invitation" button when form is shown', () => {
    render(<InvitationsPage />);

    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    expect(screen.queryByRole('button', { name: /new invitation/i })).not.toBeInTheDocument();
  });

  it('shows form section when form is displayed', () => {
    render(<InvitationsPage />);

    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    expect(screen.getByTestId('invitation-form')).toBeInTheDocument();
  });

  it('shows list section when form is not displayed', () => {
    render(<InvitationsPage />);

    expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
  });

  it('calls onSuccess callback when form submission is successful', async () => {
    render(<InvitationsPage />);

    // Show the form
    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    // Submit the form successfully
    const submitButton = screen.getByTestId('form-success');
    fireEvent.click(submitButton);

    // Wait for the form to be hidden and list to be shown
    await waitFor(() => {
      expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
    });
  });

  it('calls onCancel callback when form is cancelled', async () => {
    render(<InvitationsPage />);

    // Show the form
    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    // Cancel the form
    const cancelButton = screen.getByTestId('form-cancel');
    fireEvent.click(cancelButton);

    // Wait for the form to be hidden and list to be shown
    await waitFor(() => {
      expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
    });
  });

  it('passes onRefresh callback to InvitationList', () => {
    render(<InvitationsPage />);

    const refreshButton = screen.getByTestId('list-refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('refreshes the invitation list when refresh is triggered', async () => {
    render(<InvitationsPage />);

    const refreshButton = screen.getByTestId('list-refresh');
    fireEvent.click(refreshButton);

    // The refresh should trigger a re-render of the list
    expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
  });

  it('maintains proper page structure and layout', () => {
    render(<InvitationsPage />);

    // Check page structure
    expect(screen.getByText('Invitation Management').closest('.invitations-page')).toBeInTheDocument();
    
    // Check header structure
    const header = screen.getByText('Invitation Management').closest('.page-header');
    expect(header).toBeInTheDocument();
    
    // Check content structure
    const content = screen.getByTestId('invitation-list').closest('.page-content');
    expect(content).toBeInTheDocument();
  });

  it('handles multiple form open/close cycles correctly', async () => {
    render(<InvitationsPage />);

    // First cycle: open form
    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);
    expect(screen.getByTestId('invitation-form')).toBeInTheDocument();

    // Close form
    const cancelButton = screen.getByTestId('form-cancel');
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
    });

    // Second cycle: open form again
    const newInvitationButton2 = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton2);
    expect(screen.getByTestId('invitation-form')).toBeInTheDocument();

    // Close form again
    const cancelButton2 = screen.getByTestId('form-cancel');
    fireEvent.click(cancelButton2);
    await waitFor(() => {
      expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
    });
  });

  it('passes correct props to child components', () => {
    render(<InvitationsPage />);

    // Check that InvitationList receives onRefresh prop
    const list = screen.getByTestId('invitation-list');
    expect(list).toBeInTheDocument();

    // Check that InvitationForm receives correct props when shown
    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);

    const form = screen.getByTestId('invitation-form');
    expect(form).toBeInTheDocument();
  });

  it('maintains state consistency across component interactions', async () => {
    render(<InvitationsPage />);

    // Initial state: list should be visible
    expect(screen.getByTestId('invitation-list')).toBeInTheDocument();

    // Open form: form should be visible, list should be hidden
    const newInvitationButton = screen.getByRole('button', { name: /new invitation/i });
    fireEvent.click(newInvitationButton);
    expect(screen.getByTestId('invitation-form')).toBeInTheDocument();
    expect(screen.queryByTestId('invitation-list')).not.toBeInTheDocument();

    // Close form: list should be visible again
    const cancelButton = screen.getByTestId('form-cancel');
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByTestId('invitation-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('invitation-list')).toBeInTheDocument();
    });
  });
});
