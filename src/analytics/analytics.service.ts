import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { OrganizationMember } from '../organizations/entities/organization-member.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UserAnalyticsResponseDto } from './dto/user-analytics-response.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(OrganizationMember)
    private readonly organizationMemberRepository: Repository<OrganizationMember>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async getUserAnalytics(organizationId?: string): Promise<UserAnalyticsResponseDto> {
    const userQuery = this.userRepository.createQueryBuilder('user');
    
    if (organizationId) {
      userQuery
        .innerJoin('organization_members', 'om', 'om.user_id = user.id')
        .where('om.organization_id = :organizationId', { organizationId });
    }

    const users = await userQuery.getMany();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const archivedUsers = users.filter(u => u.status === 'archived').length;
    const emailVerifiedCount = users.filter(u => u.emailVerified).length;
    const emailVerificationRate = totalUsers > 0 ? Math.round((emailVerifiedCount / totalUsers) * 100) : 0;

    const roleQuery = this.userRoleRepository.createQueryBuilder('ur');
    if (organizationId) {
      const memberUserIds = await this.organizationMemberRepository
        .find({ where: { organizationId }, select: ['userId'] })
        .then(members => members.map(m => m.userId));
      
      if (memberUserIds.length > 0) {
        roleQuery.where('ur.user_id IN (:...userIds)', { userIds: memberUserIds });
      } else {
        roleQuery.where('1 = 0');
      }
    }

    const roles = await roleQuery.getMany();
    const roleDistribution = this.calculateRoleDistribution(roles, totalUsers);

    const userGrowth = this.calculateUserGrowth(users);
    const registrationTrend = this.calculateRegistrationTrend(users);
    const activeVsInactiveTrend = this.calculateActiveVsInactiveTrend(users);
    const topOrganizations = await this.calculateTopOrganizations(organizationId);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      archivedUsers,
      emailVerificationRate,
      roleDistribution,
      userGrowth,
      registrationTrend,
      activeVsInactiveTrend,
      topOrganizations,
    };
  }

  private calculateRoleDistribution(roles: UserRole[], totalUsers: number) {
    const roleCounts: Record<string, number> = {};
    
    roles.forEach(role => {
      const roleType = role.roleType;
      roleCounts[roleType] = (roleCounts[roleType] || 0) + 1;
    });

    return Object.entries(roleCounts).map(([roleType, count]) => ({
      roleType: roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    }));
  }

  private calculateUserGrowth(users: User[]) {
    const monthlyData: Record<string, { total: number; new: number }> = {};
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
      monthlyData[monthKey] = { total: 0, new: 0 };
    }

    users.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const monthKey = `${monthNames[createdDate.getMonth()]} ${createdDate.getFullYear()}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].new++;
      }
    });

    let cumulativeTotal = 0;
    return Object.entries(monthlyData).map(([month, data]) => {
      cumulativeTotal += data.new;
      return {
        month: month.split(' ')[0],
        totalUsers: cumulativeTotal,
        newUsers: data.new,
      };
    });
  }

  private calculateRegistrationTrend(users: User[]) {
    const dailyData: Record<string, number> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);
      const dateKey = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
      dailyData[dateKey] = 0;
    }

    users.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const dateKey = `${createdDate.getMonth() + 1}/${createdDate.getDate()}`;
      
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey]++;
      }
    });

    return Object.entries(dailyData).map(([date, count]) => ({ date, count }));
  }

  private calculateActiveVsInactiveTrend(users: User[]) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = targetDate;
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      const usersInMonth = users.filter(u => {
        const createdDate = new Date(u.createdAt);
        return createdDate <= monthEnd;
      });

      const active = usersInMonth.filter(u => u.status === 'active').length;
      const inactive = usersInMonth.filter(u => u.status === 'inactive').length;

      trend.push({
        month: monthNames[targetDate.getMonth()],
        active,
        inactive,
      });
    }

    return trend;
  }

  private async calculateTopOrganizations(filterOrganizationId?: string) {
    const query = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('organization_members', 'om', 'om.organization_id = org.id')
      .select('org.id', 'organizationId')
      .addSelect('org.name', 'name')
      .addSelect('COUNT(om.id)', 'memberCount')
      .groupBy('org.id')
      .orderBy('memberCount', 'DESC')
      .limit(8);

    if (filterOrganizationId) {
      query.where('org.id = :filterOrganizationId', { filterOrganizationId });
    }

    const results = await query.getRawMany();
    
    return results.map(r => ({
      organizationId: r.organizationId,
      name: r.name,
      memberCount: parseInt(r.memberCount, 10),
    }));
  }
}
