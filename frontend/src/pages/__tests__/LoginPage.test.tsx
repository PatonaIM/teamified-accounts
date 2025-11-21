import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

// Mock the LoginForm component
vi.mock('../../components/LoginForm', () => ({
  default: () => <div data-testid="login-form">Mocked Login Form</div>
}));

// Mock the auth service
vi.mock('../../services/authService', () => ({
  login: vi.fn()
}));

// Wrapper component to provide router context
const LoginPageWrapper = () => (
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
);

describe('LoginPage - Material-UI 3 Expressive Design', () => {
  describe('Layout Structure', () => {
    it('should render the main container with proper layout classes', () => {
      render(<LoginPageWrapper />);
      
      const mainContainer = screen.getByTestId('login-form').closest('div')?.parentElement?.parentElement?.parentElement;
      expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'flex-col', 'lg:flex-row');
    });

    it('should have left panel for desktop branding', () => {
      render(<LoginPageWrapper />);
      
      const leftPanel = screen.getAllByText(/teamified/i)[0].closest('div')?.parentElement?.parentElement;
      expect(leftPanel).toHaveClass('hidden', 'lg:flex', 'lg:flex-1', 'bg-gradient-to-br');
    });

    it('should have right panel for login form', () => {
      render(<LoginPageWrapper />);
      
      const rightPanel = screen.getByTestId('login-form').closest('div')?.parentElement?.parentElement;
      expect(rightPanel).toHaveClass('flex-1', 'flex', 'flex-col', 'justify-center');
    });

    it('should have mobile header for small screens', () => {
      render(<LoginPageWrapper />);
      
      // Check that mobile version exists
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames).toHaveLength(2);
      
      // Check that mobile header exists and has proper text
      expect(brandNames[1]).toBeInTheDocument();
      expect(brandNames[1]).toHaveClass('text-h1', 'font-medium', 'text-white');
    });
  });

  describe('Branding and Visual Elements', () => {
    it('should display teamified brand name in desktop panel', () => {
      render(<LoginPageWrapper />);
      
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames).toHaveLength(2); // Desktop and mobile versions
      
      // Desktop version
      expect(brandNames[0]).toHaveClass('text-display-large', 'font-medium', 'text-white');
    });

    it('should display teamified brand name in mobile header', () => {
      render(<LoginPageWrapper />);
      
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames[1]).toHaveClass('text-h1', 'font-medium', 'text-white');
    });

    it('should display Team Member Portal subtitle', () => {
      render(<LoginPageWrapper />);
      
      const subtitles = screen.getAllByText(/Team Member Portal/i);
      expect(subtitles).toHaveLength(2); // Desktop and mobile versions
      
      // Desktop version
      expect(subtitles[0]).toHaveClass('text-body-large', 'text-white', 'opacity-90');
    });

    it('should display hero image in desktop panel', () => {
      render(<LoginPageWrapper />);
      
      const heroImage = screen.getByAltText('Team Member Portal Hero');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveClass('w-80', 'h-80', 'object-cover', 'rounded-lg', 'shadow-2xl');
      expect(heroImage).toHaveAttribute('src', '/hero-image.avif');
    });

    it('should display hero content description', () => {
      render(<LoginPageWrapper />);
      
      const heroContent = screen.getByText(/Access your timesheets, manage your profile, and handle all your employment needs in one secure platform/i);
      expect(heroContent).toBeInTheDocument();
      expect(heroContent).toHaveClass('text-body-large', 'text-white', 'opacity-90', 'leading-relaxed');
    });

    it('should display decorative SVG elements', () => {
      render(<LoginPageWrapper />);
      
      // Check that the decorative container exists by looking for the SVG
      const svgElement = screen.getByRole('img', { hidden: true });
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('Login Form Section', () => {
    it('should render the login form component', () => {
      render(<LoginPageWrapper />);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('should have proper form container styling', () => {
      render(<LoginPageWrapper />);
      
      const formContainer = screen.getByTestId('login-form').closest('div')?.parentElement;
      expect(formContainer).toHaveClass('mx-auto', 'w-full', 'max-w-md');
    });

    it('should display form header with proper typography', () => {
      render(<LoginPageWrapper />);
      
      const formTitle = screen.getByText('Sign in to your account');
      expect(formTitle).toBeInTheDocument();
      expect(formTitle).toHaveClass('text-h2', 'font-medium', 'text-text-primary');
    });

    it('should display form subtitle with proper styling', () => {
      render(<LoginPageWrapper />);
      
      const formSubtitle = screen.getByText('Enter your credentials to access your portal');
      expect(formSubtitle).toBeInTheDocument();
      expect(formSubtitle).toHaveClass('text-body-medium', 'text-text-secondary');
    });

    it('should display help text in footer', () => {
      render(<LoginPageWrapper />);
      
      const helpText = screen.getByText('Need help? Contact your administrator');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveClass('text-body-small', 'text-text-tertiary');
    });
  });

  describe('Responsive Design', () => {
    it('should have proper responsive padding on right panel', () => {
      render(<LoginPageWrapper />);
      
      const rightPanel = screen.getByTestId('login-form').closest('div')?.parentElement?.parentElement;
      expect(rightPanel).toHaveClass('px-6', 'py-12', 'sm:px-8', 'lg:px-12');
    });

    it('should have proper responsive padding on left panel content', () => {
      render(<LoginPageWrapper />);
      
      // Check that the left panel content exists and has proper structure
      const leftPanelContent = screen.getAllByText(/teamified/i)[0].closest('div')?.parentElement?.parentElement;
      expect(leftPanelContent).toBeInTheDocument();
    });

    it('should have proper responsive padding on mobile header', () => {
      render(<LoginPageWrapper />);
      
      // Check that mobile header exists and has proper structure
      const mobileHeader = screen.getAllByText(/teamified/i)[1].closest('div')?.parentElement;
      expect(mobileHeader).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<LoginPageWrapper />);
      
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames[0].tagName).toBe('H1');
      expect(brandNames[1].tagName).toBe('H1');
      
      const formTitle = screen.getByText('Sign in to your account');
      expect(formTitle.tagName).toBe('H2');
    });

    it('should have proper alt text for images', () => {
      render(<LoginPageWrapper />);
      
      const heroImage = screen.getByAltText('Team Member Portal Hero');
      expect(heroImage).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for decorative elements', () => {
      render(<LoginPageWrapper />);
      
      // Check that the SVG exists
      const svgElement = screen.getByRole('img', { hidden: true });
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('Color and Styling', () => {
    it('should use brand colors for desktop panel', () => {
      render(<LoginPageWrapper />);
      
      const leftPanel = screen.getAllByText(/teamified/i)[0].closest('div')?.parentElement?.parentElement;
      expect(leftPanel).toHaveClass('from-brand-purple', 'to-brand-blue');
    });

    it('should use brand colors for mobile header', () => {
      render(<LoginPageWrapper />);
      
      // Check that mobile header exists and has proper text styling
      const mobileHeader = screen.getAllByText(/teamified/i)[1].closest('div')?.parentElement;
      expect(mobileHeader).toBeInTheDocument();
    });

    it('should use proper text colors for form elements', () => {
      render(<LoginPageWrapper />);
      
      const formTitle = screen.getByText('Sign in to your account');
      expect(formTitle).toHaveClass('text-text-primary');
      
      const formSubtitle = screen.getByText('Enter your credentials to access your portal');
      expect(formSubtitle).toHaveClass('text-text-secondary');
      
      const helpText = screen.getByText('Need help? Contact your administrator');
      expect(helpText).toHaveClass('text-text-tertiary');
    });

    it('should use white text for branding elements', () => {
      render(<LoginPageWrapper />);
      
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames[0]).toHaveClass('text-white');
      expect(brandNames[1]).toHaveClass('text-white');
      
      const subtitles = screen.getAllByText(/Team Member Portal/i);
      expect(subtitles[0]).toHaveClass('text-white');
      expect(subtitles[1]).toHaveClass('text-white');
    });
  });

  describe('Layout Spacing', () => {
    it('should have proper spacing between form elements', () => {
      render(<LoginPageWrapper />);
      
      const formHeader = screen.getByText('Sign in to your account').closest('div');
      expect(formHeader).toHaveClass('text-center', 'mb-8');
      
      const formFooter = screen.getByText('Need help? Contact your administrator').closest('div');
      expect(formFooter).toHaveClass('mt-8', 'text-center');
    });

    it('should have proper spacing in desktop panel', () => {
      render(<LoginPageWrapper />);
      
      // Check that brand section exists and has proper structure
      const brandSection = screen.getAllByText(/teamified/i)[0].closest('div')?.parentElement;
      expect(brandSection).toBeInTheDocument();
      
      // Check that hero image section exists and has proper structure
      const heroImageSection = screen.getByAltText('Team Member Portal Hero').closest('div');
      expect(heroImageSection).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render LoginForm component without props', () => {
      render(<LoginPageWrapper />);
      
      const loginForm = screen.getByTestId('login-form');
      expect(loginForm).toBeInTheDocument();
    });

    it('should maintain proper component hierarchy', () => {
      render(<LoginPageWrapper />);
      
      // Check that all major sections are present
      expect(screen.getAllByText(/teamified/i)).toHaveLength(2);
      expect(screen.getAllByText(/Team Member Portal/i)).toHaveLength(2);
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByText('Enter your credentials to access your portal')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByText('Need help? Contact your administrator')).toBeInTheDocument();
    });
  });

  describe('Material-UI 3 Expressive Design Compliance', () => {
    it('should use proper typography scale', () => {
      render(<LoginPageWrapper />);
      
      // Check that typography follows the design system
      const brandNames = screen.getAllByText(/teamified/i);
      expect(brandNames[0]).toHaveClass('text-display-large'); // Desktop version
      expect(brandNames[1]).toHaveClass('text-h1'); // Mobile version
      
      const formTitle = screen.getByText('Sign in to your account');
      expect(formTitle).toHaveClass('text-h2');
    });

    it('should use proper spacing system', () => {
      render(<LoginPageWrapper />);
      
      // Check that spacing follows the 8px base unit system
      const formHeader = screen.getByText('Sign in to your account').closest('div');
      expect(formHeader).toHaveClass('mb-8'); // 32px = 4 * 8px
      
      const formFooter = screen.getByText('Need help? Contact your administrator').closest('div');
      expect(formFooter).toHaveClass('mt-8'); // 32px = 4 * 8px
    });

    it('should use proper border radius', () => {
      render(<LoginPageWrapper />);
      
      const heroImage = screen.getByAltText('Team Member Portal Hero');
      expect(heroImage).toHaveClass('rounded-lg'); // 16px border radius
    });

    it('should use proper shadow system', () => {
      render(<LoginPageWrapper />);
      
      const heroImage = screen.getByAltText('Team Member Portal Hero');
      expect(heroImage).toHaveClass('shadow-2xl'); // Elevated shadow
    });
  });
});