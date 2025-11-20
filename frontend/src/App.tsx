import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CountryProvider } from './contexts/CountryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { ClientProvider } from './contexts/ClientContext';
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
import ClientInvitationManagementPage from './pages/ClientInvitationManagementPage';
import InternalTeamInvitationManagementPage from './pages/InternalTeamInvitationManagementPage';
import IntegratedTestSuite from './pages/test/IntegratedTestSuite';
import DocsPage from './pages/DocsPage';
import SsoIntegrationPage from './pages/docs/SsoIntegrationPage';
import MultitenancyIntegrationPage from './pages/docs/MultitenancyIntegrationPage';
import OAuthConfigurationPage from './pages/OAuthConfigurationPage';
import UserManagement from './pages/UserManagement';
import InternalUsersPage from './pages/InternalUsersPage';
import UserDetailPage from './pages/UserDetailPage';
import TenantManagementPage from './pages/TenantManagementPage';
import CandidateUsersPage from './pages/CandidateUsersPage';
import UserProfilePage from './pages/UserProfilePage';
import AuditLogsPage from './pages/AuditLogsPage';
import MyOrganizationPage from './pages/MyOrganizationPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import AccountLayout from './components/AccountLayout';
import HomePage from './pages/account/HomePage';
import MyAppsPage from './pages/account/MyAppsPage';
import MyProfilePage from './pages/account/MyProfilePage';
import SuperAdminToolsPage from './pages/account/SuperAdminToolsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CountryProvider>
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
                  path="/admin/invitations/client" 
                  element={
                    <ProtectedRoute>
                      <ClientProvider>
                        <ClientInvitationManagementPage />
                      </ClientProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/invitations/internal" 
                  element={
                    <ProtectedRoute>
                      <ClientProvider>
                        <InternalTeamInvitationManagementPage />
                      </ClientProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <ClientProvider>
                        <AccountLayout />
                      </ClientProvider>
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
                      <ClientProvider>
                        <AccountLayout />
                      </ClientProvider>
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
                    path="tools/internal-users" 
                    element={
                      <SuperAdminRoute>
                        <InternalUsersPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="tools/tenant-management" 
                    element={<Navigate to="/admin/organizations" replace />}
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
                    path="tools/candidate-users" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_hr', 'internal_account_manager', 'internal_recruiter']}>
                        <CandidateUsersPage />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="organizations" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager', 'internal_hr']}>
                        <TenantManagementPage />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="users" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager', 'internal_hr']}>
                        <UserManagement />
                      </RoleBasedRoute>
                    } 
                  />
                  <Route 
                    path="users/:userId" 
                    element={
                      <RoleBasedRoute allowedRoles={['super_admin', 'internal_account_manager', 'internal_hr']}>
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
                  path="/docs/sso_integration" 
                  element={<SsoIntegrationPage />} 
                />
                <Route 
                  path="/docs/multitenancy_integration" 
                  element={<MultitenancyIntegrationPage />} 
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
      </CountryProvider>
    </AuthProvider>
  );
}

export default App;
