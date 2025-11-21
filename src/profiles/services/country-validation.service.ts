import { Injectable } from '@nestjs/common';

interface CountryConfig {
  code: string;
  name: string;
  phonePattern: RegExp;
  postalCodePattern: RegExp;
  dateFormat: string;
  timezone: string;
}

@Injectable()
export class CountryValidationService {
  private readonly countryConfigs: Map<string, CountryConfig> = new Map([
    [
      'IN',
      {
        code: 'IN',
        name: 'India',
        phonePattern: /^\+91[6-9]\d{9}$/,
        postalCodePattern: /^\d{6}$/,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
      },
    ],
    [
      'LK',
      {
        code: 'LK',
        name: 'Sri Lanka',
        phonePattern: /^\+94[1-9]\d{8}$/,
        postalCodePattern: /^\d{5}$/,
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Colombo',
      },
    ],
    [
      'PH',
      {
        code: 'PH',
        name: 'Philippines',
        phonePattern: /^\+63[1-9]\d{8}$/,
        postalCodePattern: /^\d{4}$/,
        dateFormat: 'MM/DD/YYYY',
        timezone: 'Asia/Manila',
      },
    ],
  ]);

  validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
    const config = this.countryConfigs.get(countryCode);
    if (!config) {
      return true; // Allow if country not configured
    }
    
    if (!phoneNumber) {
      return true; // Allow empty for optional fields
    }
    
    return config.phonePattern.test(phoneNumber);
  }

  validatePostalCode(postalCode: string, countryCode: string): boolean {
    const config = this.countryConfigs.get(countryCode);
    if (!config) {
      return true; // Allow if country not configured
    }
    
    if (!postalCode) {
      return true; // Allow empty for optional fields
    }
    
    return config.postalCodePattern.test(postalCode);
  }

  formatPhoneNumber(phoneNumber: string, countryCode: string): string {
    const config = this.countryConfigs.get(countryCode);
    if (!config || !phoneNumber) {
      return phoneNumber;
    }

    // Basic formatting - remove non-digits and add country code if missing
    const digits = phoneNumber.replace(/\D/g, '');
    
    switch (countryCode) {
      case 'IN':
        if (digits.length === 10) {
          return `+91${digits}`;
        }
        break;
      case 'LK':
        if (digits.length === 9) {
          return `+94${digits}`;
        }
        break;
      case 'PH':
        if (digits.length === 9) {
          return `+63${digits}`;
        }
        break;
    }
    
    return phoneNumber;
  }

  getCountryConfig(countryCode: string): CountryConfig | null {
    return this.countryConfigs.get(countryCode) || null;
  }

  getSupportedCountries(): CountryConfig[] {
    return Array.from(this.countryConfigs.values());
  }

  isCountrySupported(countryCode: string): boolean {
    return this.countryConfigs.has(countryCode);
  }
}