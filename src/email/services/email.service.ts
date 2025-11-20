import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { LegacyInvitation } from '../../invitations/entities/legacy-invitation.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const sendGridApiKey = this.configService.get('SENDGRID_API_KEY');
    
    if (!sendGridApiKey) {
      this.logger.error('SENDGRID_API_KEY is not configured. Email service will not function.');
      throw new Error('SENDGRID_API_KEY is required for email service');
    }

    sgMail.setApiKey(sendGridApiKey);
    this.logger.log('Email service initialized with SendGrid');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const fromEmail = this.configService.get('EMAIL_FROM', 'noreply@teamified.com.au');

      this.logger.log(`📧 Attempting to send email:`, {
        to: options.to,
        from: fromEmail,
        subject: options.subject,
      });

      const msg = {
        to: options.to,
        from: fromEmail,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      };

      const [response] = await sgMail.send(msg);
      
      this.logger.log(`✅ SendGrid Response:`, {
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
        to: options.to,
        from: fromEmail,
        subject: options.subject,
      });

      if (response.statusCode !== 202) {
        this.logger.warn(`⚠️ Unexpected status code from SendGrid: ${response.statusCode}`);
      }

      return true;
    } catch (error) {
      this.logger.error(`❌ SendGrid Error - FROM: ${this.configService.get('EMAIL_FROM', 'noreply@teamified.com.au')}:`, {
        message: error.message,
        code: error.code,
        statusCode: error.response?.statusCode,
        body: error.response?.body,
      });
      return false;
    }
  }

  /**
   * Legacy Invitation Email (Pre-Multitenancy)
   * 
   * TODO: CLEANUP AFTER PHASE 3 - This method sends emails for old invitations
   * Replace with new organization-based invitation emails after Phase 3 migration
   * 
   * See: docs/Multitenancy_Features_PRD.md - Section 16: Legacy Invitation System Cleanup
   */
  async sendInvitationEmail(invitation: LegacyInvitation): Promise<boolean> {
    const inviteLink = this.generateInviteLink(invitation.token);
    
    const htmlTemplate = this.generateInvitationHtmlTemplate(invitation, inviteLink);
    const textTemplate = this.generateInvitationTextTemplate(invitation, inviteLink);

    return this.sendEmail({
      to: invitation.email,
      subject: 'Welcome to Teamified - Complete Your Registration',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendEmailVerificationReminder(
    email: string, 
    firstName: string, 
    verificationToken: string
  ): Promise<boolean> {
    const verificationLink = this.generateVerificationLink(verificationToken);
    
    const htmlTemplate = this.generateVerificationReminderHtmlTemplate(firstName, verificationLink);
    const textTemplate = this.generateVerificationReminderTextTemplate(firstName, verificationLink);

    return this.sendEmail({
      to: email,
      subject: 'Please verify your email address - Teamified',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const htmlTemplate = this.generateWelcomeHtmlTemplate(firstName);
    const textTemplate = this.generateWelcomeTextTemplate(firstName);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Teamified - Email Verified Successfully',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendPasswordResetEmail(user: { email: string; firstName: string }, resetToken: string): Promise<boolean> {
    const resetLink = this.generatePasswordResetLink(resetToken);
    
    const htmlTemplate = this.generatePasswordResetHtmlTemplate(user.firstName, resetLink);
    const textTemplate = this.generatePasswordResetTextTemplate(user.firstName, resetLink);

    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Teamified',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  private generateInviteLink(token: string): string{
    const baseUrl = this.configService.get('FRONTEND_URL', 'https://teamified.com');
    return `${baseUrl}/accept-invitation?token=${token}`;
  }

  private generateVerificationLink(token: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'https://teamified.com');
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private generatePasswordResetLink(token: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'https://teamified.com');
    return `${baseUrl}/reset-password?token=${token}`;
  }

  private generateInvitationHtmlTemplate(invitation: LegacyInvitation, inviteLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #3498db; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .expiry-warning { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 10px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Teamified</h1>
        </div>
        <div class="content">
            <h2>Hello ${invitation.firstName} ${invitation.lastName},</h2>
            <p>You have been invited to join Teamified as a <strong>${invitation.role}</strong>.</p>
            
            <p>To complete your registration and access your account, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="${inviteLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="expiry-warning">
                <strong>⏰ Important:</strong> This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}. 
                Please complete your registration before this date.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px;">
                ${inviteLink}
            </p>
            
            <h3>What's next?</h3>
            <ul>
                <li>Click the invitation link above</li>
                <li>Set up your secure password</li>
                <li>Complete your profile information</li>
                <li>Start using Teamified</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Teamified.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateInvitationTextTemplate(invitation: LegacyInvitation, inviteLink: string): string{
    return `
Welcome to Teamified

Hello ${invitation.firstName} ${invitation.lastName},

You have been invited to join Teamified as a ${invitation.role}.

To complete your registration and access your account, please visit:
${inviteLink}

IMPORTANT: This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}. 
Please complete your registration before this date.

What's next:
1. Click the invitation link above
2. Set up your secure password
3. Complete your profile information
4. Start using Teamified

If you have any questions or need assistance, please contact our support team.

This is an automated message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  private generateVerificationReminderHtmlTemplate(firstName: string, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Please verify your email address</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #27ae60; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Email Verification Required</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>We noticed that you haven't verified your email address yet. Email verification is required to access all features of the Teamified.</p>
            
            <div class="warning">
                <strong>⚠️ Action Required:</strong> Please verify your email address to complete your account setup and access the full portal functionality.
            </div>
            
            <div style="text-align: center;">
                <a href="${verificationLink}" class="cta-button">Verify My Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px;">
                ${verificationLink}
            </p>
            
            <h3>Why verify your email?</h3>
            <ul>
                <li>✅ Complete your account setup</li>
                <li>✅ Access all portal features</li>
                <li>✅ Receive important notifications</li>
                <li>✅ Ensure account security</li>
            </ul>
            
            <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>This is an automated reminder from Teamified.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateVerificationReminderTextTemplate(firstName: string, verificationLink: string): string {
    return `
Email Verification Required - Teamified

Hello ${firstName},

We noticed that you haven't verified your email address yet. Email verification is required to access all features of the Teamified.

ACTION REQUIRED: Please verify your email address to complete your account setup and access the full portal functionality.

To verify your email, please visit:
${verificationLink}

Why verify your email?
- Complete your account setup
- Access all portal features
- Receive important notifications
- Ensure account security

Note: This verification link will expire in 24 hours for security reasons.

If you have any questions or need assistance, please contact our support team.

This is an automated reminder from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  private generateWelcomeHtmlTemplate(firstName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .success-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Teamified!</h1>
        </div>
        <div class="content">
            <h2>Congratulations, ${firstName}!</h2>
            
            <div class="success-box">
                <strong>✅ Email Verified Successfully!</strong><br>
                Your email address has been verified and your account is now fully activated.
            </div>
            
            <p>You now have access to all the features of the Teamified, including:</p>
            
            <h3>🚀 What's available to you:</h3>
            <ul>
                <li>📊 Dashboard with important updates</li>
                <li>👤 Profile management</li>
                <li>⏰ Timesheet submission</li>
                <li>🏖️ Leave request management</li>
                <li>📄 Document access and payslips</li>
            </ul>
            
            <h3>🎯 Next steps:</h3>
            <ol>
                <li>Complete your profile information</li>
                <li>Explore the dashboard</li>
                <li>Submit your first timesheet (if applicable)</li>
                <li>Familiarize yourself with the portal features</li>
            </ol>
            
            <p>If you have any questions or need assistance getting started, please don't hesitate to contact our support team.</p>
            
            <p>We're excited to have you on board!</p>
        </div>
        <div class="footer">
            <p>Welcome to the Teamified family!</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateWelcomeTextTemplate(firstName: string): string {
    return `
Welcome to Teamified!

Congratulations, ${firstName}!

✅ EMAIL VERIFIED SUCCESSFULLY!
Your email address has been verified and your account is now fully activated.

You now have access to all the features of the Teamified, including:

🚀 What's available to you:
- Dashboard with important updates
- Profile management
- Timesheet submission
- Leave request management
- Document access and payslips

🎯 Next steps:
1. Complete your profile information
2. Explore the dashboard
3. Submit your first timesheet (if applicable)
4. Familiarize yourself with the portal features

If you have any questions or need assistance getting started, please contact our support team.

We're excited to have you on board!

Welcome to the Teamified family!
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  private generatePasswordResetHtmlTemplate(firstName: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #3498db; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .security-notice { background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Reset Your Password</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            
            <p>We received a request to reset your password for your Teamified account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="cta-button">Reset Password</a>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f1f1f1; padding: 10px; border-radius: 3px;">
                ${resetLink}
            </p>
            
            <div class="security-notice">
                <strong>🛡️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
                Your password will remain unchanged, and no action is needed.
            </div>
            
            <p>For your security:</p>
            <ul>
                <li>Never share this link with anyone</li>
                <li>Make sure you're on the official Teamified website before entering your new password</li>
                <li>Choose a strong, unique password</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated security message from Teamified.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generatePasswordResetTextTemplate(firstName: string, resetLink: string): string {
    return `
Reset Your Password - Teamified

Hello ${firstName},

We received a request to reset your password for your Teamified account.

To reset your password, please visit:
${resetLink}

IMPORTANT: This password reset link will expire in 1 hour for security reasons.

SECURITY NOTICE: If you didn't request this password reset, please ignore this email. 
Your password will remain unchanged, and no action is needed.

For your security:
- Never share this link with anyone
- Make sure you're on the official Teamified website before entering your new password
- Choose a strong, unique password

This is an automated security message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async sendInternalUserInvitationEmail(
    email: string,
    inviteLink: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const htmlTemplate = this.generateInternalInvitationHtmlTemplate(
      inviteLink,
      expiresAt,
    );
    const textTemplate = this.generateInternalInvitationTextTemplate(
      inviteLink,
      expiresAt,
    );

    return this.sendEmail({
      to: email,
      subject: 'Join the Teamified Internal Team - Complete Your Registration',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  private generateInternalInvitationHtmlTemplate(
    inviteLink: string,
    expiresAt: Date,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join the Teamified Internal Team</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background-color: #4CAF50;
            color: white; 
            padding: 14px 36px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .expiry-warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .internal-badge { background-color: #667eea; color: white; padding: 6px 14px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 600; margin: 10px 0; }
        .link-box { background-color: #e8eaf6; padding: 15px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 13px; margin: 15px 0; border-left: 4px solid #667eea; }
        .security-note { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to the Teamified Team!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Internal Team Invitation</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #667eea;">Hello,</h2>
            
            <p style="font-size: 16px;">You have been invited to join the <strong>Teamified internal team</strong>!</p>
            
            <p>Your account has been created. To set up your password and start accessing the internal admin portal, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" class="cta-button" style="color: white !important; text-decoration: none;">Accept Invite</a>
            </div>
            
            <div class="expiry-warning">
                <strong>⏰ Important:</strong> This invitation will expire on <strong>${expiresAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. 
                Please complete your registration before this date.
            </div>
            
            <p style="margin-top: 25px;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <div class="link-box">
                ${inviteLink}
            </div>
            
            <div class="security-note">
                <strong>🔒 Security Notice:</strong> This invitation is specifically for Teamified internal team members with <strong>@teamified.com</strong> or <strong>@teamified.com.au</strong> email addresses. You will need to use your company email to complete registration.
            </div>
            
            <h3 style="color: #667eea; margin-top: 30px;">What's next?</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>Click the invitation link above</li>
                <li>Set up your secure password (your account is already created)</li>
                <li>Access the internal admin portal</li>
            </ol>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please contact our IT support team.</p>
            
            <p style="margin-top: 25px;">We're excited to have you on the team!</p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">This is an automated message from Teamified Internal Systems.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateInternalInvitationTextTemplate(
    inviteLink: string,
    expiresAt: Date,
  ): string {
    return `
Welcome to the Teamified Internal Team!

Hello,

You have been invited to join the Teamified internal team!

Your account has been created. To set up your password and start accessing the internal admin portal, please visit:
${inviteLink}

IMPORTANT: This invitation will expire on ${expiresAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. 
Please complete your registration before this date.

SECURITY NOTICE: This invitation is specifically for Teamified internal team members with @teamified.com or @teamified.com.au email addresses. You will need to use your company email to complete registration.

What's next:
1. Click the invitation link above
2. Set up your secure password (your account is already created)
3. Access the internal admin portal

If you have any questions or need assistance, please contact our IT support team.

We're excited to have you on the team!

This is an automated message from Teamified Internal Systems.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }

  async sendOrganizationInvitationEmail(
    email: string,
    firstName: string | undefined,
    lastName: string | undefined,
    organizationName: string,
    inviteLink: string,
    roleType: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const htmlTemplate = this.generateOrgInvitationHtmlTemplate(
      firstName,
      lastName,
      organizationName,
      inviteLink,
      roleType,
      expiresAt,
    );
    const textTemplate = this.generateOrgInvitationTextTemplate(
      firstName,
      lastName,
      organizationName,
      inviteLink,
      roleType,
      expiresAt,
    );

    return this.sendEmail({
      to: email,
      subject: `Join ${organizationName} on Teamified`,
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  private generateOrgInvitationHtmlTemplate(
    firstName: string | undefined,
    lastName: string | undefined,
    organizationName: string,
    inviteLink: string,
    roleType: string,
    expiresAt: Date,
  ): string {
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName 
      ? firstName 
      : 'there';
    
    const roleDisplay = roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join ${organizationName} on Teamified</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #A16AE8 0%, #8096FD 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; background-color: #f8f9fa; }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #A16AE8 0%, #8096FD 100%);
            color: white; 
            padding: 14px 36px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .expiry-warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .org-badge { background-color: #A16AE8; color: white; padding: 6px 14px; border-radius: 20px; display: inline-block; font-size: 14px; font-weight: 600; margin: 10px 0; }
        .link-box { background-color: #f3f0ff; padding: 15px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 13px; margin: 15px 0; border-left: 4px solid #A16AE8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.95;">Join ${organizationName} on Teamified</p>
        </div>
        <div class="content">
            <h2 style="margin-top: 0; color: #A16AE8;">Hello ${displayName},</h2>
            
            <p style="font-size: 16px;">You have been invited to join <strong>${organizationName}</strong> on Teamified as a <span class="org-badge">${roleDisplay}</span></p>
            
            <p>Click the button below to accept your invitation and set up your account:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" class="cta-button" style="color: white !important; text-decoration: none;">Accept Invitation</a>
            </div>
            
            <div class="expiry-warning">
                <strong>⏰ Important:</strong> This invitation will expire on <strong>${expiresAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. 
                Please complete your registration before this date.
            </div>
            
            <p style="margin-top: 25px;"><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
            <div class="link-box">
                ${inviteLink}
            </div>
            
            <h3 style="color: #A16AE8; margin-top: 30px;">What's next?</h3>
            <ol style="padding-left: 20px; line-height: 1.8;">
                <li>Click the invitation link above</li>
                <li>Create your secure password</li>
                <li>Complete your profile</li>
                <li>Start collaborating with ${organizationName}</li>
            </ol>
            
            <p style="margin-top: 30px;">If you have any questions or didn't expect this invitation, please contact the administrator at ${organizationName}.</p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">This is an automated message from Teamified.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateOrgInvitationTextTemplate(
    firstName: string | undefined,
    lastName: string | undefined,
    organizationName: string,
    inviteLink: string,
    roleType: string,
    expiresAt: Date,
  ): string {
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName 
      ? firstName 
      : 'there';
    
    const roleDisplay = roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `
You're Invited to Join ${organizationName} on Teamified

Hello ${displayName},

You have been invited to join ${organizationName} on Teamified as a ${roleDisplay}.

To accept your invitation and set up your account, please visit:
${inviteLink}

IMPORTANT: This invitation will expire on ${expiresAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. 
Please complete your registration before this date.

What's next:
1. Click the invitation link above
2. Create your secure password
3. Complete your profile
4. Start collaborating with ${organizationName}

If you have any questions or didn't expect this invitation, please contact the administrator at ${organizationName}.

This is an automated message from Teamified.
© ${new Date().getFullYear()} Teamified. All rights reserved.
`;
  }
}