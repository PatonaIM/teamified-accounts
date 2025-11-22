import { Injectable, Logger } from '@nestjs/common';
import { Payslip } from '../entities/payslip.entity';

/**
 * PayslipNotificationService
 * Handles notifications for payslip availability and status changes
 * TODO: Integrate with actual email/notification service
 */
@Injectable()
export class PayslipNotificationService {
  private readonly logger = new Logger(PayslipNotificationService.name);

  /**
   * Notify employee that new payslip is available
   * @param payslip - The newly available payslip
   */
  async notifyPayslipAvailable(payslip: Payslip): Promise<void> {
    try {
      this.logger.log(`Sending payslip available notification to user ${payslip.userId}`);

      // TODO: Implement actual notification
      // - Send email to user.email
      // - Create in-app notification
      // - Send SMS if configured

      const notification = {
        userId: payslip.userId,
        type: 'PAYSLIP_AVAILABLE',
        title: 'New Payslip Available',
        message: `Your payslip for ${payslip.payrollPeriod?.periodName || 'the current period'} is now available to download.`,
        data: {
          payslipId: payslip.id,
          periodName: payslip.payrollPeriod?.periodName,
          netPay: payslip.netPay,
          currencyCode: payslip.currencyCode,
        },
        createdAt: new Date(),
      };

      this.logger.log(`Payslip notification queued: ${JSON.stringify(notification)}`);
      
      // TODO: Send via email service
      // await this.emailService.send({
      //   to: payslip.user.email,
      //   subject: notification.title,
      //   template: 'payslip-available',
      //   context: notification.data,
      // });

    } catch (error) {
      this.logger.error(`Failed to send payslip notification: ${error.message}`, error.stack);
      // Don't throw - notification failure shouldn't break payslip generation
    }
  }

  /**
   * Notify admin/HR about payslip generation completion
   * @param payslips - Array of generated payslips
   */
  async notifyPayslipBatchComplete(payslips: Payslip[]): Promise<void> {
    try {
      this.logger.log(`Sending batch completion notification for ${payslips.length} payslips`);

      const notification = {
        type: 'PAYSLIP_BATCH_COMPLETE',
        title: 'Payslip Generation Complete',
        message: `Successfully generated ${payslips.length} payslips.`,
        data: {
          count: payslips.length,
          periodId: payslips[0]?.payrollPeriodId,
          periodName: payslips[0]?.payrollPeriod?.periodName,
        },
        createdAt: new Date(),
      };

      this.logger.log(`Batch notification queued: ${JSON.stringify(notification)}`);

      // TODO: Send to admin/HR users

    } catch (error) {
      this.logger.error(`Failed to send batch notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Notify employee about payslip download
   * @param payslip - The downloaded payslip
   */
  async notifyPayslipDownloaded(payslip: Payslip): Promise<void> {
    try {
      this.logger.log(`Recording payslip download for user ${payslip.userId}, payslip ${payslip.id}`);

      // TODO: Optional - send download confirmation email
      // TODO: Log download event for audit trail

    } catch (error) {
      this.logger.error(`Failed to record payslip download: ${error.message}`, error.stack);
    }
  }

  /**
   * Notify employee about tax document status change
   * @param userId - User ID
   * @param documentId - Document ID
   * @param status - New status
   */
  async notifyTaxDocumentStatus(
    userId: string,
    documentId: string,
    status: 'approved' | 'rejected',
    reviewNotes?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Sending tax document ${status} notification to user ${userId}`);

      const notification = {
        userId,
        type: 'TAX_DOCUMENT_STATUS',
        title: `Tax Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: status === 'approved' 
          ? 'Your tax document has been approved.' 
          : `Your tax document has been rejected. ${reviewNotes || ''}`,
        data: {
          documentId,
          status,
          reviewNotes,
        },
        createdAt: new Date(),
      };

      this.logger.log(`Tax document notification queued: ${JSON.stringify(notification)}`);

      // TODO: Send via email service

    } catch (error) {
      this.logger.error(`Failed to send tax document notification: ${error.message}`, error.stack);
    }
  }
}

