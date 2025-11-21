import { SetMetadata } from '@nestjs/common';

export const SCOPE_KEY = 'scope';
export const Scope = (scope: string) => SetMetadata(SCOPE_KEY, scope);
