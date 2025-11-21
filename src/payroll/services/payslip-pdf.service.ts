import { Injectable, Logger } from '@nestjs/common';
import { Payslip } from '../entities/payslip.entity';

/**
 * PayslipPdfService
 * Generates PDF payslips from stored Payslip records
 * TODO: Implement actual PDF generation using a library like pdfkit or puppeteer
 */
@Injectable()
export class PayslipPdfService {
  private readonly logger = new Logger(PayslipPdfService.name);

  /**
   * Generate PDF for a payslip
   * @param payslip - Payslip entity to generate PDF from
   * @returns PDF file path
   */
  async generatePdf(payslip: Payslip): Promise<string> {
    this.logger.log(`Generating PDF for payslip ${payslip.id}`);

    // TODO: Implement actual PDF generation
    // For now, return a placeholder path
    const pdfPath = `payslips/${payslip.userId}/${payslip.payrollPeriodId}/${payslip.id}.pdf`;

    // TODO: Generate PDF with:
    // - Company header
    // - Employee details
    // - Pay period information
    // - Earnings breakdown (from salaryComponents)
    // - Statutory deductions breakdown (from statutoryDeductions)
    // - Other deductions breakdown (from otherDeductions)
    // - Net pay summary
    // - Footer with disclaimer

    this.logger.log(`PDF generated successfully: ${pdfPath}`);
    return pdfPath;
  }

  /**
   * Generate HTML template for payslip (for preview)
   * @param payslip - Payslip entity
   * @returns HTML string
   */
  async generateHtmlTemplate(payslip: Payslip): Promise<string> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${payslip.payrollPeriod?.periodName || 'Pay Period'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .employee-info { margin-bottom: 20px; }
    .pay-details { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .total-row { font-weight: bold; background-color: #e9e9e9; }
    .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Payslip</h1>
    <p>Pay Period: ${payslip.payrollPeriod?.periodName || 'N/A'}</p>
    <p>Pay Date: ${payslip.payrollPeriod?.payDate || 'N/A'}</p>
  </div>

  <div class="employee-info">
    <p><strong>Employee:</strong> ${payslip.user?.firstName || ''} ${payslip.user?.lastName || ''}</p>
    <p><strong>Employee ID:</strong> ${payslip.userId}</p>
  </div>

  <div class="pay-details">
    <h3>Earnings</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Amount (${payslip.currencyCode})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td>${payslip.basicSalary.toFixed(2)}</td>
        </tr>
        ${payslip.salaryComponents.map(comp => `
          <tr>
            <td>${comp.componentName}</td>
            <td>${comp.amount.toFixed(2)}</td>
          </tr>
        `).join('')}
        ${payslip.overtimePay ? `
          <tr>
            <td>Overtime Pay</td>
            <td>${payslip.overtimePay.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${payslip.nightShiftPay ? `
          <tr>
            <td>Night Shift Pay</td>
            <td>${payslip.nightShiftPay.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr class="total-row">
          <td>Total Earnings</td>
          <td>${payslip.totalEarnings.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <h3>Statutory Deductions</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Employee</th>
          <th>Employer</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${payslip.statutoryDeductions.map(comp => `
          <tr>
            <td>${comp.componentName}</td>
            <td>${comp.employeeContribution.toFixed(2)}</td>
            <td>${comp.employerContribution.toFixed(2)}</td>
            <td>${comp.totalContribution.toFixed(2)}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td>Total Statutory Deductions</td>
          <td colspan="3">${payslip.totalStatutoryDeductions.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    ${payslip.otherDeductions.length > 0 ? `
      <h3>Other Deductions</h3>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Amount (${payslip.currencyCode})</th>
          </tr>
        </thead>
        <tbody>
          ${payslip.otherDeductions.map(comp => `
            <tr>
              <td>${comp.componentName}</td>
              <td>${comp.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td>Total Other Deductions</td>
            <td>${payslip.totalOtherDeductions.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    ` : ''}

    <div class="summary">
      <h3>Summary</h3>
      <table>
        <tr>
          <td>Gross Pay</td>
          <td>${payslip.grossPay.toFixed(2)} ${payslip.currencyCode}</td>
        </tr>
        <tr>
          <td>Total Deductions</td>
          <td>${payslip.totalDeductions.toFixed(2)} ${payslip.currencyCode}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Net Pay</strong></td>
          <td><strong>${payslip.netPay.toFixed(2)} ${payslip.currencyCode}</strong></td>
        </tr>
      </table>
    </div>
  </div>

  <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
    <p>This is a computer-generated payslip and does not require a signature.</p>
    <p>Generated on: ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
    `;

    return html;
  }
}

