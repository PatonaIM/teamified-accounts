import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import LoginPageMUI from './pages/LoginPageMUI';
import AuthCallbackPage from './pages/AuthCallbackPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import GoogleSignupPathPage from './pages/GoogleSignupPathPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AcceptInternalInvitationPage from './pages/AcceptInternalInvitationPage';
import SignupPathSelectionPage from './pages/SignupPathSelectionPage';
import CandidateSignupPage from './pages/CandidateSignupPage';
import ClientAdminSignupPage from './pages/ClientAdminSignupPage';
import SignupSuccessPage from './pages/SignupSuccessPage';
import GoogleSignupSuccessPage from './pages/GoogleSignupSuccessPage';
import InvitationPreviewPage from './pages/InvitationPreviewPage';
import OrganizationInvitationAcceptPage from './pages/OrganizationInvitationAcceptPage';
import InternalTeamInvitationManagementPage from './pages/InternalTeamInvitationManagementPage';
import IntegratedTestSuite from './pages/test/IntegratedTestSuite';
import TestLogoutCallback from './pages/test/TestLogoutCallback';
import PortalRedirectPage from './pages/PortalRedirectPage';
import LogoutPage from './pages/LogoutPage';
import DocsLayout from './components/docs/DocsLayout';
import OverviewPage from './pages/docs/product/OverviewPage';
import SsoProductPage from './pages/docs/product/SsoPage';
import RolesPage from './pages/docs/product/RolesPage';
import PasswordResetPage from './pages/docs/product/PasswordResetPage';
import UseCasesPage from './pages/docs/product/UseCasesPage';
import GoogleOAuthPage from './pages/docs/product/GoogleOAuthPage';
import HubSpotIntegrationPage from './pages/docs/product/HubSpotIntegrationPage';
import SignupFlowPage from './pages/docs/product/SignupFlowPage';
import QuickstartPage from './pages/docs/developer/QuickstartPage';
import OAuthPage from './pages/docs/developer/OAuthPage';
import UserManagementApiPage from './pages/docs/developer/UserManagementApiPage';
import PasswordResetApiPage from './pages/docs/developer/PasswordResetApiPage';
import SessionManagementPage from './pages/docs/developer/SessionManagementPage';
import TestAccountsPage from './pages/docs/developer/TestAccountsPage';
import ProfilePicturesApiPage from './pages/docs/developer/ProfilePicturesApiPage';
import OrganizationApiPage from './pages/docs/developer/OrganizationApiPage';
import InvitationsApiPage from './pages/docs/developer/InvitationsApiPage';
import SsoIntegrationPage from './pages/docs/SsoIntegrationPage';
import MultiOrganizationIntegrationPage from './pages/docs/MultiOrganizationIntegrationPage';
import DeepLinkingGuidePage from './pages/docs/DeepLinkingGuidePage';
import ReleaseNotesIndexPage from './pages/docs/release-notes/ReleaseNotesIndexPage';
import ReleaseNote_2025_12_02 from './pages/docs/ReleaseNote_2025_12_02';
import ReleaseNote_2025_12_03 from './pages/docs/ReleaseNote_2025_12_03';
import ReleaseNote_v102 from './pages/docs/ReleaseNote_v102';
import ReleaseNote_v103 from './pages/docs/ReleaseNote_v103';
import ReleaseNote_v104 from './pages/docs/ReleaseNote_v104';
import ReleaseNote_v105 from './pages/docs/ReleaseNote_v105';
import ReleaseNote_v106 from './pages/docs/ReleaseNote_v106';
import ReleaseNote_v107 from './pages/docs/ReleaseNote_v107';
import ReleaseNote_v108 from './pages/docs/ReleaseNote_v108';
import ReleaseNote_v109 from './pages/docs/ReleaseNote_v109';
import ReleaseNote_v1010 from './pages/docs/release-notes/ReleaseNote_v1010';
import ReleaseNote_v1011 from './pages/docs/release-notes/ReleaseNote_v1011';
import ReleaseNote_v1012 from './pages/docs/release-notes/ReleaseNote_v1012';
import ReleaseNote_v1013 from './pages/docs/release-notes/ReleaseNote_v1013';
import ReleaseNote_v1014 from './pages/docs/release-notes/ReleaseNote_v1014';
import ReleaseNote_v110 from './pages/docs/release-notes/ReleaseNote_v110';
import UserActivityApiPage from './pages/docs/developer/UserActivityApiPage';
import UserEmailsApiPage from './pages/docs/developer/UserEmailsApiPage';
import S2SAuthenticationPage from './pages/docs/developer/S2SAuthenticationPage';
import SsoMeApiPage from './pages/docs/developer/SsoMeApiPage';
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
import PortalRedirectEnforcer from './components/PortalRedirectEnforcer';
import AccountLayout from './components/AccountLayout';
import HomePage from './pages/account/HomePage';
import MyAppsPage from './pages/account/MyAppsPage';
import MyProfilePage from './pages/account/MyProfilePage';
import SuperAdminToolsPage from './pages/account/SuperAdminToolsPage';
import CandidateUsersPage from './pages/account/CandidateUsersPage';
import AnalyticsIndexPage from './pages/account/AnalyticsIndexPage';
import AISearchReportPage from './pages/account/analytics/AISearchReportPage';
import AppUsageReportPage from './pages/account/analytics/AppUsageReportPage';
import LoginTrafficReportPage from './pages/account/analytics/LoginTrafficReportPage';
import EngagementReportPage from './pages/account/analytics/EngagementReportPage';
import AdoptionReportPage from './pages/account/analytics/AdoptionReportPage';
import OrgHealthReportPage from './pages/account/analytics/OrgHealthReportPage';
import SessionsReportPage from './pages/account/analytics/SessionsReportPage';
import SecurityReportPage from './pages/account/analytics/SecurityReportPage';
import InvitationsReportPage from './pages/account/analytics/InvitationsReportPage';
import StickinessReportPage from './pages/account/analytics/StickinessReportPage';
import TimeToValueReportPage from './pages/account/analytics/TimeToValueReportPage';
import './App.css';

// Redirect component for old /admin/users/:userId route to new /users/:userId
function UserDetailRedirect() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  return <Navigate to={`/users/${userId}`} state={location.state} replace />;
}

// Redirect component for /organization to first organization
// Uses cached slug for instant navigation on repeat visits
function OrganizationRedirect() {
  // Try cached slug first for instant redirect
  const cachedSlug = React.useMemo(() => {
    try {
      return localStorage.getItem('lastOrgSlug');
    } catch {
      return null;
    }
  }, []);
  
  const [orgSlug, setOrgSlug] = React.useState<string | null>(cachedSlug);
  const [checked, setChecked] = React.useState(!!cachedSlug);
  
  React.useEffect(() => {
    // If we have a cached slug, redirect immediately (no fetch needed)
    if (cachedSlug) {
      return;
    }
    
    // Otherwise fetch organizations
    const fetchOrg = async () => {
      try {
        const { default: OrganizationsService } = await import('./services/organizationsService');
        const orgs = await OrganizationsService.getMyOrganizations();
        if (orgs.length > 0) {
          const slug = orgs[0].slug;
          setOrgSlug(slug);
          // Cache for future instant redirects
          try {
            localStorage.setItem('lastOrgSlug', slug);
          } catch {}
        }
      } catch (error) {
        console.error('Failed to fetch organizations:', error);
      } finally {
        setChecked(true);
      }
    };
    fetchOrg();
  }, [cachedSlug]);
  
  // Redirect immediately if we have a slug (cached or fetched)
  if (orgSlug) {
    return <Navigate to={`/organization/${orgSlug}`} replace />;
  }
  
  // Show minimal loading only when fetching (not when using cache)
  if (!checked) {
    return null; // No spinner - just brief empty state before redirect
  }
  
  // No organizations found, go to profile
  return <Navigate to="/account/profile" replace />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SnackbarProvider>
          <Router>
            <PortalRedirectEnforcer>
            <div className="App">
              <Routes>
                <Route 
                  path="/login" 
                  element={<LoginPageMUI />} 
                />
                <Route 
                  path="/logout" 
                  element={<LogoutPage />} 
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
                  path="/auth/google/callback" 
                  element={<GoogleAuthCallbackPage />} 
                />
                <Route 
                  path="/signup/path" 
                  element={<GoogleSignupPathPage />} 
                />
                <Route 
                  path="/reset-password" 
                  element={<ResetPasswordPage />} 
                />
                <Route 
                  path="/forgot-password" 
                  element={<ForgotPasswordPage />} 
                />
                <Route 
                  path="/resend-verification" 
                  element={<ResendVerificationPage />} 
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
                  path="/signup-success" 
                  element={<SignupSuccessPage />} 
                />
                <Route 
                  path="/google-signup-success" 
                  element={
                    <ProtectedRoute>
                      <GoogleSignupSuccessPage />
                    </ProtectedRoute>
                  } 
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
                      <SuperAdminRoute>
                        <InternalTeamInvitationManagementPage />
                      </SuperAdminRoute>
                    </ProtectedRoute>
                  } 
                />
                {/* Organization routes - all wrapped in AccountLayout for smooth navigation */}
                <Route 
                  path="/organization" 
                  element={
                    <ProtectedRoute>
                      <SuperAdminRoute>
                        <AccountLayout />
                      </SuperAdminRoute>
                    </ProtectedRoute>
                  }
                >
                  {/* Redirect /organization to first organization */}
                  <Route index element={<OrganizationRedirect />} />
                  <Route path=":slug" element={<MyOrganizationPage />} />
                </Route>
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <SuperAdminRoute>
                        <AccountLayout />
                      </SuperAdminRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/account/profile" replace />} />
                  <Route path="apps" element={<MyAppsPage />} />
                  <Route path="profile" element={<MyProfilePage />} />
                  <Route path="security" element={<Navigate to="/account/profile" replace />} />
                </Route>
                {/* User Detail Page - super admin only */}
                <Route 
                  path="/users/:userId" 
                  element={
                    <ProtectedRoute>
                      <SuperAdminRoute>
                        <AccountLayout />
                      </SuperAdminRoute>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<UserDetailPage />} />
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
                    path="analytics" 
                    element={
                      <SuperAdminRoute>
                        <AnalyticsIndexPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/ai-search" 
                    element={
                      <SuperAdminRoute>
                        <AISearchReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/app-usage" 
                    element={
                      <SuperAdminRoute>
                        <AppUsageReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/login-traffic" 
                    element={
                      <SuperAdminRoute>
                        <LoginTrafficReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/engagement" 
                    element={
                      <SuperAdminRoute>
                        <EngagementReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/adoption" 
                    element={
                      <SuperAdminRoute>
                        <AdoptionReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/org-health" 
                    element={
                      <SuperAdminRoute>
                        <OrgHealthReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/sessions" 
                    element={
                      <SuperAdminRoute>
                        <SessionsReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/security" 
                    element={
                      <SuperAdminRoute>
                        <SecurityReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/invitations" 
                    element={
                      <SuperAdminRoute>
                        <InvitationsReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/stickiness" 
                    element={
                      <SuperAdminRoute>
                        <StickinessReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="analytics/time-to-value" 
                    element={
                      <SuperAdminRoute>
                        <TimeToValueReportPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="audit-logs" 
                    element={
                      <SuperAdminRoute>
                        <AuditLogsPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="organizations" 
                    element={
                      <SuperAdminRoute>
                        <OrganizationManagementPage />
                      </SuperAdminRoute>
                    } 
                  />
                  <Route 
                    path="users" 
                    element={
                      <SuperAdminRoute>
                        <UserManagement />
                      </SuperAdminRoute>
                    } 
                  />
                  {/* Redirect old admin user detail route to new location */}
                  <Route 
                    path="users/:userId" 
                    element={<UserDetailRedirect />}
                  />
                </Route>
                <Route path="/test" element={<IntegratedTestSuite />} />
                <Route path="/test/logout-callback" element={<TestLogoutCallback />} />
                <Route path="/portal-redirect" element={<PortalRedirectPage />} />
                
                {/* Documentation with sidebar layout */}
                <Route path="/docs" element={<DocsLayout />}>
                  <Route index element={<Navigate to="/docs/product/overview" replace />} />
                  {/* Product Guide */}
                  <Route path="product/overview" element={<OverviewPage />} />
                  <Route path="product/signup-flow" element={<SignupFlowPage />} />
                  <Route path="product/sso" element={<SsoProductPage />} />
                  <Route path="product/google-oauth" element={<GoogleOAuthPage />} />
                  <Route path="product/hubspot" element={<HubSpotIntegrationPage />} />
                  <Route path="product/roles" element={<RolesPage />} />
                  <Route path="product/password-reset" element={<PasswordResetPage />} />
                  <Route path="product/use-cases" element={<UseCasesPage />} />
                  {/* Developer Guide */}
                  <Route path="developer/quickstart" element={<QuickstartPage />} />
                  <Route path="developer/oauth" element={<OAuthPage />} />
                  <Route path="developer/user-management" element={<UserManagementApiPage />} />
                  <Route path="developer/organization-api" element={<OrganizationApiPage />} />
                  <Route path="developer/invitations-api" element={<InvitationsApiPage />} />
                  <Route path="developer/profile-pictures" element={<ProfilePicturesApiPage />} />
                  <Route path="developer/user-activity" element={<UserActivityApiPage />} />
                  <Route path="developer/user-emails" element={<UserEmailsApiPage />} />
                  <Route path="developer/s2s-authentication" element={<S2SAuthenticationPage />} />
                  <Route path="developer/password-reset-api" element={<PasswordResetApiPage />} />
                  <Route path="developer/session-management" element={<SessionManagementPage />} />
                  <Route path="developer/test-accounts" element={<TestAccountsPage />} />
                  <Route path="developer/sso-integration" element={<SsoIntegrationPage />} />
                  <Route path="developer/sso-me" element={<SsoMeApiPage />} />
                  <Route path="developer/multi-organization" element={<MultiOrganizationIntegrationPage />} />
                  <Route path="developer/deep-linking-guide" element={<DeepLinkingGuidePage />} />
                  {/* Release Notes */}
                  <Route path="release-notes" element={<ReleaseNotesIndexPage />} />
                  <Route path="release-notes/v1.1.0" element={<ReleaseNote_v110 />} />
                  <Route path="release-notes/v1.0.14" element={<ReleaseNote_v1014 />} />
                  <Route path="release-notes/v1.0.13" element={<ReleaseNote_v1013 />} />
                  <Route path="release-notes/v1.0.12" element={<ReleaseNote_v1012 />} />
                  <Route path="release-notes/v1.0.11" element={<ReleaseNote_v1011 />} />
                  <Route path="release-notes/v1.0.10" element={<ReleaseNote_v1010 />} />
                  <Route path="release-notes/v1.0.9" element={<ReleaseNote_v109 />} />
                  <Route path="release-notes/v1.0.8" element={<ReleaseNote_v108 />} />
                  <Route path="release-notes/v1.0.7" element={<ReleaseNote_v107 />} />
                  <Route path="release-notes/v1.0.6" element={<ReleaseNote_v106 />} />
                  <Route path="release-notes/v1.0.5" element={<ReleaseNote_v105 />} />
                  <Route path="release-notes/v1.0.4" element={<ReleaseNote_v104 />} />
                  <Route path="release-notes/v1.0.3" element={<ReleaseNote_v103 />} />
                  <Route path="release-notes/v1.0.2" element={<ReleaseNote_v102 />} />
                  <Route path="release-notes/v1.0.1" element={<ReleaseNote_2025_12_03 />} />
                  <Route path="release-notes/v1.0.0" element={<ReleaseNote_2025_12_02 />} />
                </Route>
                
                <Route path="/" element={<SessionAwareRedirect />} />
                <Route path="*" element={<SessionAwareRedirect />} />
              </Routes>
            </div>
            </PortalRedirectEnforcer>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
