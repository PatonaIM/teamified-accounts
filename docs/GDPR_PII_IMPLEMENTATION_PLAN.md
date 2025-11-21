# GDPR Compliance & PII Protection Implementation Plan

## Executive Summary

This document outlines the requirements and implementation plan for achieving GDPR compliance and robust PII protection for the Teamified Team Member Portal.

**Timeline**: 3-6 months
**Priority**: HIGH
**Compliance Deadline**: Before processing EU citizen data

---

## 1. Field-Level Encryption for Sensitive PII

### 1.1 Encryption Strategy

**Technology Stack:**
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Management**: AWS KMS, Google Cloud KMS, or HashiCorp Vault
- **Library**: Node.js `crypto` module with key rotation support

**Implementation Layers:**

```typescript
// 1. Create encryption service
// src/common/services/encryption.service.ts

import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyVersion = 'v1'; // For key rotation

  // Keys should be stored in environment variables or KMS
  private getEncryptionKey(version: string = this.keyVersion): Buffer {
    const key = process.env[`ENCRYPTION_KEY_${version.toUpperCase()}`];
    if (!key) throw new Error('Encryption key not found');
    return Buffer.from(key, 'hex');
  }

  /**
   * Encrypt sensitive field
   * Returns: {version}:{iv}:{authTag}:{encrypted}
   */
  encrypt(plaintext: string, keyVersion?: string): string {
    if (!plaintext) return plaintext;

    const version = keyVersion || this.keyVersion;
    const key = this.getEncryptionKey(version);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${version}:${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt sensitive field
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext || !ciphertext.includes(':')) return ciphertext;

    const [version, ivHex, authTagHex, encrypted] = ciphertext.split(':');
    const key = this.getEncryptionKey(version);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

```typescript
// 2. Create TypeORM transformer for automatic encryption/decryption
// src/common/transformers/encrypted.transformer.ts

import { ValueTransformer } from 'typeorm';
import { EncryptionService } from '../services/encryption.service';

export class EncryptedTransformer implements ValueTransformer {
  constructor(private encryptionService: EncryptionService) {}

  // Encrypt before storing to database
  to(value: string | null): string | null {
    if (!value) return value;
    return this.encryptionService.encrypt(value);
  }

  // Decrypt when reading from database
  from(value: string | null): string | null {
    if (!value) return value;
    return this.encryptionService.decrypt(value);
  }
}
```

```typescript
// 3. Update entity definitions to use encryption
// Example: User entity with encrypted SSN

@Entity('users')
export class User {
  // ... other fields

  @Column({
    name: 'profile_data',
    type: 'jsonb',
    transformer: {
      to: (value: any) => {
        if (!value) return value;
        // Encrypt sensitive fields before storing
        return {
          ...value,
          governmentIds: value.governmentIds ? {
            ssn: value.governmentIds.ssn ?
              encryptionService.encrypt(value.governmentIds.ssn) : undefined,
            // ... encrypt other IDs
          } : undefined,
          banking: value.banking ? {
            bankAccountNumber: value.banking.bankAccountNumber ?
              encryptionService.encrypt(value.banking.bankAccountNumber) : undefined,
            // ... encrypt other banking fields
          } : undefined,
        };
      },
      from: (value: any) => {
        if (!value) return value;
        // Decrypt when reading
        return {
          ...value,
          governmentIds: value.governmentIds ? {
            ssn: value.governmentIds.ssn ?
              encryptionService.decrypt(value.governmentIds.ssn) : undefined,
            // ... decrypt other IDs
          } : undefined,
          banking: value.banking ? {
            bankAccountNumber: value.banking.bankAccountNumber ?
              encryptionService.decrypt(value.banking.bankAccountNumber) : undefined,
            // ... decrypt other banking fields
          } : undefined,
        };
      }
    }
  })
  profileData: any | null;
}
```

### 1.2 Fields Requiring Encryption

**Critical (Encrypt Immediately):**
- Government IDs: SSN, SIN, NI Number, PAN, Aadhaar, TFN, TIN, National ID
- Banking: Account numbers, IBAN, SWIFT, Routing numbers
- Salary amounts (consider encrypting in salary_history table)

**Important (Phase 2):**
- Date of birth
- Phone numbers (personal)
- Personal email addresses
- Emergency contact phone numbers

**Documents:**
- Files already encrypted at rest by Vercel Blob (AES-256)
- Consider client-side encryption for extra sensitive documents

### 1.3 Key Management

**Production Setup:**
```bash
# Use AWS KMS, Google Cloud KMS, or Azure Key Vault
# Never store keys in code or git

# Environment variables for Vercel:
ENCRYPTION_KEY_V1=<64-character-hex-key>  # 32 bytes for AES-256
ENCRYPTION_KEY_V2=<new-key-for-rotation>
KMS_KEY_ID=<cloud-kms-key-id>

# Generate key:
openssl rand -hex 32
```

**Key Rotation Strategy:**
1. Generate new key (v2)
2. Deploy with both v1 and v2 keys
3. Background job re-encrypts data with v2
4. After completion, deprecate v1
5. Rotate annually or if compromised

---

## 2. GDPR Rights Implementation

### 2.1 Right to Access (Data Export)

```typescript
// src/gdpr/controllers/gdpr.controller.ts

@Controller('v1/gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {

  @Post('data-export')
  @ApiOperation({ summary: 'Request complete data export (GDPR Article 15)' })
  async requestDataExport(
    @GetUser() user: User,
    @Body() dto: DataExportRequestDto
  ): Promise<DataExportResponseDto> {
    // 1. Log the request
    await this.auditService.log({
      action: 'gdpr_data_export_requested',
      entityType: 'User',
      entityId: user.id,
      actorUserId: user.id,
    });

    // 2. Queue export job (async, can take time)
    const exportJob = await this.gdprService.queueDataExport(user.id, dto.format);

    // 3. Return job ID
    return {
      jobId: exportJob.id,
      status: 'processing',
      estimatedCompletion: '30 minutes',
      message: 'Your data export request has been received. You will receive an email when ready.',
    };
  }

  @Get('data-export/:jobId')
  @ApiOperation({ summary: 'Download data export file' })
  async downloadDataExport(
    @GetUser() user: User,
    @Param('jobId') jobId: string,
    @Res() res: Response
  ) {
    const exportFile = await this.gdprService.getDataExport(user.id, jobId);

    if (!exportFile) {
      throw new NotFoundException('Export not found or expired');
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="my-data-${user.id}-${Date.now()}.json"`);

    return res.send(exportFile.data);
  }
}
```

```typescript
// src/gdpr/services/gdpr.service.ts

export interface UserDataExport {
  exportDate: string;
  userId: string;
  personalInformation: {
    name: string;
    email: string;
    phone: string;
    address: any;
    dateOfBirth: string;
  };
  governmentIds: any; // Decrypted for user's own export
  banking: any;
  employmentRecords: any[];
  salaryHistory: any[];
  documents: {
    filename: string;
    category: string;
    uploadedAt: string;
    downloadUrl: string; // Time-limited signed URL
  }[];
  auditLogs: {
    action: string;
    timestamp: string;
    details: string;
  }[];
  consents: {
    type: string;
    granted: boolean;
    date: string;
  }[];
}

@Injectable()
export class GdprService {
  async generateDataExport(userId: string): Promise<UserDataExport> {
    // Gather all user data from all tables
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const employmentRecords = await this.employmentRecordRepository.find({ where: { userId } });
    const salaryHistory = await this.salaryHistoryRepository.find({
      where: { employmentRecordId: In(employmentRecords.map(r => r.id)) }
    });
    const documents = await this.documentRepository.find({ where: { userId } });
    const auditLogs = await this.auditRepository.find({
      where: { entityId: userId },
      order: { createdAt: 'DESC' },
      take: 1000 // Last 1000 events
    });
    const consents = await this.consentRepository.find({ where: { userId } });

    // Decrypt sensitive data for user's own export
    const decryptedProfileData = this.encryptionService.decryptProfileData(user.profileData);

    return {
      exportDate: new Date().toISOString(),
      userId: user.id,
      personalInformation: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dateOfBirth: decryptedProfileData.dateOfBirth,
      },
      governmentIds: decryptedProfileData.governmentIds,
      banking: decryptedProfileData.banking,
      employmentRecords: employmentRecords.map(r => ({
        jobTitle: r.jobTitle,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
      })),
      salaryHistory: salaryHistory.map(s => ({
        amount: s.salaryAmount,
        currency: s.salaryCurrency,
        effectiveDate: s.effectiveDate,
        reason: s.changeReason,
      })),
      documents: documents.map(d => ({
        filename: d.filename,
        category: d.category,
        uploadedAt: d.createdAt.toISOString(),
        downloadUrl: this.storageService.getSignedUrl(d.storageKey, 24), // 24hr expiry
      })),
      auditLogs: auditLogs.map(a => ({
        action: a.action,
        timestamp: a.createdAt.toISOString(),
        details: JSON.stringify(a.changes),
      })),
      consents: consents.map(c => ({
        type: c.consentType,
        granted: c.granted,
        date: c.consentDate.toISOString(),
      })),
    };
  }
}
```

### 2.2 Right to Erasure ("Right to be Forgotten")

```typescript
// src/gdpr/controllers/gdpr.controller.ts

@Delete('erase-data')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
@ApiOperation({ summary: 'Erase user data (GDPR Article 17)' })
async eraseUserData(
  @Body() dto: EraseUserDataDto,
  @GetUser() admin: User
): Promise<{ message: string }> {
  // Validate deletion is legally allowed
  const canDelete = await this.gdprService.validateErasureRequest(dto.userId);

  if (!canDelete.allowed) {
    throw new BadRequestException(
      `Cannot delete user data: ${canDelete.reason}. ` +
      `Legal retention period: ${canDelete.retentionPeriod}`
    );
  }

  // Perform anonymization (not full deletion)
  await this.gdprService.anonymizeUserData(dto.userId, admin.id);

  return {
    message: 'User data has been anonymized successfully. Employment and salary records retained for legal compliance.',
  };
}
```

```typescript
// src/gdpr/services/gdpr.service.ts

export interface ErasureValidation {
  allowed: boolean;
  reason?: string;
  retentionPeriod?: string;
}

@Injectable()
export class GdprService {
  async validateErasureRequest(userId: string): Promise<ErasureValidation> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['employmentRecords']
    });

    // Check if user has active employment
    const hasActiveEmployment = user.employmentRecords?.some(r => r.status === 'active');
    if (hasActiveEmployment) {
      return {
        allowed: false,
        reason: 'User has active employment records',
        retentionPeriod: 'Until employment ends + 7 years',
      };
    }

    // Check retention period for terminated employees (7 years for tax/legal)
    const mostRecentTermination = user.employmentRecords
      ?.filter(r => r.endDate)
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];

    if (mostRecentTermination) {
      const retentionEnd = new Date(mostRecentTermination.endDate);
      retentionEnd.setFullYear(retentionEnd.getFullYear() + 7);

      if (new Date() < retentionEnd) {
        return {
          allowed: false,
          reason: 'Legal retention period for employment/tax records not yet expired',
          retentionPeriod: `Until ${retentionEnd.toLocaleDateString()}`,
        };
      }
    }

    return { allowed: true };
  }

  async anonymizeUserData(userId: string, performedBy: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Log the deletion request
    await this.auditService.log({
      action: 'gdpr_data_erasure',
      entityType: 'User',
      entityId: userId,
      actorUserId: performedBy,
      changes: {
        originalEmail: user.email,
        originalName: `${user.firstName} ${user.lastName}`,
        reason: 'GDPR Right to Erasure',
      },
    });

    // Anonymize user data (keep record but remove PII)
    await this.userRepository.update(userId, {
      email: `deleted-${userId}@anonymized.local`,
      firstName: 'Deleted',
      lastName: 'User',
      phone: null,
      address: null,
      profileData: {
        anonymized: true,
        anonymizedAt: new Date().toISOString(),
        // Remove all PII from profileData
      },
      status: 'archived',
      isActive: false,
    });

    // Delete uploaded documents (CVs, IDs, etc.)
    const documents = await this.documentRepository.find({ where: { userId } });
    for (const doc of documents) {
      await this.storageService.deleteFile(doc.storageKey);
      await this.documentRepository.remove(doc);
    }

    // Anonymize employment records (keep for legal compliance but remove identifiers)
    // Salary records remain but are disconnected from identifiable person

    // Note: Audit logs are retained for compliance but user is anonymized
  }
}
```

### 2.3 Consent Management

```typescript
// src/gdpr/entities/user-consent.entity.ts

@Entity('user_consents')
export class UserConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'consent_type',
    type: 'enum',
    enum: ['data_processing', 'marketing', 'third_party_sharing', 'analytics', 'cookies'],
  })
  consentType: string;

  @Column({ name: 'granted', default: false })
  granted: boolean;

  @Column({ name: 'consent_text', type: 'text' })
  consentText: string; // Exact text shown to user

  @Column({ name: 'privacy_policy_version', length: 20 })
  privacyPolicyVersion: string;

  @Column({ name: 'consent_date', type: 'timestamptz', nullable: true })
  consentDate: Date | null;

  @Column({ name: 'withdrawn_date', type: 'timestamptz', nullable: true })
  withdrawnDate: Date | null;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

```typescript
// src/gdpr/controllers/consent.controller.ts

@Controller('v1/consent')
@UseGuards(JwtAuthGuard)
export class ConsentController {

  @Get('current')
  @ApiOperation({ summary: 'Get user\'s current consent status' })
  async getCurrentConsents(@GetUser() user: User) {
    return await this.consentService.getUserConsents(user.id);
  }

  @Post('grant')
  @ApiOperation({ summary: 'Grant consent for data processing' })
  async grantConsent(
    @GetUser() user: User,
    @Body() dto: GrantConsentDto,
    @Req() req: any
  ) {
    return await this.consentService.grantConsent({
      userId: user.id,
      consentType: dto.consentType,
      privacyPolicyVersion: dto.privacyPolicyVersion,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw consent' })
  async withdrawConsent(
    @GetUser() user: User,
    @Body() dto: WithdrawConsentDto
  ) {
    return await this.consentService.withdrawConsent(user.id, dto.consentType);
  }
}
```

### 2.4 Data Retention & Auto-Cleanup

```typescript
// src/gdpr/services/data-retention.service.ts

export const RETENTION_POLICIES = {
  INACTIVE_USER_DATA: 3, // years
  EMPLOYMENT_RECORDS: 7, // years (legal requirement)
  SALARY_HISTORY: 7, // years
  AUDIT_LOGS: 6, // years
  DOCUMENTS: 7, // years post-employment
  MARKETING_DATA: 2, // years
  SESSION_DATA: 0.027, // 10 days
};

@Injectable()
export class DataRetentionService {

  @Cron('0 2 * * 0') // Every Sunday at 2 AM
  async cleanupExpiredData() {
    this.logger.log('Starting data retention cleanup job');

    try {
      // 1. Cleanup inactive users (no login in 3 years)
      await this.cleanupInactiveUsers();

      // 2. Cleanup old session data
      await this.cleanupExpiredSessions();

      // 3. Cleanup old audit logs (keep 6 years)
      await this.cleanupOldAuditLogs();

      // 4. Archive old documents
      await this.archiveOldDocuments();

      this.logger.log('Data retention cleanup completed successfully');
    } catch (error) {
      this.logger.error('Data retention cleanup failed', error);
    }
  }

  private async cleanupInactiveUsers() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - RETENTION_POLICIES.INACTIVE_USER_DATA);

    const inactiveUsers = await this.userRepository.find({
      where: {
        lastLoginAt: LessThan(threeYearsAgo),
        status: 'inactive',
      },
    });

    for (const user of inactiveUsers) {
      // Check if can be deleted (no employment in last 7 years)
      const canDelete = await this.gdprService.validateErasureRequest(user.id);

      if (canDelete.allowed) {
        await this.gdprService.anonymizeUserData(user.id, 'SYSTEM_AUTO_CLEANUP');
        this.logger.log(`Anonymized inactive user: ${user.id}`);
      }
    }
  }

  private async cleanupExpiredSessions() {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    await this.sessionRepository.delete({
      createdAt: LessThan(tenDaysAgo),
    });
  }

  private async cleanupOldAuditLogs() {
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - RETENTION_POLICIES.AUDIT_LOGS);

    // Archive to cold storage instead of delete (for legal reasons)
    const oldLogs = await this.auditRepository.find({
      where: {
        createdAt: LessThan(sixYearsAgo),
      },
    });

    if (oldLogs.length > 0) {
      // Export to S3 Glacier or similar cold storage
      await this.archiveService.archiveAuditLogs(oldLogs);
      await this.auditRepository.remove(oldLogs);
      this.logger.log(`Archived ${oldLogs.length} audit log entries`);
    }
  }
}
```

### 2.5 Data Breach Notification

```typescript
// src/gdpr/entities/security-incident.entity.ts

@Entity('security_incidents')
export class SecurityIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'incident_type',
    type: 'enum',
    enum: ['data_breach', 'unauthorized_access', 'data_loss', 'ransomware', 'phishing'],
  })
  incidentType: string;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity: string;

  @Column({ name: 'detected_at', type: 'timestamptz' })
  detectedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'affected_users_count', type: 'int' })
  affectedUsersCount: number;

  @Column({ name: 'affected_data_types', type: 'jsonb' })
  affectedDataTypes: string[]; // ['ssn', 'email', 'salary', etc.]

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'root_cause', type: 'text', nullable: true })
  rootCause: string | null;

  @Column({ name: 'remediation_steps', type: 'text', nullable: true })
  remediationSteps: string | null;

  @Column({ name: 'notifications_sent', default: false })
  notificationsSent: boolean;

  @Column({ name: 'reported_to_authority', default: false })
  reportedToAuthority: boolean;

  @Column({ name: 'reported_at', type: 'timestamptz', nullable: true })
  reportedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

```typescript
// src/gdpr/services/breach-notification.service.ts

@Injectable()
export class BreachNotificationService {

  async reportIncident(incident: CreateSecurityIncidentDto): Promise<SecurityIncident> {
    const createdIncident = await this.incidentRepository.save(incident);

    // Automatically trigger notifications if criteria met
    if (this.requiresNotification(incident)) {
      await this.sendBreachNotifications(createdIncident);
    }

    // Alert admins immediately for critical incidents
    if (incident.severity === 'critical') {
      await this.alertAdministrators(createdIncident);
    }

    return createdIncident;
  }

  private requiresNotification(incident: CreateSecurityIncidentDto): boolean {
    // GDPR: Must notify within 72 hours if risk to rights and freedoms
    const highSensitivityData = ['ssn', 'banking', 'health', 'governmentIds'];
    const containsHighSensitivityData = incident.affectedDataTypes.some(
      type => highSensitivityData.includes(type)
    );

    return (
      incident.severity === 'high' ||
      incident.severity === 'critical' ||
      incident.affectedUsersCount > 100 ||
      containsHighSensitivityData
    );
  }

  private async sendBreachNotifications(incident: SecurityIncident) {
    // 1. Notify affected users via email
    const affectedUserIds = await this.getAffectedUsers(incident);

    for (const userId of affectedUserIds) {
      await this.emailService.sendBreachNotification(userId, {
        incidentDate: incident.detectedAt,
        dataTypes: incident.affectedDataTypes,
        recommendedActions: this.getRecommendedActions(incident),
      });
    }

    // 2. Report to supervisory authority (within 72 hours)
    // For EU: https://edpb.europa.eu/about-edpb/board/members_en
    await this.reportToSupervisoryAuthority(incident);

    await this.incidentRepository.update(incident.id, {
      notificationsSent: true,
      reportedToAuthority: true,
      reportedAt: new Date(),
    });
  }

  private async reportToSupervisoryAuthority(incident: SecurityIncident) {
    // Generate report in required format
    const report = {
      controller: {
        name: 'Teamified Pty Ltd',
        address: '...',
        contact: 'dpo@teamified.com',
      },
      incident: {
        date: incident.detectedAt,
        description: incident.description,
        affectedDataSubjects: incident.affectedUsersCount,
        dataCategories: incident.affectedDataTypes,
        consequences: 'Potential unauthorized access to personal data',
        measures: incident.remediationSteps,
      },
    };

    // Log for manual submission (or automate via API if available)
    this.logger.warn('DATA BREACH REPORT REQUIRED', report);

    // Store report for compliance records
    await this.storeBreachReport(incident.id, report);
  }
}
```

---

## 3. Additional GDPR Requirements

### 3.1 Privacy Policy & Notices

**Required Content:**
```markdown
# Privacy Policy

## 1. Data Controller Information
- Company name: Teamified Pty Ltd
- Address: ...
- Data Protection Officer: dpo@teamified.com

## 2. What Data We Collect
- Personal information (name, email, phone)
- Government IDs (for employment verification)
- Banking information (for payroll)
- Employment history
- Salary information
- Documents (CVs, identity documents)

## 3. Legal Basis for Processing
- Contract performance (employment contract)
- Legal obligation (tax, employment law)
- Legitimate interest (business operations)
- Consent (marketing communications)

## 4. How We Use Your Data
- Employment management
- Payroll processing
- Compliance with legal obligations
- Improving our services

## 5. Data Sharing
- Payroll providers
- Government authorities (tax, social security)
- Clients (with your consent)

## 6. Your Rights
- Right to access your data
- Right to rectify inaccurate data
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability
- Right to object
- Right to withdraw consent

## 7. Data Retention
- Employment records: 7 years after employment ends
- Salary history: 7 years
- Audit logs: 6 years
- Marketing data: 2 years (or until consent withdrawn)

## 8. Security Measures
- Encryption at rest and in transit
- Access controls and authentication
- Regular security audits
- Employee training on data protection

## 9. International Transfers
- Data stored in [region]
- Standard Contractual Clauses for EU transfers
- Adequacy decisions followed

## 10. Contact Us
- Email: privacy@teamified.com
- DPO: dpo@teamified.com
```

### 3.2 Cookie Consent

```typescript
// Frontend: Cookie consent banner component

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Checkbox } from '@mui/material';

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const consents = { essential: true, analytics: true, marketing: true };
    await saveConsent(consents);
    setShowBanner(false);
  };

  const handleAcceptSelected = async () => {
    await saveConsent(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    const consents = { essential: true, analytics: false, marketing: false };
    await saveConsent(consents);
    setShowBanner(false);
  };

  const saveConsent = async (consents: any) => {
    // Save to backend
    await fetch('/api/v1/consent/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentType: 'cookies',
        preferences: consents,
        privacyPolicyVersion: '1.0',
      }),
    });

    // Save locally
    localStorage.setItem('cookie-consent', JSON.stringify(consents));

    // Initialize analytics if consented
    if (consents.analytics) {
      // window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  if (!showBanner) return null;

  return (
    <Box sx={{ /* Cookie banner styles */ }}>
      <Typography variant="h6">Cookie Settings</Typography>
      <Typography variant="body2">
        We use cookies to enhance your experience. You can choose which cookies to accept.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Checkbox checked={preferences.essential} disabled />
        <Typography>Essential Cookies (Required)</Typography>

        <Checkbox
          checked={preferences.analytics}
          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
        />
        <Typography>Analytics Cookies</Typography>

        <Checkbox
          checked={preferences.marketing}
          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
        />
        <Typography>Marketing Cookies</Typography>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button onClick={handleAcceptAll} variant="contained">Accept All</Button>
        <Button onClick={handleAcceptSelected} variant="outlined">Accept Selected</Button>
        <Button onClick={handleRejectAll} variant="text">Reject All</Button>
      </Box>
    </Box>
  );
};
```

### 3.3 Records of Processing Activities (ROPA)

```typescript
// Document all data processing activities

const processingActivities = [
  {
    name: 'Employee Onboarding',
    purpose: 'Collect employee information for employment contract and payroll',
    legalBasis: 'Contract performance',
    dataCategories: ['Name', 'Email', 'Address', 'Government IDs', 'Banking details'],
    dataSubjects: 'Prospective and current employees',
    recipients: 'Payroll provider, Tax authorities',
    retentionPeriod: '7 years after employment ends',
    securityMeasures: 'Encryption, access controls, audit logging',
  },
  {
    name: 'Payroll Processing',
    purpose: 'Calculate and process employee payments',
    legalBasis: 'Contract performance, Legal obligation',
    dataCategories: ['Name', 'Salary', 'Banking details', 'Tax IDs'],
    dataSubjects: 'Current employees',
    recipients: 'Payroll provider, Tax authorities, Banks',
    retentionPeriod: '7 years',
    securityMeasures: 'Encryption, access controls',
  },
  // ... more activities
];
```

---

## 4. Implementation Priority & Timeline

### Phase 1: Critical (Month 1-2)
**Priority: IMMEDIATE**

- [ ] Implement field-level encryption for:
  - Government IDs (SSN, NI, PAN, etc.)
  - Banking information
  - Salary amounts
- [ ] Set up key management (KMS)
- [ ] Create privacy policy page
- [ ] Implement cookie consent banner
- [ ] Add consent tracking table and APIs

### Phase 2: High Priority (Month 2-3)
**Priority: HIGH**

- [ ] Implement data export functionality (Right to Access)
- [ ] Implement data erasure/anonymization (Right to be Forgotten)
- [ ] Add audit logging for all data access
- [ ] Implement data retention policies
- [ ] Create automated cleanup jobs

### Phase 3: Important (Month 3-4)
**Priority: MEDIUM**

- [ ] Security incident tracking system
- [ ] Breach notification workflows
- [ ] Data portability format (JSON export)
- [ ] Privacy settings dashboard for users
- [ ] Training materials for staff on GDPR

### Phase 4: Compliance & Monitoring (Month 4-6)
**Priority: MEDIUM**

- [ ] Regular security audits
- [ ] Privacy impact assessments
- [ ] GDPR compliance dashboard for admins
- [ ] Documentation of processing activities (ROPA)
- [ ] Data flow mapping
- [ ] Third-party vendor assessments

---

## 5. Cost Estimates

### Infrastructure Costs
- **KMS Service**: $1-5/month (AWS KMS, Google Cloud KMS)
- **Additional Storage**: $10-50/month (encrypted data is slightly larger)
- **Backup & Archival**: $20-100/month
- **Security Monitoring**: $50-200/month

### Development Costs
- **Field-level encryption**: 40-80 hours
- **GDPR endpoints**: 60-100 hours
- **Consent management**: 30-50 hours
- **Data retention**: 40-60 hours
- **Documentation & testing**: 60-100 hours

**Total Estimated**: 230-390 development hours (~3-5 months)

### Legal/Compliance Costs
- **Data Protection Officer (DPO)**: Required if processing large scale sensitive data
- **Legal review**: Privacy policy, terms of service, DPAs
- **GDPR audit/certification**: Optional but recommended

---

## 6. Testing & Validation

### Security Testing
```bash
# Verify encryption
npm run test:encryption

# Verify access controls
npm run test:rbac

# Verify data export
npm run test:gdpr-export

# Verify data erasure
npm run test:gdpr-erasure
```

### Compliance Checklist
- [ ] All PII encrypted at rest
- [ ] All API endpoints use HTTPS
- [ ] Audit logs for all data access
- [ ] Data export works correctly
- [ ] Data erasure works correctly
- [ ] Consent properly tracked
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Breach notification process documented
- [ ] Staff trained on GDPR

---

## 7. Ongoing Maintenance

### Annual Tasks
- [ ] Review and update privacy policy
- [ ] Review data retention policies
- [ ] Rotate encryption keys
- [ ] Conduct security audit
- [ ] Review third-party processors
- [ ] Update consent records
- [ ] Review and clean up old data

### Quarterly Tasks
- [ ] Review access logs for anomalies
- [ ] Test data export functionality
- [ ] Test backup/recovery procedures
- [ ] Review incident reports

### Monthly Tasks
- [ ] Monitor consent withdrawal requests
- [ ] Review data access requests
- [ ] Check automated cleanup jobs

---

## 8. Resources & References

**GDPR Official Resources:**
- EU GDPR Portal: https://gdpr.eu/
- EDPB Guidelines: https://edpb.europa.eu/
- ICO Guidance (UK): https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/

**Technical Implementation:**
- OWASP Data Protection: https://owasp.org/www-project-data-security-top-10/
- Node.js Crypto: https://nodejs.org/api/crypto.html
- TypeORM Transformers: https://typeorm.io/entities#column-options

**Key Takeaways:**
1. Encrypt all sensitive PII at rest (SSN, banking, government IDs)
2. Implement all GDPR rights (access, erasure, portability)
3. Track and manage user consent
4. Have breach notification procedures
5. Document everything
6. Regular audits and staff training

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Author**: Claude Code Implementation Team
**Status**: DRAFT - Requires legal review
