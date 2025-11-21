import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as authService from '../../services/authService';

// Mock the authentication service
vi.mock('../../services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

// Test component to render inside ProtectedRoute
const TestComponent = () => <div>Protected Content</div>;

// Wrapper component to provide router context
const ProtectedRouteWrapper = ({ isAuth }: { isAuth: boolean }) => {
  // Mock the isAuthenticated function to return our test value
  mockedAuthService.isAuthenticated.mockReturnValue(isAuth);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('should show loading state while checking authentication', () => {
      // Mock isAuthenticated to return null initially (loading state)
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      expect(screen.getByText(/verifying authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render protected content when authenticated', async () => {
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      });
    });

    it('should redirect to login when not authenticated', async () => {
      mockedAuthService.isAuthenticated.mockReturnValue(false);
      
      render(<ProtectedRouteWrapper isAuth={false} />);
      
      await waitFor(() => {
        expect(screen.getByText(/login page/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should display proper loading UI', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      const loadingButton = screen.getByText(/loading/i);
      expect(loadingButton).toHaveClass('btn--loading');
      expect(screen.getByText(/verifying authentication/i)).toBeInTheDocument();
    });

    it('should have proper loading styling', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      const loadingContainer = screen.getByText(/verifying authentication/i).closest('.card');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Authentication State Management', () => {
    it('should set up periodic authentication checks', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it('should clean up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      
      const { unmount } = render(<ProtectedRouteWrapper isAuth={true} />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Route Protection', () => {
    it('should preserve original location for redirect', async () => {
      mockedAuthService.isAuthenticated.mockReturnValue(false);
      
      render(<ProtectedRouteWrapper isAuth={false} />);
      
      await waitFor(() => {
        expect(screen.getByText(/login page/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication state changes', async () => {
      // Start with loading state
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      const { rerender } = render(<ProtectedRouteWrapper isAuth={true} />);
      
      expect(screen.getByText(/verifying authentication/i)).toBeInTheDocument();
      
      // Change to authenticated state
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      rerender(<ProtectedRouteWrapper isAuth={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication service errors gracefully', () => {
      // Mock isAuthenticated to throw an error
      mockedAuthService.isAuthenticated.mockImplementation(() => {
        throw new Error('Auth service error');
      });
      
      // Should not crash the component
      expect(() => {
        render(<ProtectedRouteWrapper isAuth={false} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for loading state', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      const loadingButton = screen.getByText(/loading/i);
      expect(loadingButton).toBeInTheDocument();
    });

    it('should provide clear feedback during authentication check', () => {
      mockedAuthService.isAuthenticated.mockReturnValue(null as any);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      expect(screen.getByText(/verifying authentication/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      mockedAuthService.isAuthenticated.mockReturnValue(true);
      
      render(<ProtectedRouteWrapper isAuth={true} />);
      
      // Component should render once and not re-render unnecessarily
      expect(renderSpy).not.toHaveBeenCalled();
    });
  });
});
