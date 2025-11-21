import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    console.log('CurrentUser decorator - request.user:', {
      id: request.user?.id,
      sub: request.user?.sub,
      email: request.user?.email,
      keys: request.user ? Object.keys(request.user) : 'no user',
    });
    return request.user;
  },
);