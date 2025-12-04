import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import LoginPageMUI from './pages/LoginPageMUI';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AcceptInternalInvitationPage from './pages/AcceptInternalInvitationPage';
import SignupPathSelectionPage from './pages/SignupPathSelectionPage';
import CandidateSignupPage from './pages/CandidateSignupPage';
import ClientAdminSignupPage from './pages/ClientAdminSignupPage';
import InvitationPreviewPage from './pages/InvitationPreviewPage';
import OrganizationInvitationAcceptPage from './pages/OrganizationInvitationAcceptPage';
import InternalTeamInvitationManagementPage from './pages/InternalTeamInvitationManagementPage';
import IntegratedTestSuite from './pages/test/IntegratedTestSuite';
import DocsLayout from './components/docs/DocsLayout';
import OverviewPage from './pages/docs/product/OverviewPage';
import SsoProductPage from './pages/docs/product/SsoPage';
import RolesPage from './pages/docs/product/RolesPage';
import PasswordResetPage from './pages/docs/product/PasswordResetPage';
import UseCasesPage from './pages/docs/product/UseCasesPage';
import QuickstartPage from './pages/docs/developer/QuickstartPage';
import OAuthPage from './pages/docs/developer/OAuthPage';
import UserManagementApiPage from './pages/docs/developer/UserManagementApiPage';
import PasswordResetApiPage from './pages/docs/developer/PasswordResetApiPage';
import TestAccountsPage from './pages/docs/developer/TestAccountsPage';
import ProfilePicturesApiPage from './pages/docs/developer/ProfilePicturesApiPage';
import OrganizationApiPage from './pages/docs/developer/OrganizationApiPage';
import SsoIntegrationPage from './pages/docs/SsoIntegrationPage';
import MultiOrganizationIntegrationPage from './pages/docs/MultiOrganizationIntegrationPage';
import DeepLinkingGuidePage from './pages/docs/DeepLinkingGuidePage';
import ReleaseNotesIndexPage from './pages/docs/release-notes/ReleaseNotesIndexPage';
import ReleaseNote_2025_12_02 from './pages/docs/ReleaseNote_2025_12_02';
import ReleaseNote_2025_12_03 from './pages/docs/ReleaseNote_2025_12_03';
import ReleaseNote_v102 from './pages/docs/ReleaseNote_v102';
import UserActivityApiPage from './pages/docs/developer/UserActivityApiPage';
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
import CandidateUsersPage from './pages/account/CandidateUsersPage';
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
                  path="/force-change-password" 
                  element={
                    <ProtectedRoute>
                      <ForceChangePasswordPage />
                    </ProtectedRoute>
                  } 
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
                    path="tools/candidate-users" 
                    element={
                      <SuperAdminRoute>
                        <CandidateUsersPage />
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
                
                {/* Documentation with sidebar layout */}
                <Route path="/docs" element={<DocsLayout />}>
                  <Route index element={<Navigate to="/docs/product/overview" replace />} />
                  {/* Product Guide */}
                  <Route path="product/overview" element={<OverviewPage />} />
                  <Route path="product/sso" element={<SsoProductPage />} />
                  <Route path="product/roles" element={<RolesPage />} />
                  <Route path="product/password-reset" element={<PasswordResetPage />} />
                  <Route path="product/use-cases" element={<UseCasesPage />} />
                  {/* Developer Guide */}
                  <Route path="developer/quickstart" element={<QuickstartPage />} />
                  <Route path="developer/oauth" element={<OAuthPage />} />
                  <Route path="developer/user-management" element={<UserManagementApiPage />} />
                  <Route path="developer/organization-api" element={<OrganizationApiPage />} />
                  <Route path="developer/profile-pictures" element={<ProfilePicturesApiPage />} />
                  <Route path="developer/user-activity" element={<UserActivityApiPage />} />
                  <Route path="developer/password-reset-api" element={<PasswordResetApiPage />} />
                  <Route path="developer/test-accounts" element={<TestAccountsPage />} />
                  <Route path="sso-integration" element={<SsoIntegrationPage />} />
                  <Route path="multi-organization" element={<MultiOrganizationIntegrationPage />} />
                  <Route path="deep-linking-guide" element={<DeepLinkingGuidePage />} />
                  {/* Release Notes */}
                  <Route path="release-notes" element={<ReleaseNotesIndexPage />} />
                  <Route path="release-notes/2025-12-04" element={<ReleaseNote_v102 />} />
                  <Route path="release-notes/2025-12-03" element={<ReleaseNote_2025_12_03 />} />
                  <Route path="release-notes/2025-12-02" element={<ReleaseNote_2025_12_02 />} />
                </Route>
                
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
