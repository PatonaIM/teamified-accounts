export const isPortalRedirectEnabled = (): boolean => {
  const flag = import.meta.env.VITE_ENABLE_PORTAL_REDIRECTS;
  if (flag === '0' || flag === 'false' || flag === 'off') {
    return false;
  }
  return true;
};
