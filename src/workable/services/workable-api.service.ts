import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WorkableJob {
  id: string;
  title: string;
  shortcode: string;
  description: string;
  requirements: string;
  benefits: string;
  location: {
    location_str: string;
    country: string;
    country_code: string;
    region: string;
    region_code: string;
    city: string;
    zip_code: string;
    telecommuting: boolean;
  };
  department: string;
  employment_type: string;
  experience: string;
  function: string;
  industry: string;
  education: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface WorkableJobsResponse {
  jobs: WorkableJob[];
  paging: {
    next: string | null;
  };
}

export interface WorkableApplicationForm {
  form_fields: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    required: boolean;
    fields?: any[];
  }>;
}

@Injectable()
export class WorkableApiService {
  private readonly logger = new Logger(WorkableApiService.name);
  private readonly baseUrl: string;
  private readonly authHeader: Record<string, string>;

  constructor(private configService: ConfigService) {
    const subdomain = this.configService.get<string>('WORKABLE_SUBDOMAIN');
    const apiToken = this.configService.get<string>('WORKABLE_API_TOKEN');

    if (!subdomain || !apiToken) {
      this.logger.warn('Workable configuration missing. Set WORKABLE_SUBDOMAIN and WORKABLE_API_TOKEN. Workable features will be disabled.');
      this.baseUrl = '';
      this.authHeader = {};
      return;
    }

    this.baseUrl = `https://${subdomain}.workable.com/spi/v3`;
    this.authHeader = {
      Authorization: `Bearer ${apiToken}`,
    };

    this.logger.log('Workable API Service initialized');
  }

  /**
   * Check if Workable API is configured
   */
  private isConfigured(): boolean {
    return !!this.baseUrl && !!this.authHeader.Authorization;
  }

  /**
   * Throw error if not configured
   */
  private ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Workable API is not configured. Please set WORKABLE_SUBDOMAIN and WORKABLE_API_TOKEN environment variables.',
          error: 'Service Unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Fetch from Workable API with error handling
   */
  private async wFetch<T>(path: string, init?: RequestInit): Promise<T> {
    this.ensureConfigured();
    const url = `${this.baseUrl}${path}`;
    
    try {
      this.logger.debug(`Fetching from Workable API: ${path}`);
      
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeader,
          ...(init?.headers || {}),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Workable API error: ${response.status} ${response.statusText}`,
          errorText,
        );
        
        throw new HttpException(
          {
            statusCode: response.status,
            message: `Workable API error: ${response.statusText}`,
            error: 'Workable API Error',
          },
          response.status,
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`Failed to fetch from Workable API: ${error.message}`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: 'Failed to communicate with Workable API',
          error: 'Bad Gateway',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Get list of published jobs
   */
  async getJobs(params: {
    offset?: string;
    limit?: string;
    search?: string;
  }): Promise<WorkableJobsResponse> {
    const { offset = '0', limit = '12', search } = params;
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      state: 'published',
      limit: limit,
      offset: offset,
    });

    if (search) {
      queryParams.append('query', search);
    }

    const path = `/jobs?${queryParams.toString()}`;
    const response = await this.wFetch<WorkableJobsResponse>(path);
    
    // Sort jobs by created_at descending (newest first)
    if (response.jobs && Array.isArray(response.jobs)) {
      response.jobs.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    }
    
    return response;
  }

  /**
   * Get job details by shortcode
   */
  async getJobDetails(shortcode: string): Promise<WorkableJob> {
    if (!shortcode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Job shortcode is required',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.wFetch<WorkableJob>(`/jobs/${shortcode}`);
  }

  /**
   * Get application form for a job
   */
  async getApplicationForm(shortcode: string): Promise<WorkableApplicationForm> {
    if (!shortcode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Job shortcode is required',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.wFetch<WorkableApplicationForm>(`/jobs/${shortcode}/application_form`);
  }

  /**
   * Submit application to Workable
   */
  async submitApplication(
    shortcode: string,
    applicationData: any,
  ): Promise<any> {
    if (!shortcode) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Job shortcode is required',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(`Submitting application for job ${shortcode}`);

    return this.wFetch<any>(`/jobs/${shortcode}/candidates`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }
}

