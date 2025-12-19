import { CookieOptions } from 'express';

export interface SharedCookieConfig {
  domain?: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge?: number;
}

const TEAMIFIED_PARENT_DOMAIN = '.teamified.com';

export function getSharedCookieDomain(): string | undefined {
  const forceSharedDomain = process.env.SSO_SHARED_COOKIE_DOMAIN;
  
  if (forceSharedDomain) {
    return forceSharedDomain;
  }
  
  const baseUrl = process.env.BASE_URL || '';
  
  // Only set domain for teamified.com - this enables cross-subdomain cookie sharing
  // For .replit.app and other public suffixes, we don't set a domain
  // because browsers block cookie domain setting on public suffix list domains
  // The cookie will be "host-only" and work within the same app
  if (baseUrl.includes('teamified.com')) {
    return TEAMIFIED_PARENT_DOMAIN;
  }
  
  // Don't set domain for .replit.app - it's a public suffix
  // Cookies will be host-only (e.g., only for teamified-accounts.replit.app)
  return undefined;
}

function isSecureContext(): boolean {
  const baseUrl = process.env.BASE_URL || '';
  return baseUrl.startsWith('https://') || process.env.NODE_ENV === 'production';
}

function isPublicSuffixDomain(): boolean {
  const baseUrl = process.env.BASE_URL || '';
  // .replit.app, .replit.dev, .herokuapp.com, .vercel.app etc are on the PSL
  // For these domains, we need SameSite=none to allow cross-site cookie sending
  return baseUrl.includes('.replit.app') || 
         baseUrl.includes('.replit.dev') ||
         baseUrl.includes('.herokuapp.com') || 
         baseUrl.includes('.vercel.app');
}

function getSameSitePolicy(): 'lax' | 'strict' | 'none' {
  // For public suffix domains (staging environments), use SameSite=none
  // This allows cross-site requests (from other .replit.app apps) to include cookies
  // Security is maintained via CORS allowlist in main.ts
  if (isPublicSuffixDomain()) {
    return 'none';
  }
  
  // For production (.teamified.com), use SameSite=lax
  // Cookies are shared via domain attribute, so same-site policy works fine
  return 'lax';
}

export function getAccessTokenCookieOptions(maxAgeMs: number = 72 * 60 * 60 * 1000): CookieOptions {
  const secure = isSecureContext();
  const domain = getSharedCookieDomain();
  const sameSite = getSameSitePolicy();
  
  // SameSite=none requires Secure flag
  const effectiveSecure = sameSite === 'none' ? true : secure;
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: effectiveSecure,
    sameSite,
    path: '/',
    maxAge: maxAgeMs,
  };
  
  if (domain) {
    options.domain = domain;
  }
  
  return options;
}

export function getRefreshTokenCookieOptions(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): CookieOptions {
  const secure = isSecureContext();
  const domain = getSharedCookieDomain();
  const sameSite = getSameSitePolicy();
  
  // SameSite=none requires Secure flag
  const effectiveSecure = sameSite === 'none' ? true : secure;
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: effectiveSecure,
    sameSite,
    path: '/',
    maxAge: maxAgeMs,
  };
  
  if (domain) {
    options.domain = domain;
  }
  
  return options;
}

export function getClearCookieOptions(): CookieOptions {
  const secure = isSecureContext();
  const domain = getSharedCookieDomain();
  const sameSite = getSameSitePolicy();
  
  // SameSite=none requires Secure flag
  const effectiveSecure = sameSite === 'none' ? true : secure;
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: effectiveSecure,
    sameSite,
    path: '/',
  };
  
  if (domain) {
    options.domain = domain;
  }
  
  return options;
}

export function getTrustedOrigins(): string[] {
  // Parse trusted origins from environment variable
  // Format: comma-separated list of origins
  const trustedOriginsEnv = process.env.TRUSTED_ORIGINS || '';
  
  if (trustedOriginsEnv) {
    return trustedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  
  // Default trusted origins for Teamified apps
  const defaultOrigins = [
    // Production
    'https://accounts.teamified.com',
    'https://hris.teamified.com',
    'https://teamconnect.teamified.com',
    'https://jobs.teamified.com',
    'https://ats.teamified.com',
    'https://alexia.teamified.com',
  ];
  
  return defaultOrigins;
}

export function isPublicSuffix(): boolean {
  return isPublicSuffixDomain();
}
