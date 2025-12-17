import { Injectable, Logger } from '@nestjs/common';

const HUBSPOT_API_BASE_URL = 'https://api.hubapi.com';
const HUBSPOT_CONTACTS_ENDPOINT = `${HUBSPOT_API_BASE_URL}/crm/v3/objects/contacts`;

export interface HubSpotContactData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  rolesNeeded?: string;
  howCanWeHelp?: string;
  country?: string;
  website?: string;
  businessDescription?: string;
  industry?: string;
  companySize?: string;
}

export interface HubSpotContactResult {
  success: boolean;
  contactId?: string;
  action?: 'created' | 'updated';
  error?: string;
}

interface HubSpotContactResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

@Injectable()
export class HubSpotService {
  private readonly logger = new Logger(HubSpotService.name);

  private buildContactProperties(data: HubSpotContactData): Record<string, string> {
    const properties: Record<string, string> = {
      email: data.email,
      firstname: data.firstName,
      lastname: data.lastName,
      company: data.company,
      lifecyclestage: 'lead',
      hs_lead_status: 'New Lead',
    };

    const primaryPhone = data.mobileNumber || data.phone;
    if (primaryPhone) {
      properties.phone = primaryPhone;
    }

    if (data.website) {
      properties.website = data.website;
    }

    if (data.businessDescription) {
      properties.message = `Business Description: ${data.businessDescription}`;
    }

    if (data.rolesNeeded) {
      properties.what_roles_do_you_need = data.rolesNeeded;
    }

    if (data.howCanWeHelp) {
      properties.how_can_we_help_you_ = data.howCanWeHelp;
    }

    if (data.companySize) {
      properties.company_size__contact = data.companySize;
    }

    if (data.phoneNumber) {
      properties.secondary_phone = data.phoneNumber;
    }

    return properties;
  }

  private async createContact(
    properties: Record<string, string>,
    accessToken: string,
  ): Promise<HubSpotContactResponse> {
    const response = await fetch(HUBSPOT_CONTACTS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HubSpot API error: ${response.status}`) as Error & {
        status?: number;
        category?: string;
      };
      error.status = response.status;
      error.category = errorData.category || 'UNKNOWN';
      throw error;
    }

    return response.json();
  }

  private async updateContact(
    contactId: string,
    properties: Record<string, string>,
    accessToken: string,
  ): Promise<HubSpotContactResponse> {
    const url = `${HUBSPOT_CONTACTS_ENDPOINT}/${contactId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HubSpot update error: ${response.status}`);
    }

    return response.json();
  }

  private extractExistingContactId(errorMessage: string): string | null {
    const match = errorMessage.match(/Existing ID:\s*(\d+)/);
    return match ? match[1] : null;
  }

  async createOrUpdateContact(data: HubSpotContactData): Promise<HubSpotContactResult> {
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!accessToken) {
      this.logger.warn('[HubSpot] HUBSPOT_ACCESS_TOKEN not configured');
      return {
        success: false,
        error: 'HubSpot integration not configured',
      };
    }

    const properties = this.buildContactProperties(data);

    try {
      const result = await this.createContact(properties, accessToken);

      this.logger.log(`[HubSpot] Contact created successfully: ${result.id}`);
      return {
        success: true,
        contactId: result.id,
        action: 'created',
      };
    } catch (error) {
      const err = error as Error & { status?: number; category?: string };

      if (err.status === 409 || err.category === 'CONFLICT') {
        const existingId = this.extractExistingContactId(err.message);

        if (existingId) {
          try {
            const updateResult = await this.updateContact(existingId, properties, accessToken);

            this.logger.log(`[HubSpot] Contact updated successfully: ${updateResult.id}`);
            return {
              success: true,
              contactId: updateResult.id,
              action: 'updated',
            };
          } catch (updateError) {
            this.logger.error(`[HubSpot] Failed to update contact: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
            return {
              success: false,
              contactId: existingId,
              error: `Failed to update: ${updateError instanceof Error ? updateError.message : String(updateError)}`,
            };
          }
        }
      }

      this.logger.error(`[HubSpot] Contact creation failed: ${err.message || 'Unknown error'}`);
      return {
        success: false,
        error: err.message || 'Unknown HubSpot error',
      };
    }
  }
}
