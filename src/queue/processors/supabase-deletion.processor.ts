import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../auth/services/supabase.service';
import { SupabaseDeletionFailure } from '../entities/supabase-deletion-failure.entity';

interface SupabaseDeletionJob {
  supabaseUserId: string;
  email: string;
  portalUserId: string;
  deletedBy: string;
}

@Processor('supabase-user-deletion')
@Injectable()
export class SupabaseDeletionProcessor {
  private readonly logger = new Logger(SupabaseDeletionProcessor.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @InjectRepository(SupabaseDeletionFailure)
    private readonly deletionFailureRepository: Repository<SupabaseDeletionFailure>,
  ) {}

  @Process()
  async handleDeletion(job: Job<SupabaseDeletionJob>) {
    const { supabaseUserId, email, portalUserId, deletedBy } = job.data;
    const currentAttempt = job.attemptsMade + 1;
    const maxAttempts = job.opts.attempts || 3;

    this.logger.log(
      `Processing Supabase user deletion (attempt ${currentAttempt}/${maxAttempts}): ${email}`
    );

    try {
      await this.supabaseService.deleteSupabaseUser(supabaseUserId);

      this.logger.log(`Successfully deleted Supabase user: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete Supabase user ${email} (attempt ${currentAttempt}/${maxAttempts}): ${error.message}`
      );

      throw error;
    }
  }

  /**
   * Handle jobs that failed after all retry attempts
   * This is the dead-letter queue handler
   * 
   * IMPORTANT: @OnQueueFailed runs after EACH failed attempt, not just the final one.
   * We must check if this is the final failure before persisting to avoid duplicates.
   */
  @OnQueueFailed()
  async handleFailedJob(job: Job<SupabaseDeletionJob>, error: Error) {
    const { supabaseUserId, email, portalUserId, deletedBy } = job.data;
    const maxAttempts = job.opts.attempts || 3;
    const currentAttempt = job.attemptsMade;

    if (currentAttempt < maxAttempts) {
      this.logger.warn(
        `Supabase user deletion failed (attempt ${currentAttempt}/${maxAttempts}): ${email}. Will retry.`
      );
      return;
    }

    this.logger.error(
      `CRITICAL: Supabase user deletion permanently failed after ${maxAttempts} attempts: ${email}`,
      error.stack
    );

    const failure = this.deletionFailureRepository.create({
      supabaseUserId,
      email,
      portalUserId,
      deletedBy,
      attempts: maxAttempts,
      lastError: error.message,
      errorStack: error.stack,
      failedAt: new Date(),
      status: 'requires_manual_intervention',
    });

    await this.deletionFailureRepository.save(failure);

    try {
      await this.sendAdminAlert({
        subject: '🚨 CRITICAL: Supabase User Deletion Failed',
        message: `
User deletion failed after ${maxAttempts} retry attempts and requires manual intervention.

**Details:**
- Email: ${email}
- Portal User ID: ${portalUserId}
- Supabase User ID: ${supabaseUserId}
- Deleted By: ${deletedBy}
- Error: ${error.message}

**Action Required:**
1. Manually delete user from Supabase Admin Panel
2. Update dead-letter record status in database: 
   UPDATE supabase_deletion_failures SET status = 'manually_resolved' WHERE id = '${failure.id}'
3. Investigate root cause to prevent future occurrences

**Dead Letter Record ID:** ${failure.id}
        `,
        supabaseUserId,
        portalUserId,
      });
    } catch (alertError) {
      this.logger.error(`Failed to send admin alert: ${alertError.message}`);
    }
  }

  /**
   * Send alert to admin (implement based on your notification system)
   * Options: Email (Nodemailer), Slack webhook, SMS (Twilio), etc.
   */
  private async sendAdminAlert(alert: {
    subject: string;
    message: string;
    supabaseUserId: string;
    portalUserId: string;
  }): Promise<void> {
    this.logger.warn(`ADMIN ALERT: ${alert.subject}\n${alert.message}`);
  }
}
