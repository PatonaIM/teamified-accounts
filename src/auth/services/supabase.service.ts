import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

export interface SupabaseTokenPayload {
  sub: string;
  email: string;
  email_confirmed_at?: string;
  email_verified?: boolean;
  phone?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !this.jwtSecret) {
      throw new Error(
        'Missing required Supabase configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_JWT_SECRET',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase service initialized');
  }

  /**
   * Verify and decode a Supabase JWT token
   */
  async verifyToken(token: string): Promise<SupabaseTokenPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as SupabaseTokenPayload;
      return decoded;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new Error('Invalid Supabase token');
    }
  }

  /**
   * Delete a user from Supabase (admin operation)
   * Used when deleting a Portal user to keep systems in sync
   */
  async deleteSupabaseUser(supabaseUserId: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.admin.deleteUser(
        supabaseUserId,
      );

      if (error) {
        throw error;
      }

      this.logger.log(`Deleted Supabase user: ${supabaseUserId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Supabase user ${supabaseUserId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get user from Supabase by ID (admin operation)
   */
  async getSupabaseUser(supabaseUserId: string) {
    try {
      const { data, error } = await this.supabase.auth.admin.getUserById(
        supabaseUserId,
      );

      if (error) {
        throw error;
      }

      return data.user;
    } catch (error) {
      this.logger.error(
        `Failed to get Supabase user ${supabaseUserId}: ${error.message}`,
      );
      throw error;
    }
  }
}
