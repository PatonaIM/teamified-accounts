import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from '../auth/entities/user.entity';
import { ClientQueryDto } from './dto/client-query.dto';
import { ClientListResponseDto, PaginationInfo } from './dto/client-list-response.dto';
import { ClientStatisticsDto } from './dto/client-statistics.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(queryDto: ClientQueryDto): Promise<ClientListResponseDto> {
    const { page, limit, search, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.clientsRepository.createQueryBuilder('client');

    if (status && status !== 'all') {
      queryBuilder.andWhere('client.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('client.name ILIKE :search', { search: `%${search}%` });
    }

    queryBuilder
      .orderBy('client.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [clients, total] = await queryBuilder.getManyAndCount();

    const statistics = await this.getStatistics(search, status);

    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
    };

    return {
      clients,
      statistics,
      pagination,
    };
  }

  async getStatistics(search?: string, status?: string): Promise<ClientStatisticsDto> {
    // Build base query with filters
    const baseQuery = this.clientsRepository.createQueryBuilder('client');
    
    if (search) {
      baseQuery.andWhere('client.name ILIKE :search', { search: `%${search}%` });
    }
    
    if (status && status !== 'all') {
      baseQuery.andWhere('client.status = :status', { status });
    }

    const totalClients = await baseQuery.getCount();
    
    // Build active query with same filters
    const activeQuery = this.clientsRepository.createQueryBuilder('client');
    activeQuery.where('client.status = :activeStatus', { activeStatus: 'active' });
    if (search) {
      activeQuery.andWhere('client.name ILIKE :search', { search: `%${search}%` });
    }
    // Only count active if status filter allows it
    const activeClients = (!status || status === 'all' || status === 'active')
      ? await activeQuery.getCount()
      : 0;
    
    // Build inactive query with same filters
    const inactiveQuery = this.clientsRepository.createQueryBuilder('client');
    inactiveQuery.where('client.status = :inactiveStatus', { inactiveStatus: 'inactive' });
    if (search) {
      inactiveQuery.andWhere('client.name ILIKE :search', { search: `%${search}%` });
    }
    // Only count inactive if status filter allows it
    const inactiveClients = (!status || status === 'all' || status === 'inactive')
      ? await inactiveQuery.getCount()
      : 0;

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(DISTINCT user.id)', 'count')
      .innerJoin('clients', 'client', 'user.clientId = client.id')
      .where('user.clientId IS NOT NULL');
    
    if (search) {
      userQuery.andWhere('client.name ILIKE :search', { search: `%${search}%` });
    }
    
    if (status && status !== 'all') {
      userQuery.andWhere('client.status = :status', { status });
    }

    const totalUsersResult = await userQuery.getRawOne();
    const totalUsers = parseInt(totalUsersResult?.count || '0', 10);

    return {
      totalClients,
      activeClients,
      inactiveClients,
      totalUsers,
    };
  }

  async findOne(id: string): Promise<Client> {
    return this.clientsRepository.findOne({
      where: { id },
    });
  }

  async create(createClientDto: Partial<Client>): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  async update(id: string, updateClientDto: Partial<Client>): Promise<Client> {
    await this.clientsRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.clientsRepository.delete(id);
  }
}

