import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Invitation } from '../../invitations/entities/invitation.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@teamified.com'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendInvitationEmail(invitation: Invitation): Promise<boolean> {
    const inviteLink = this.generateInviteLink(invitation.token);
    
    const htmlTemplate = this.generateInvitationHtmlTemplate(invitation, inviteLink);
    const textTemplate = this.generateInvitationTextTemplate(invitation, inviteLink);

    return this.sendEmail({
      to: invitation.email,
      subject: 'Welcome to Teamified EOR Portal - Complete Your Registration',
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
      subject: 'Please verify your email address - Teamified EOR Portal',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const htmlTemplate = this.generateWelcomeHtmlTemplate(firstName);
    const textTemplate = this.generateWelcomeTextTemplate(firstName);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Teamified EOR Portal - Email Verified Successfully',
      html: htmlTemplate,
      text: textTemplate,
    });
  }

  private generateInviteLink(token: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'https://portal.teamified.com');
    return `${baseUrl}/accept-invitation?token=${token}`;
  }

  private generateVerificationLink(token: string): string {
    const baseUrl = this.configService.get('FRONTEND_URL', 'https://portal.teamified.com');
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private generateInvitationHtmlTemplate(invitation: Invitation, inviteLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Teamified EOR Portal</title>
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
            <h1>Welcome to Teamified EOR Portal</h1>
        </div>
        <div class="content">
            <h2>Hello ${invitation.firstName} ${invitation.lastName},</h2>
            <p>You have been invited to join the Teamified EOR Portal as a <strong>${invitation.role}</strong>.</p>
            
            <p>To complete your registration and access the portal, please click the button below:</p>
            
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
                <li>Start using the EOR Portal</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from Teamified EOR Portal.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateInvitationTextTemplate(invitation: Invitation, inviteLink: string): string {
    return `
Welcome to Teamified EOR Portal

Hello ${invitation.firstName} ${invitation.lastName},

You have been invited to join the Teamified EOR Portal as a ${invitation.role}.

To complete your registration and access the portal, please visit:
${inviteLink}

IMPORTANT: This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}. 
Please complete your registration before this date.

What's next:
1. Click the invitation link above
2. Set up your secure password
3. Complete your profile information
4. Start using the EOR Portal

If you have any questions or need assistance, please contact our support team.

This is an automated message from Teamified EOR Portal.
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
            <p>We noticed that you haven't verified your email address yet. Email verification is required to access all features of the Teamified EOR Portal.</p>
            
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
            <p>This is an automated reminder from Teamified EOR Portal.</p>
            <p>© ${new Date().getFullYear()} Teamified. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateVerificationReminderTextTemplate(firstName: string, verificationLink: string): string {
    return `
Email Verification Required - Teamified EOR Portal

Hello ${firstName},

We noticed that you haven't verified your email address yet. Email verification is required to access all features of the Teamified EOR Portal.

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

This is an automated reminder from Teamified EOR Portal.
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
    <title>Welcome to Teamified EOR Portal</title>
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
            <h1>🎉 Welcome to Teamified EOR Portal!</h1>
        </div>
        <div class="content">
            <h2>Congratulations, ${firstName}!</h2>
            
            <div class="success-box">
                <strong>✅ Email Verified Successfully!</strong><br>
                Your email address has been verified and your account is now fully activated.
            </div>
            
            <p>You now have access to all the features of the Teamified EOR Portal, including:</p>
            
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
Welcome to Teamified EOR Portal!

Congratulations, ${firstName}!

✅ EMAIL VERIFIED SUCCESSFULLY!
Your email address has been verified and your account is now fully activated.

You now have access to all the features of the Teamified EOR Portal, including:

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
}