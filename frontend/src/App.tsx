import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
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
import ReleaseNote_v103 from './pages/docs/ReleaseNote_v103';
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

// Redirect component for old /admin/users/:userId route to new /users/:userId
function UserDetailRedirect() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  return <Navigate to={`/users/${userId}`} state={location.state} replace />;
}

// Redirect component for /organization to first organization
function OrganizationRedirect() {
  const [loading, setLoading] = React.useState(true);
  const [orgSlug, setOrgSlug] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchOrg = async () => {
      try {
        const { default: OrganizationsService } = await import('./services/organizationsService');
        const orgs = await OrganizationsService.getMyOrganizations();
        if (orgs.length > 0) {
          setOrgSlug(orgs[0].slug);
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: '200px',
        backgroundColor: 'inherit'
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '3px solid #e0e0e0', 
          borderTop: '3px solid #A16AE8', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  if (orgSlug) {
    return <Navigate to={`/organization/${orgSlug}`} replace />;
  }
  
  return <Navigate to="/account/profile" replace />;
}

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
                {/* Organization routes - all wrapped in AccountLayout for smooth navigation */}
                <Route 
                  path="/organization" 
                  element={
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Redirect /organization to first organization */}
                  <Route index element={<OrganizationRedirect />} />
                  <Route path=":slug" element={
                    <RoleBasedRoute allowedRoles={['super_admin', 'internal_hr', 'internal_account_manager', 'client_admin', 'client_hr', 'client_finance', 'client_recruiter', 'client_employee', 'client_hiring_manager']}>
                      <MyOrganizationPage />
                    </RoleBasedRoute>
                  } />
                </Route>
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
                </Route>
                {/* User Detail Page - accessible to both internal and client users */}
                <Route 
                  path="/users/:userId" 
                  element={
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={
                    <RoleBasedRoute allowedRoles={[
                      'super_admin', 
                      'internal_account_manager', 
                      'internal_hr',
                      'internal_staff',
                      'client_admin', 
                      'client_hr'
                    ]}>
                      <UserDetailPage />
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
                  {/* Redirect old admin user detail route to new location */}
                  <Route 
                    path="users/:userId" 
                    element={<UserDetailRedirect />}
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
                  <Route path="release-notes/2025-12-05" element={<ReleaseNote_v103 />} />
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
