import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { UserEmail, EmailType } from './entities/user-email.entity';
import { User } from '../auth/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { AddUserEmailDto } from './dto/add-user-email.dto';
import { UserEmailResponseDto } from './dto/user-email-response.dto';
import { EmailService } from '../email/services/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserEmailsService {
  private readonly logger = new Logger(UserEmailsService.name);

  constructor(
    @InjectRepository(UserEmail)
    private readonly userEmailRepository: Repository<UserEmail>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async getUserEmails(userId: string): Promise<UserEmailResponseDto[]> {
    const emails = await this.userEmailRepository.find({
      where: { userId },
      relations: ['organization'],
      order: { isPrimary: 'DESC', addedAt: 'ASC' },
    });

    return emails.map(email => this.toResponseDto(email));
  }

  async addEmail(userId: string, dto: AddUserEmailDto): Promise<UserEmailResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      if (existingEmail.userId === userId) {
        throw new ConflictException('This email is already linked to your account');
      }
      throw new ConflictException(
        'This email is already associated with another account. If this is your email, please use the account linking feature.',
      );
    }

    if (dto.emailType === EmailType.WORK && dto.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: dto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
    }

    const existingUserEmails = await this.userEmailRepository.find({
      where: { userId },
    });

    const isPrimary = existingUserEmails.length === 0;

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    const userEmail = this.userEmailRepository.create({
      userId,
      email: normalizedEmail,
      emailType: dto.emailType || EmailType.PERSONAL,
      organizationId: dto.organizationId || null,
      isPrimary,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await this.userEmailRepository.save(userEmail);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.sendVerificationEmail(normalizedEmail, user.firstName, verificationToken);
    }

    this.logger.log(`Email ${normalizedEmail} added to user ${userId}`);

    const savedEmail = await this.userEmailRepository.findOne({
      where: { id: userEmail.id },
      relations: ['organization'],
    });

    return this.toResponseDto(savedEmail!);
  }

  async removeEmail(userId: string, emailId: string): Promise<void> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (email.isPrimary) {
      throw new BadRequestException('Cannot remove primary email. Set another email as primary first.');
    }

    await this.userEmailRepository.remove(email);
    this.logger.log(`Email ${email.email} removed from user ${userId}`);
  }

  async updateEmail(userId: string, emailId: string, newEmailAddress: string): Promise<UserEmailResponseDto> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
      relations: ['organization'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (email.emailType === EmailType.WORK) {
      throw new ForbiddenException('Work emails cannot be edited. Contact your organization administrator.');
    }

    const normalizedEmail = newEmailAddress.toLowerCase().trim();

    if (normalizedEmail === email.email) {
      return this.toResponseDto(email);
    }

    const existingEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      if (existingEmail.userId === userId) {
        throw new ConflictException('This email is already linked to your account');
      }
      throw new ConflictException(
        'This email is already associated with another account.',
      );
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    const oldEmail = email.email;
    email.email = normalizedEmail;
    email.isVerified = false;
    email.verifiedAt = null;
    email.verificationToken = verificationToken;
    email.verificationTokenExpiry = verificationTokenExpiry;

    await this.userEmailRepository.save(email);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.sendVerificationEmail(normalizedEmail, user.firstName, verificationToken);
    }

    this.logger.log(`Email updated from ${oldEmail} to ${normalizedEmail} for user ${userId}`);

    const updatedEmail = await this.userEmailRepository.findOne({
      where: { id: emailId },
      relations: ['organization'],
    });

    return this.toResponseDto(updatedEmail!);
  }

  async verifyEmail(token: string): Promise<{ success: boolean; email: string }> {
    const email = await this.userEmailRepository.findOne({
      where: { verificationToken: token },
    });

    if (!email) {
      throw new NotFoundException('Invalid verification token');
    }

    if (email.verificationTokenExpiry && new Date() > email.verificationTokenExpiry) {
      throw new BadRequestException('Verification token has expired');
    }

    email.isVerified = true;
    email.verifiedAt = new Date();
    email.verificationToken = null;
    email.verificationTokenExpiry = null;

    await this.userEmailRepository.save(email);

    if (email.isPrimary) {
      await this.userRepository.update(email.userId, { emailVerified: true });
    }

    this.logger.log(`Email ${email.email} verified for user ${email.userId}`);

    return { success: true, email: email.email };
  }

  async setPrimaryEmail(userId: string, emailId: string): Promise<UserEmailResponseDto> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
      relations: ['organization'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (!email.isVerified) {
      throw new BadRequestException('Cannot set an unverified email as primary');
    }

    await this.userEmailRepository.update({ userId }, { isPrimary: false });

    email.isPrimary = true;
    await this.userEmailRepository.save(email);

    await this.userRepository.update(userId, { email: email.email });

    this.logger.log(`Email ${email.email} set as primary for user ${userId}`);

    return this.toResponseDto(email);
  }

  async resendVerification(userId: string, emailId: string): Promise<void> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (email.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    email.verificationToken = verificationToken;
    email.verificationTokenExpiry = verificationTokenExpiry;

    await this.userEmailRepository.save(email);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.sendVerificationEmail(email.email, user.firstName, verificationToken);
    }

    this.logger.log(`Verification email resent to ${email.email}`);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();

    const legacyUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (legacyUser) {
      return legacyUser;
    }

    const userEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['user'],
    });

    if (userEmail && userEmail.user) {
      return userEmail.user;
    }

    return null;
  }

  async findUserByAnyEmail(emails: string[]): Promise<User | null> {
    const normalizedEmails = emails.map(e => e.toLowerCase().trim());

    for (const email of normalizedEmails) {
      const user = await this.findUserByEmail(email);
      if (user) {
        return user;
      }
    }

    return null;
  }

  async checkEmailBelongsToExistingUser(email: string): Promise<{ exists: boolean; userId?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    const userEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (userEmail) {
      return { exists: true, userId: userEmail.userId };
    }

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (user) {
      return { exists: true, userId: user.id };
    }

    return { exists: false };
  }

  async addWorkEmailForOrganization(
    userId: string,
    email: string,
    organizationId: string,
  ): Promise<UserEmailResponseDto> {
    return this.addEmail(userId, {
      email,
      emailType: EmailType.WORK,
      organizationId,
    });
  }

  async adminAddEmail(
    userId: string,
    dto: {
      email: string;
      emailType?: EmailType;
      organizationId?: string;
      isPrimary?: boolean;
      skipVerification?: boolean;
    },
  ): Promise<UserEmailResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      if (existingEmail.userId === userId) {
        throw new ConflictException('This email is already linked to this user');
      }
      throw new ConflictException('This email is already associated with another account');
    }

    if (dto.emailType === EmailType.WORK && dto.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: dto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
    }

    const existingUserEmails = await this.userEmailRepository.find({
      where: { userId },
    });

    const isPrimary = dto.isPrimary || existingUserEmails.length === 0;

    if (isPrimary && existingUserEmails.length > 0) {
      await this.userEmailRepository.update({ userId }, { isPrimary: false });
    }

    const isVerified = dto.skipVerification || false;
    const verificationToken = isVerified ? null : this.generateVerificationToken();
    const verificationTokenExpiry = isVerified ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userEmail = this.userEmailRepository.create({
      userId,
      email: normalizedEmail,
      emailType: dto.emailType || EmailType.PERSONAL,
      organizationId: dto.organizationId || null,
      isPrimary,
      isVerified,
      verifiedAt: isVerified ? new Date() : null,
      verificationToken,
      verificationTokenExpiry,
    });

    await this.userEmailRepository.save(userEmail);

    if (!isVerified) {
      await this.sendVerificationEmail(normalizedEmail, user.firstName, verificationToken!);
    }

    if (isPrimary) {
      await this.userRepository.update(userId, { email: normalizedEmail, emailVerified: isVerified });
    }

    this.logger.log(`Admin added email ${normalizedEmail} to user ${userId}`);

    const savedEmail = await this.userEmailRepository.findOne({
      where: { id: userEmail.id },
      relations: ['organization'],
    });

    return this.toResponseDto(savedEmail!);
  }

  async adminUpdateEmail(
    userId: string,
    emailId: string,
    dto: { email: string; skipVerification?: boolean },
  ): Promise<UserEmailResponseDto> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
      relations: ['organization'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    const normalizedEmail = dto.email.toLowerCase().trim();

    if (normalizedEmail === email.email) {
      return this.toResponseDto(email);
    }

    const existingEmail = await this.userEmailRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      if (existingEmail.userId === userId) {
        throw new ConflictException('This email is already linked to this user');
      }
      throw new ConflictException('This email is already associated with another account');
    }

    const oldEmail = email.email;
    const isVerified = dto.skipVerification || false;

    email.email = normalizedEmail;
    email.isVerified = isVerified;
    email.verifiedAt = isVerified ? new Date() : null;
    email.verificationToken = isVerified ? null : this.generateVerificationToken();
    email.verificationTokenExpiry = isVerified ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userEmailRepository.save(email);

    if (!isVerified) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.sendVerificationEmail(normalizedEmail, user.firstName, email.verificationToken!);
      }
    }

    if (email.isPrimary) {
      await this.userRepository.update(userId, { email: normalizedEmail, emailVerified: isVerified });
    }

    this.logger.log(`Admin updated email from ${oldEmail} to ${normalizedEmail} for user ${userId}`);

    const updatedEmail = await this.userEmailRepository.findOne({
      where: { id: emailId },
      relations: ['organization'],
    });

    return this.toResponseDto(updatedEmail!);
  }

  async adminRemoveEmail(userId: string, emailId: string): Promise<void> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    if (email.isPrimary) {
      throw new BadRequestException('Cannot remove primary email. Set another email as primary first.');
    }

    await this.userEmailRepository.remove(email);
    this.logger.log(`Admin removed email ${email.email} from user ${userId}`);
  }

  async adminVerifyEmail(userId: string, emailId: string): Promise<UserEmailResponseDto> {
    const email = await this.userEmailRepository.findOne({
      where: { id: emailId, userId },
      relations: ['organization'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    email.isVerified = true;
    email.verifiedAt = new Date();
    email.verificationToken = null;
    email.verificationTokenExpiry = null;

    await this.userEmailRepository.save(email);

    if (email.isPrimary) {
      await this.userRepository.update(userId, { emailVerified: true });
    }

    this.logger.log(`Admin verified email ${email.email} for user ${userId}`);

    return this.toResponseDto(email);
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async sendVerificationEmail(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    try {
      await this.emailService.sendEmailVerificationReminder(email, firstName, token);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
    }
  }

  private toResponseDto(email: UserEmail): UserEmailResponseDto {
    return {
      id: email.id,
      email: email.email,
      emailType: email.emailType,
      organizationId: email.organizationId,
      organizationName: email.organization?.name || null,
      isPrimary: email.isPrimary,
      isVerified: email.isVerified,
      verifiedAt: email.verifiedAt,
      addedAt: email.addedAt,
    };
  }
}
