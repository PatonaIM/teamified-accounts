import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
import { ClientListResponseDto } from './dto/client-list-response.dto';

@ApiTags('Clients')
@Controller('v1/clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all clients with filtering and statistics', 
    description: 'Retrieve a paginated list of clients with optional search/filter and aggregated statistics' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of clients with statistics retrieved successfully',
    type: ClientListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number (default: 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Items per page (default: 20, max: 100)',
    example: 20
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search by client name (case-insensitive)',
    example: 'Acme'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ['active', 'inactive', 'all'], 
    description: 'Filter by client status (default: all)',
    example: 'active'
  })
  async findAll(@Query() queryDto: ClientQueryDto): Promise<ClientListResponseDto> {
    return await this.clientsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID', description: 'Retrieve a specific client by their unique identifier' })
  @ApiResponse({ status: 200, description: 'Client retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async findOne(@Param('id') id: string): Promise<{ client: Client }> {
    const client = await this.clientsService.findOne(id);
    return { client };
  }

  @Post()
  @ApiOperation({ summary: 'Create new client', description: 'Create a new client in the system' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data or duplicate client name' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async create(@Body() createClientDto: CreateClientDto): Promise<{ client: Client }> {
    const client = await this.clientsService.create(createClientDto);
    return { client };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client', description: 'Update an existing client by their unique identifier' })
  @ApiResponse({ status: 200, description: 'Client updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<{ client: Client }> {
    const client = await this.clientsService.update(id, updateClientDto);
    return { client };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client', description: 'Delete a client from the system' })
  @ApiResponse({ status: 200, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT token' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.clientsService.remove(id);
    return { message: 'Client deleted successfully' };
  }
}
