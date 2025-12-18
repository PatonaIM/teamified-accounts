import { OAuthClient, RedirectUri, EnvironmentType } from './entities/oauth-client.entity';

export function getUriStrings(client: OAuthClient): string[] {
  if (!client.redirect_uris || !Array.isArray(client.redirect_uris)) {
    return [];
  }
  return client.redirect_uris.map((r: RedirectUri | string) => 
    typeof r === 'string' ? r : r.uri
  );
}

export function getUrisByEnvironment(client: OAuthClient, environment: EnvironmentType): string[] {
  if (!client.redirect_uris || !Array.isArray(client.redirect_uris)) {
    return [];
  }
  return client.redirect_uris
    .filter((r: RedirectUri | string) => typeof r !== 'string' && r.environment === environment)
    .map((r: RedirectUri | string) => (r as RedirectUri).uri);
}

export function validateRedirectUri(client: OAuthClient, redirectUri: string): boolean {
  const uriStrings = getUriStrings(client);
  return uriStrings.includes(redirectUri);
}
