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

export function getAccessTokenCookieOptions(maxAgeMs: number = 72 * 60 * 60 * 1000): CookieOptions {
  const secure = isSecureContext();
  const domain = getSharedCookieDomain();
  
  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
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
  
  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
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
  
  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
  };
  
  if (domain) {
    options.domain = domain;
  }
  
  return options;
}
