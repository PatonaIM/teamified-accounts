import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    if (!request.user || !request.user.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = request.user.sub;
    
    const fullUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'organizationMembers'],
    });

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    request.currentUserEntity = fullUser;
    
    return true;
  }
}
