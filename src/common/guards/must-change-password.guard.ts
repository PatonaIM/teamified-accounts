import {
  Injectable,
  ExecutionContext,
  CanActivate,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_PASSWORD_CHANGE_CHECK = 'skipPasswordChangeCheck';

export const SkipPasswordChangeCheck = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(SKIP_PASSWORD_CHANGE_CHECK, true, descriptor.value);
    } else {
      Reflect.defineMetadata(SKIP_PASSWORD_CHANGE_CHECK, true, target);
    }
    return descriptor || target;
  };
};

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipCheck = this.reflector.getAllAndOverride<boolean>(SKIP_PASSWORD_CHANGE_CHECK, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.mustChangePassword) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Password change required',
        error: 'MUST_CHANGE_PASSWORD',
        details: 'You must change your password before accessing this resource. Please navigate to /force-change-password.',
      });
    }

    return true;
  }
}
