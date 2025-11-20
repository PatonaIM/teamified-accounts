import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../auth/entities/user.entity';

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    
    if (request.currentUserEntity) {
      return request.currentUserEntity;
    }
    
    const user = request.user;
    
    return {
      id: user?.sub || user?.id,
      email: user?.email,
      role: user?.roles?.[0] || user?.role,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    };
  },
);