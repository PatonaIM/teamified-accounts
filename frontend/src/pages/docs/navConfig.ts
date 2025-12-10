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
      { title: 'Single Sign-On (SSO)', path: '/docs/product/sso' },
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
      { title: 'SSO Integration', path: '/docs/sso-integration' },
      { title: 'User Management API', path: '/docs/developer/user-management' },
      { title: 'Organization API', path: '/docs/developer/organization-api' },
      { title: 'Profile Pictures API', path: '/docs/developer/profile-pictures' },
      { title: 'User Activity API', path: '/docs/developer/user-activity' },
      { title: 'Password Reset API', path: '/docs/developer/password-reset-api' },
      { title: 'Deep Linking Guide', path: '/docs/deep-linking-guide' },
      { title: 'Multi-Organization', path: '/docs/multi-organization' },
      { title: 'Test Accounts', path: '/docs/developer/test-accounts' },
    ],
  },
  {
    title: 'Release Notes',
    icon: 'NewReleases',
    items: [
      { title: 'All Releases', path: '/docs/release-notes' },
      { title: 'v1.0.4 - Dec 13, 2025', path: '/docs/release-notes/2025-12-13' },
      { title: 'v1.0.3 - Dec 5, 2025', path: '/docs/release-notes/2025-12-05' },
      { title: 'v1.0.2 - Dec 4, 2025', path: '/docs/release-notes/2025-12-04' },
      { title: 'v1.0.1 - Dec 3, 2025', path: '/docs/release-notes/2025-12-03' },
      { title: 'v1.0.0 - Dec 2, 2025', path: '/docs/release-notes/2025-12-02' },
    ],
  },
];
