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
  const nodeEnv = process.env.NODE_ENV;
  const forceSharedDomain = process.env.SSO_SHARED_COOKIE_DOMAIN;
  
  if (forceSharedDomain) {
    return forceSharedDomain;
  }
  
  if (nodeEnv === 'production') {
    return TEAMIFIED_PARENT_DOMAIN;
  }
  
  return undefined;
}

export function getAccessTokenCookieOptions(maxAgeMs: number = 72 * 60 * 60 * 1000): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = getSharedCookieDomain();
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
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
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = getSharedCookieDomain();
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
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
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = getSharedCookieDomain();
  
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  };
  
  if (domain) {
    options.domain = domain;
  }
  
  return options;
}
