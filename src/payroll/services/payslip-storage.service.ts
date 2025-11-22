import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payslip } from '../entities/payslip.entity';
import { PayrollCalculationResult } from '../dto/payroll-calculation.dto';
import { PayslipListQueryDto } from '../dto/payslip.dto';
import { PayslipPdfService } from './payslip-pdf.service';
import { PayslipNotificationService } from './payslip-notification.service';

/**
 * PayslipStorageService
 * Stores payroll calculation results from Story 7.3 as Payslip records
 * This service does NOT perform calculations - it only stores results
 */
@Injectable()
export class PayslipStorageService {
  private readonly logger = new Logger(PayslipStorageService.name);

  constructor(
    @InjectRepository(Payslip)
    private readonly payslipRepository: Repository<Payslip>,
    private readonly payslipPdfService: PayslipPdfService,
    private readonly payslipNotificationService: PayslipNotificationService,
  ) {}

  /**
   * Save a payroll calculation result as a Payslip
   * @param calculationResult - Result from Story 7.3 PayrollCalculationService
   */
  async saveCalculationResult(calculationResult: PayrollCalculationResult): Promise<Payslip> {
    try {
      this.logger.log(`Saving payslip for user ${calculationResult.userId}, calculation ${calculationResult.calculationId}`);

      // Check if payslip already exists for this calculation
      const existing = await this.payslipRepository.findOne({
        where: { calculationId: calculationResult.calculationId },
      });

      if (existing) {
        this.logger.warn(`Payslip already exists for calculation ${calculationResult.calculationId}`);
        return existing;
      }

      // Create payslip from calculation result
      const payslip = this.payslipRepository.create({
        userId: calculationResult.userId,
        countryId: calculationResult.countryId,
        payrollPeriodId: calculationResult.payrollPeriodId,
        calculationId: calculationResult.calculationId,
        calculatedAt: calculationResult.calculatedAt,
        
        // Core amounts
        grossPay: calculationResult.grossPay,
        basicSalary: calculationResult.basicSalary,
        totalEarnings: calculationResult.totalEarnings,
        overtimePay: calculationResult.overtimePay || null,
        nightShiftPay: calculationResult.nightShiftPay || null,
        totalStatutoryDeductions: calculationResult.totalStatutoryDeductions,
        totalOtherDeductions: calculationResult.totalOtherDeductions,
        totalDeductions: calculationResult.totalDeductions,
        netPay: calculationResult.netPay,
        currencyCode: calculationResult.currencyCode,
        
        // Detailed breakdowns
        salaryComponents: calculationResult.salaryComponents as any,
        statutoryDeductions: calculationResult.statutoryDeductions as any,
        otherDeductions: calculationResult.otherDeductions as any,
        metadata: calculationResult.metadata || null,
        
        // Initial status
        status: 'processing',
      });

      const saved = await this.payslipRepository.save(payslip);
      this.logger.log(`Payslip saved successfully: ${saved.id}`);
      
      return saved;
    } catch (error) {
      this.logger.error(`Failed to save payslip: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to save payslip: ${error.message}`);
    }
  }

  /**
   * Mark payslip as available for employee access
   * Generates PDF and sends notification
   */
  async markAvailable(payslipId: string): Promise<Payslip> {
    const payslip = await this.findOne(payslipId);
    
    // Generate PDF
    const pdfPath = await this.payslipPdfService.generatePdf(payslip);
    payslip.pdfPath = pdfPath;
    payslip.pdfGeneratedAt = new Date();
    
    // Mark as available
    payslip.status = 'available';
    const saved = await this.payslipRepository.save(payslip);
    
    // Send notification
    await this.payslipNotificationService.notifyPayslipAvailable(saved);
    
    this.logger.log(`Payslip ${payslipId} marked as available and notification sent`);
    return saved;
  }

  /**
   * Update payslip PDF path after generation
   */
  async updatePdfPath(payslipId: string, pdfPath: string): Promise<Payslip> {
    const payslip = await this.findOne(payslipId);
    
    payslip.pdfPath = pdfPath;
    payslip.pdfGeneratedAt = new Date();
    
    return await this.payslipRepository.save(payslip);
  }

  /**
   * Mark payslip as downloaded
   */
  async markDownloaded(payslipId: string): Promise<Payslip> {
    const payslip = await this.findOne(payslipId);
    
    if (!payslip.firstDownloadedAt) {
      payslip.firstDownloadedAt = new Date();
    }
    
    if (payslip.status === 'available') {
      payslip.status = 'downloaded';
    }
    
    const saved = await this.payslipRepository.save(payslip);
    
    // Notify about download
    await this.payslipNotificationService.notifyPayslipDownloaded(saved);
    
    return saved;
  }

  /**
   * Find payslip by ID
   */
  async findOne(id: string): Promise<Payslip> {
    const payslip = await this.payslipRepository.findOne({
      where: { id },
      relations: ['user', 'country', 'payrollPeriod'],
    });

    if (!payslip) {
      throw new NotFoundException(`Payslip with ID ${id} not found`);
    }

    return payslip;
  }

  /**
   * Find all payslips for a user
   */
  async findByUser(userId: string, query?: PayslipListQueryDto): Promise<Payslip[]> {
    const queryBuilder = this.payslipRepository
      .createQueryBuilder('payslip')
      .leftJoinAndSelect('payslip.country', 'country')
      .leftJoinAndSelect('payslip.payrollPeriod', 'payrollPeriod')
      .where('payslip.userId = :userId', { userId });

    if (query?.payrollPeriodId) {
      queryBuilder.andWhere('payslip.payrollPeriodId = :payrollPeriodId', {
        payrollPeriodId: query.payrollPeriodId,
      });
    }

    if (query?.countryId) {
      queryBuilder.andWhere('payslip.countryId = :countryId', {
        countryId: query.countryId,
      });
    }

    if (query?.status) {
      queryBuilder.andWhere('payslip.status = :status', {
        status: query.status,
      });
    }

    if (query?.fromDate) {
      queryBuilder.andWhere('payslip.calculatedAt >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query?.toDate) {
      queryBuilder.andWhere('payslip.calculatedAt <= :toDate', {
        toDate: query.toDate,
      });
    }

    queryBuilder.orderBy('payslip.calculatedAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Find payslips for a payroll period
   */
  async findByPeriod(payrollPeriodId: string): Promise<Payslip[]> {
    return await this.payslipRepository.find({
      where: { payrollPeriodId },
      relations: ['user', 'country', 'payrollPeriod'],
      order: { calculatedAt: 'DESC' },
    });
  }

  /**
   * Delete payslip (admin only)
   */
  async delete(id: string): Promise<void> {
    const payslip = await this.findOne(id);
    await this.payslipRepository.remove(payslip);
    this.logger.log(`Payslip ${id} deleted`);
  }
}

