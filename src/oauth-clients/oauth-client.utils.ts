import { OAuthClient, RedirectUri, EnvironmentType } from './entities/oauth-client.entity';

function extractUri(entry: any): string | null {
  if (!entry) return null;
  
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"uri"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.uri === 'string') {
          return parsed.uri;
        }
      } catch {
        return entry;
      }
    }
    return entry;
  }
  
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    if (typeof entry.uri === 'string') {
      return entry.uri;
    }
  }
  
  return null;
}

export function getUriStrings(client: OAuthClient): string[] {
  if (!client.redirect_uris || !Array.isArray(client.redirect_uris)) {
    return [];
  }
  return client.redirect_uris
    .map((r: any) => extractUri(r))
    .filter((uri): uri is string => uri !== null && uri.trim() !== '');
}

function extractUriWithEnvironment(entry: any): { uri: string; environment: EnvironmentType | null } | null {
  if (!entry) return null;
  
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"uri"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.uri === 'string') {
          return {
            uri: parsed.uri,
            environment: parsed.environment || null,
          };
        }
      } catch {
        return { uri: entry, environment: null };
      }
    }
    return { uri: entry, environment: null };
  }
  
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    if (typeof entry.uri === 'string') {
      return {
        uri: entry.uri,
        environment: entry.environment || null,
      };
    }
  }
  
  return null;
}

export function getUrisByEnvironment(client: OAuthClient, environment: EnvironmentType): string[] {
  if (!client.redirect_uris || !Array.isArray(client.redirect_uris)) {
    return [];
  }
  return client.redirect_uris
    .map((r: any) => extractUriWithEnvironment(r))
    .filter((item): item is { uri: string; environment: EnvironmentType | null } => 
      item !== null && 
      item.uri.trim() !== '' &&
      (item.environment === null || item.environment === environment)
    )
    .map(item => item.uri);
}

export function validateRedirectUri(client: OAuthClient, redirectUri: string): boolean {
  const uriStrings = getUriStrings(client);
  return uriStrings.includes(redirectUri);
}
