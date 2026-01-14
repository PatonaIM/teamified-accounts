export type PortalType = 'accounts' | 'ats' | 'jobseeker';

interface PortalConfig {
  url: string | null;
  name: string;
  required: boolean;
}

const getPortalUrlFromEnv = (portal: 'ats' | 'jobseeker'): string | null => {
  const envVar = portal === 'ats' 
    ? import.meta.env.VITE_PORTAL_URL_ATS 
    : import.meta.env.VITE_PORTAL_URL_JOBSEEKER;
  
  return envVar || null;
};

const portalConfigs: Record<PortalType, PortalConfig> = {
  accounts: {
    url: null,
    name: 'Teamified Accounts',
    required: false,
  },
  ats: {
    url: getPortalUrlFromEnv('ats'),
    name: 'ATS Portal',
    required: true,
  },
  jobseeker: {
    url: getPortalUrlFromEnv('jobseeker'),
    name: 'Jobseeker Portal',
    required: true,
  },
};

const missingPortals: string[] = [];

Object.entries(portalConfigs).forEach(([key, config]) => {
  if (config.required && !config.url) {
    missingPortals.push(`VITE_PORTAL_URL_${key.toUpperCase()}`);
  }
});

if (missingPortals.length > 0) {
  console.error(
    `[Portal Config] Missing required environment variables: ${missingPortals.join(', ')}. ` +
    `Portal redirects will be disabled until these are configured.`
  );
}

export const isPortalConfigValid = (): boolean => {
  return missingPortals.length === 0;
};

export const getMissingPortalVariables = (): string[] => {
  return [...missingPortals];
};

export const getPortalUrl = (preferredPortal: PortalType | undefined): string | null => {
  if (!preferredPortal || preferredPortal === 'accounts') {
    return null;
  }

  const config = portalConfigs[preferredPortal];
  if (!config || !config.url) {
    return null;
  }

  return config.url;
};

export const getPortalName = (preferredPortal: PortalType | undefined): string => {
  if (!preferredPortal) {
    return 'your portal';
  }

  const config = portalConfigs[preferredPortal];
  return config?.name || 'your portal';
};

export const validatePortalConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  Object.entries(portalConfigs).forEach(([key, config]) => {
    if (config.required && !config.url) {
      errors.push(`Missing VITE_PORTAL_URL_${key.toUpperCase()}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
