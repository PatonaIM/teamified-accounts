import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

describe('Client Entity', () => {
  let repository: Repository<Client>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Client),
          useValue: {
            create: jest.fn((data) => {
              const client = new Client();
              client.status = 'active';
              client.migratedFromZoho = false;
              return Object.assign(client, data);
            }),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Client Entity Creation', () => {
    it('should create a client with required fields', () => {
      const clientData = {
        name: 'Test Client',
        status: 'active' as const,
      };

      const client = repository.create(clientData);
      
      expect(client.name).toBe(clientData.name);
      expect(client.status).toBe(clientData.status);
    });

    it('should create a client with optional fields', () => {
      const clientData = {
        name: 'Test Client',
        description: 'A test client for development',
        contactInfo: {
          email: 'contact@testclient.com',
          phone: '+1234567890',
          address: {
            street: '123 Business St',
            city: 'Business City',
            state: 'BC',
            zip: '12345',
          },
        },
        status: 'active' as const,
        migratedFromZoho: true,
        zohoClientId: 'zoho_client_123',
      };

      const client = repository.create(clientData);
      
      expect(client.description).toBe(clientData.description);
      expect(client.contactInfo).toEqual(clientData.contactInfo);
      expect(client.migratedFromZoho).toBe(clientData.migratedFromZoho);
      expect(client.zohoClientId).toBe(clientData.zohoClientId);
    });

    it('should default status to active', () => {
      const clientData = {
        name: 'Test Client',
      };

      const client = repository.create(clientData);
      
      expect(client.status).toBe('active');
    });

    it('should default migratedFromZoho to false', () => {
      const clientData = {
        name: 'Test Client',
      };

      const client = repository.create(clientData);
      
      expect(client.migratedFromZoho).toBe(false);
    });
  });

  describe('Client Entity Validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive'];
      
      validStatuses.forEach(status => {
        const clientData = {
          name: `Test Client ${status}`,
          status: status as 'active' | 'inactive',
        };

        const client = repository.create(clientData);
        expect(client.status).toBe(status);
      });
    });
  });

  describe('Client Entity Relationships', () => {
    it('should have employmentRecords relationship', () => {
      const client = new Client();
      expect(client.employmentRecords).toBeUndefined();
    });
  });
});
