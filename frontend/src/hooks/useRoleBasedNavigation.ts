import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  description?: string;
}

export const useRoleBasedNavigation = () => {
  const { user } = useAuth();

  // Get onboarding status directly from user object (no API call needed!)
  const hasOnboardingRecord = user?.hasOnboardingRecord || false;

  const allNavigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: null, // Will be set by the component
      roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate'],
      description: 'Overview and quick access to key information'
    },
    {
      title: 'Jobs',
      href: '/jobs',
      icon: null,
      roles: ['candidate', 'eor', 'admin', 'account_manager'],
      description: 'Browse and apply for open job positions'
    },
    // Onboarding - only show if user has employment record in onboarding status
    ...(hasOnboardingRecord ? [{
      title: 'Onboarding',
      href: '/onboarding',
      icon: null,
      roles: ['candidate', 'eor'],
      description: 'Complete your onboarding profile and documents'
    }] : []),
    {
      title: 'Timesheets',
      href: '/timesheets',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor'],
      description: 'Submit and track timesheet entries'
    },
    {
      title: 'Leave',
      href: '/leave',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'hr_manager_client', 'eor'],
      description: 'Request and manage leave applications'
    },
    {
      title: 'My Documents',
      href: '/documents',
      icon: null,
      roles: ['admin', 'hr', 'candidate', 'eor', 'payroll_admin'],
      description: 'Upload and manage your documents (CVs, identity, employment, education, payslips, tax documents)'
    },
    {
      title: 'User Management',
      href: '/users',
      icon: null,
      roles: ['admin', 'hr', 'account_manager'],
      description: 'Manage users, roles, permissions, and invitations'
    },
    {
      title: 'HR Onboarding',
      href: '/hr/onboarding',
      icon: null,
      roles: ['admin', 'hr'],
      description: 'Review and verify candidate onboarding documents'
    },
    {
      title: 'Employment Records',
      href: '/employment-records',
      icon: null,
      roles: ['admin', 'hr', 'hr_manager_client', 'account_manager'],
      description: 'View and manage employment records'
    },
    {
      title: 'Salary History',
      href: '/salary-history',
      icon: null,
      roles: ['admin', 'hr'],
      description: 'View and manage salary history across all users'
    },
    {
      title: 'Clients',
      href: '/admin/clients',
      icon: null,
      roles: ['admin', 'hr'],
      description: 'Manage client organizations and customer data'
    },
    {
      title: 'Payroll',
      href: '/payroll-administration',
      icon: null,
      roles: ['admin', 'hr'],
      description: 'Process payroll, configure settings, and manage bulk operations'
    },
    {
      title: 'Job Requests',
      href: '/hiring/job-requests',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client'],
      description: 'Manage job requisitions, candidates, and hiring stages'
    },
    {
      title: 'Interviews',
      href: '/hiring/interviews',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client'],
      description: 'Schedule and manage candidate interviews'
    },
    {
      title: 'Talent Pool',
      href: '/hiring/talent-pool',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client'],
      description: 'Search and manage the candidate talent pool'
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: null,
      roles: ['admin', 'hr', 'account_manager', 'recruiter', 'hr_manager_client', 'eor', 'candidate'],
      description: 'Manage your personal information and settings'
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: null,
      roles: ['admin', 'hr', 'eor', 'candidate', 'account_manager', 'hr_manager_client'],
      description: 'Manage themes, SSO applications, and portal preferences'
    },
    {
      title: 'Team Connect',
      href: '/sso/launch/client_266b2fd552de8dd40c0414285e1b597f',
      icon: null,
      roles: ['admin', 'hr', 'eor', 'candidate', 'account_manager', 'hr_manager_client', 'recruiter'],
      description: 'Internal team collaboration and communication platform'
    }
  ];

  const filteredNavigationItems = useMemo(() => {
    if (!user?.roles) {
      return [];
    }

    const filtered = allNavigationItems.filter(item => {
      return item.roles.some(role => user.roles.includes(role));
    });
    
    return filtered;
  }, [user?.roles, hasOnboardingRecord]);

  const canAccessPage = (path: string): boolean => {
    if (!user?.roles) return false;

    const item = allNavigationItems.find(navItem => navItem.href === path);
    if (!item) return false;

    return item.roles.some(role => user.roles.includes(role));
  };

  const getRoleBasedDescription = (path: string): string => {
    const item = allNavigationItems.find(navItem => navItem.href === path);
    return item?.description || '';
  };

  return {
    navigationItems: filteredNavigationItems,
    canAccessPage,
    getRoleBasedDescription,
    userRoles: user?.roles || []
  };
};
