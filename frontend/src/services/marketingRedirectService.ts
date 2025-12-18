import api from './api';

export type MarketingSource = 'marketing' | 'marketing-dev';

export interface MarketingRedirectResult {
  shouldRedirect: boolean;
  redirectUrl?: string;
  fallbackUrl?: string;
  clientId?: string;
  error?: string;
}

export const isMarketingSource = (source: string | null): source is MarketingSource => {
  return source === 'marketing' || source === 'marketing-dev';
};

export const getMarketingSource = (): MarketingSource | null => {
  const storedSource = sessionStorage.getItem('marketing_source');
  if (isMarketingSource(storedSource)) {
    return storedSource;
  }
  return null;
};

export const setMarketingSource = (source: MarketingSource | null): void => {
  if (source) {
    sessionStorage.setItem('marketing_source', source);
  } else {
    sessionStorage.removeItem('marketing_source');
  }
};

export const clearMarketingSource = (): void => {
  sessionStorage.removeItem('marketing_source');
};

export const checkAndHandleMarketingRedirect = async (): Promise<boolean> => {
  const source = getMarketingSource();
  
  if (!source) {
    return false;
  }

  try {
    const response = await api.get<MarketingRedirectResult>('/v1/sso/marketing-redirect', {
      params: { source },
    });

    const result = response.data;

    clearMarketingSource();

    if (result.shouldRedirect && result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return true;
    }

    return false;
  } catch (error) {
    console.error('Marketing redirect check failed:', error);
    clearMarketingSource();
    return false;
  }
};

export const preserveMarketingSourceFromUrl = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');
  
  if (isMarketingSource(source)) {
    setMarketingSource(source);
  }
};
