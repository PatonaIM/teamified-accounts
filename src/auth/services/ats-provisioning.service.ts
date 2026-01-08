import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AtsProvisioningResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export interface AtsProvisioningData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
}

@Injectable()
export class AtsProvisioningService {
  private readonly logger = new Logger(AtsProvisioningService.name);

  constructor(private configService: ConfigService) {}

  async provisionAtsAccess(data: AtsProvisioningData): Promise<AtsProvisioningResult> {
    const atsPortalUrl = this.configService.get<string>('VITE_PORTAL_URL_ATS') || 'https://teamified-ats.replit.app';
    
    try {
      this.logger.log(`Provisioning ATS access for user ${data.email} in organization ${data.organizationSlug}`);

      const redirectUrl = `${atsPortalUrl}/dashboard?org=${encodeURIComponent(data.organizationSlug)}&welcome=true`;
      
      this.logger.log(`ATS provisioning successful for ${data.email}, redirect URL: ${redirectUrl}`);
      
      return {
        success: true,
        redirectUrl,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`ATS provisioning failed for ${data.email}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
