export interface NavItem {
  title: string;
  path: string;
  icon?: string;
}

export interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

export const docsNavConfig: NavSection[] = [
  {
    title: 'Product Guide',
    icon: 'Business',
    items: [
      { title: 'Platform Overview', path: '/docs/product/overview' },
      { title: 'Signup Flow', path: '/docs/product/signup-flow' },
      { title: 'Single Sign-On (SSO)', path: '/docs/product/sso' },
      { title: 'Google Sign-In', path: '/docs/product/google-oauth' },
      { title: 'HubSpot Integration', path: '/docs/product/hubspot' },
      { title: 'Roles & Permissions', path: '/docs/product/roles' },
      { title: 'Password Reset & Recovery', path: '/docs/product/password-reset' },
      { title: 'Common Use Cases', path: '/docs/product/use-cases' },
    ],
  },
  {
    title: 'Developer Guide',
    icon: 'Code',
    items: [
      { title: 'Quick Start', path: '/docs/developer/quickstart' },
      { title: 'OAuth 2.0 Configuration', path: '/docs/developer/oauth' },
      { title: 'SSO Integration', path: '/docs/developer/sso-integration' },
      { title: 'SSO User Info API', path: '/docs/developer/sso-me' },
      { title: 'User Management API', path: '/docs/developer/user-management' },
      { title: 'Organization API', path: '/docs/developer/organization-api' },
      { title: 'Invitations API', path: '/docs/developer/invitations-api' },
      { title: 'Profile Pictures API', path: '/docs/developer/profile-pictures' },
      { title: 'User Activity API', path: '/docs/developer/user-activity' },
      { title: 'User Emails API', path: '/docs/developer/user-emails' },
      { title: 'Password Reset API', path: '/docs/developer/password-reset-api' },
      { title: 'Session Management', path: '/docs/developer/session-management' },
      { title: 'S2S Authentication', path: '/docs/developer/s2s-authentication' },
      { title: 'Deep Linking Guide', path: '/docs/developer/deep-linking-guide' },
      { title: 'Multi-Organization', path: '/docs/developer/multi-organization' },
      { title: 'Test Accounts', path: '/docs/developer/test-accounts' },
    ],
  },
  {
    title: 'Release Notes',
    icon: 'NewReleases',
    items: [
      { title: 'All Releases', path: '/docs/release-notes' },
      { title: 'v1.0.14 - Jan 7, 2026', path: '/docs/release-notes/v1.0.14' },
      { title: 'v1.0.13 - Jan 5, 2026', path: '/docs/release-notes/v1.0.13' },
      { title: 'v1.0.12 - Jan 5, 2026', path: '/docs/release-notes/v1.0.12' },
      { title: 'v1.0.11 - Dec 20, 2025', path: '/docs/release-notes/v1.0.11' },
      { title: 'v1.0.10 - Dec 19, 2025', path: '/docs/release-notes/v1.0.10' },
      { title: 'v1.0.9 - Dec 19, 2025', path: '/docs/release-notes/v1.0.9' },
      { title: 'v1.0.8 - Dec 19, 2025', path: '/docs/release-notes/v1.0.8' },
      { title: 'v1.0.7 - Dec 18, 2025', path: '/docs/release-notes/v1.0.7' },
      { title: 'v1.0.6 - Dec 17, 2025', path: '/docs/release-notes/v1.0.6' },
      { title: 'v1.0.5 - Dec 13, 2025', path: '/docs/release-notes/v1.0.5' },
      { title: 'v1.0.4 - Dec 11, 2025', path: '/docs/release-notes/v1.0.4' },
      { title: 'v1.0.3 - Dec 5, 2025', path: '/docs/release-notes/v1.0.3' },
      { title: 'v1.0.2 - Dec 4, 2025', path: '/docs/release-notes/v1.0.2' },
      { title: 'v1.0.1 - Dec 3, 2025', path: '/docs/release-notes/v1.0.1' },
      { title: 'v1.0.0 - Dec 2, 2025', path: '/docs/release-notes/v1.0.0' },
    ],
  },
];
