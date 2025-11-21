import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import type { LoginCredentials } from '../services/authService';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(formData);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error Display */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-error text-body-small">
          {errors.general}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-body-small font-medium text-text-primary mb-1">
          Email Address
        </label>
        <input
          type="text"
          id="email"
          name="email"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-bg-primary text-text-primary ${
            errors.email ? 'border-error' : 'border-border-light'
          }`}
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          autoComplete="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" className="mt-1 text-body-small text-error" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-body-small font-medium text-text-primary mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-bg-primary text-text-primary ${
              errors.password ? 'border-error' : 'border-border-light'
            }`}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1 12S5 4 12 4S23 12 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5C13.5 5 15 5.5 16 6.5C17 7.5 18 9 18 12C18 15 17 16.5 16 17.5C15 18.5 13.5 19 12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5C13.5 5 15 5.5 16 6.5C17 7.5 18 9 18 12C18 15 17 16.5 16 17.5C15 18.5 13.5 19 12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <div id="password-error" className="mt-1 text-body-small text-error" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="text-right">
        <a href="/forgot-password" className="text-body-small text-brand-blue hover:text-brand-deep-blue transition-colors">
          Forgot password?
        </a>
      </div>

      {/* Remember Me and Submit */}
      <div className="flex items-center">
        <label className="flex items-center text-body-small text-text-primary">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="mr-2 h-4 w-4 text-brand-blue border-border-light rounded focus:ring-brand-blue focus:ring-2"
          />
          Remember me
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-body-medium font-medium text-white bg-brand-blue border border-transparent rounded-md hover:bg-brand-deep-blue focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
