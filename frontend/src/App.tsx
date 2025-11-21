import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClientProvider } from './contexts/ClientContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import LoginPageMUI from './pages/LoginPageMUI'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPageMUI from './pages/DashboardPageMUI'
import ProfilePage from './pages/ProfilePage'
import TimesheetsPage from './pages/TimesheetsPage'
import LeavePage from './pages/LeavePage'
import DocumentsPage from './pages/DocumentsPage'
import MyDocumentsPage from './pages/MyDocumentsPage'
import UserManagement from './pages/UserManagement'
import ClientManagement from './pages/ClientManagement'
import EmploymentRecordsPage from './pages/EmploymentRecordsPage'
import UserEmploymentHistoryPage from './pages/UserEmploymentHistoryPage'
import ClientEmploymentRecordsPage from './pages/ClientEmploymentRecordsPage'
import SalaryHistoryPage from './pages/SalaryHistoryPage'
import UnifiedThemeEditorPage from './pages/UnifiedThemeEditorPage'
import SettingsPage from './pages/SettingsPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import JobApplicationPage from './pages/JobApplicationPage'
import OnboardingWizardPage from './pages/OnboardingWizardPage'
import HROnboardingDashboardPage from './pages/HROnboardingDashboardPage'
import DebugTokenPage from './pages/DebugTokenPage'
import { SsoLaunch } from './pages/SsoLaunch'
import { SsoCallbackTest } from './pages/SsoCallbackTest'
import ProtectedRoute from './components/ProtectedRoute'
import RoleBasedRoute from './components/RoleBasedRoute'
import './App.css'

// Full payroll administration page
import PayrollAdministrationPage from './components/payroll-admin/PayrollAdministrationPage';

// Hiring module pages
import JobRequestsPage from './pages/hiring/JobRequestsPage';
import InterviewsPage from './pages/hiring/InterviewsPage';
import TalentPoolPage from './pages/hiring/TalentPoolPage';

// Hiring auth bridge
import hiringAuthBridge from './services/hiring/authBridge';

function App() {
  // Initialize hiring auth bridge on app mount
  useEffect(() => {
    hiringAuthBridge.setupInterceptors();
  }, []);
  return (
    <AuthProvider>
      <ClientProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route 
                    path="/login" 
                    element={<LoginPageMUI />} 
                  />
                  <Route 
                    path="/auth/callback" 
                    element={<AuthCallbackPage />} 
                  />
                  <Route 
                    path="/debug/token" 
                    element={<DebugTokenPage />} 
                  />
                  <Route 
                    path="/sso/launch/:clientId" 
                    element={
                      <ProtectedRoute>
                        <SsoLaunch />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/sso/callback" 
                    element={<SsoCallbackTest />} 
                  />
                  <Route 
                    path="/forgot-password" 
                    element={<div className="container" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                      <h1 className="h1">Forgot Password</h1>
                      <p className="body-medium">Password reset functionality coming soon.</p>
                      <a href="/login" className="btn btn-primary">Back to Login</a>
                    </div>} 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPageMUI />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute>
                        <OnboardingWizardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/timesheets" 
                    element={
                      <ProtectedRoute>
                        <TimesheetsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/leave" 
                    element={
                      <ProtectedRoute>
                        <LeavePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/documents" 
                    element={
                      <ProtectedRoute>
                        <MyDocumentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr']}>
                          <UserManagement />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/clients"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr']}>
                          <ClientManagement />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hr/onboarding"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr']}>
                          <HROnboardingDashboardPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/employment-records"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr', 'hr_manager_client', 'account_manager']}>
                          <EmploymentRecordsPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/employment-records/user/:userId" 
                    element={
                      <ProtectedRoute>
                        <UserEmploymentHistoryPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/employment-records/client/:clientId" 
                    element={
                      <ProtectedRoute>
                        <ClientEmploymentRecordsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/salary-history" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr']}>
                          <SalaryHistoryPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/payroll-administration" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr']}>
                          <PayrollAdministrationPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/jobs" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['candidate', 'eor', 'admin', 'account_manager']}>
                          <JobsPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/jobs/:shortcode" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['candidate', 'eor', 'admin', 'account_manager']}>
                          <JobDetailPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/jobs/:shortcode/apply" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['candidate', 'eor', 'admin', 'account_manager']}>
                          <JobApplicationPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hiring/job-requests" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client']}>
                          <JobRequestsPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hiring/interviews" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client']}>
                          <InterviewsPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hiring/talent-pool" 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute allowedRoles={['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client']}>
                          <TalentPoolPage />
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </div>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </ClientProvider>
    </AuthProvider>
  );
}

export default App;
