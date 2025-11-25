import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import LoginPageMUI from './pages/LoginPageMUI';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AcceptInternalInvitationPage from './pages/AcceptInternalInvitationPage';
import SignupPathSelectionPage from './pages/SignupPathSelectionPage';
import CandidateSignupPage from './pages/CandidateSignupPage';
import ClientAdminSignupPage from './pages/ClientAdminSignupPage';
import InvitationPreviewPage from './pages/InvitationPreviewPage';
import OrganizationInvitationAcceptPage from './pages/OrganizationInvitationAcceptPage';
import InternalTeamInvitationManagementPage from './pages/InternalTeamInvitationManagementPage';
import IntegratedTestSuite from './pages/test/IntegratedTestSuite';
import DocsPage from './pages/DocsPage';
import SsoIntegrationPage from './pages/docs/SsoIntegrationPage';
import MultiOrganizationIntegrationPage from './pages/docs/MultiOrganizationIntegrationPage';
import OAuthConfigurationPage from './pages/OAuthConfigurationPage';
import UserManagement from './pages/UserManagement';
import UserDetailPage from './pages/UserDetailPage';
import OrganizationManagementPage from './pages/OrganizationManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import MyOrganizationPage from './pages/MyOrganizationPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import SessionAwareRedirect from './components/SessionAwareRedirect';
import AccountLayout from './components/AccountLayout';
import HomePage from './pages/account/HomePage';
import MyAppsPage from './pages/account/MyAppsPage';
import MyProfilePage from './pages/account/MyProfilePage';
import SuperAdminToolsPage from './pages/account/SuperAdminToolsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
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
                  path="/callback" 
                  element={<AuthCallbackPage />} 
                />
                <Route 
                  path="/auth/callback" 
                  element={<AuthCallbackPage />} 
                />
                <Route 
                  path="/reset-password" 
                  element={<ResetPasswordPage />} 
                />
                <Route 
                  path="/verify-email" 
                  element={<VerifyEmailPage />} 
                />
                <Route 
                  path="/accept-invitation" 
                  element={<AcceptInternalInvitationPage />} 
                />
                <Route 
                  path="/signup-select" 
                  element={<SignupPathSelectionPage />} 
                />
                <Route 
                  path="/signup-candidate" 
                  element={<CandidateSignupPage />} 
                />
                <Route 
                  path="/signup-client-admin" 
                  element={<ClientAdminSignupPage />} 
                />
                <Route 
                  path="/invitations/preview/:code" 
                  element={<InvitationPreviewPage />} 
                />
                <Route 
                  path="/invitations/accept/:code" 
                  element={<OrganizationInvitationAcceptPage />} 
                />
                <Route 
                  path="/admin/invitations/internal" 
                  element={
                    <ProtectedRoute>
                      <InternalTeamInvitationManagementPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/account/profile" replace />} />
                  <Route path="apps" element={<MyAppsPage />} />
                  <Route path="profile" element={<MyProfilePage />} />
                  <Route path="organization" element={
                    <RoleBasedRoute allowedRoles={['client_admin']}>
                      <MyOrganizationPage />
                    </RoleBasedRoute>
                  } />
                </Route>
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route 
                    path="tools" 
                    element={
                      <SuperAdminRoute>
                        <SuperAdminToolsPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="tools/oauth-configuration" 
                    element={
                      <SuperAdminRoute>
                        <OAuthConfigurationPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="audit-logs" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager']}>
                        <AuditLogsPage />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="organizations" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager']}>
                        <OrganizationManagementPage />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="users" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager']}>
                        <UserManagement />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="users/:userId" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager']}>
                        <UserDetailPage />
                      </RoleBasedRoute>
                    } 
                  />
                </Route>
                <Route path="/test" element={<IntegratedTestSuite />} />
                <Route 
                  path="/docs" 
                  element={<DocsPage />} 
                />
                <Route 
                  path="/docs/sso-integration" 
                  element={<SsoIntegrationPage />} 
                />
                <Route 
                  path="/docs/multi-organization" 
                  element={<MultiOrganizationIntegrationPage />} 
                />
                <Route path="/" element={<SessionAwareRedirect />} />
                <Route path="*" element={<SessionAwareRedirect />} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
