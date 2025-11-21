# Payroll Administration User Guide
**Teamified Multi-Region Payroll System**

**Version:** 1.0  
**Last Updated:** October 4, 2025  
**Target Audience:** HR Managers, Payroll Administrators, System Administrators

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites & Access](#prerequisites--access)
3. [Phase 1: Initial Configuration (One-Time Setup)](#phase-1-initial-configuration-one-time-setup)
4. [Phase 2: Monthly Payroll Period Setup](#phase-2-monthly-payroll-period-setup)
5. [Phase 3: Employee Data Collection (Automated)](#phase-3-employee-data-collection-automated)
6. [Phase 4: Payroll Processing](#phase-4-payroll-processing)
7. [Phase 5: Bank Payment (Manual Workaround)](#phase-5-bank-payment-manual-workaround)
8. [Phase 6: Employee Access (Automatic)](#phase-6-employee-access-automatic)
9. [Phase 7: Compliance Reporting (Coming Soon)](#phase-7-compliance-reporting-coming-soon)
10. [Troubleshooting](#troubleshooting)
11. [FAQs](#faqs)
12. [Support](#support)

---

## Overview

The Teamified Payroll System provides a comprehensive multi-region payroll management platform that supports India and Philippines (with Australia planned for future). The system automates the entire payroll workflow from timesheet collection to payslip generation and notification.

### Key Features
- ✅ **Multi-Region Support:** India, Philippines (Australia coming soon)
- ✅ **Automated Workflow:** Timesheets → Leave → Calculation → Payslips → Notifications
- ✅ **Configuration Management:** Tax years, salary components, statutory components, exchange rates
- ✅ **Real-Time Monitoring:** Live tracking of payroll processing with performance metrics
- ✅ **Employee Self-Service:** Employees can view/download payslips and contribution summaries
- ✅ **Audit Trail:** Complete tracking of all payroll operations and changes
- ✅ **Country-Based Employment:** Employment records are directly linked to countries for proper data isolation

### How Country Relationships Work

**Employment Records & Countries:**
- Every employment record is **directly linked to a specific country**
- When you process payroll for a country, the system automatically filters employees based on their employment country
- This ensures **data isolation** - India payroll won't accidentally include Philippines employees
- Example: If an employee has multiple employment records in different countries, each is processed independently

**Country Selection:**
```
User → Employment Record → Country
                     ↓
                Payroll Period (Country-Specific)
```

**Why This Matters:**
- **Security:** Prevents accidental payroll processing across countries
- **Compliance:** Each country has different tax laws, statutory requirements
- **Reporting:** Clean separation of payroll data by region

### Current Limitations

⚠️ **Bank Payment Files:** Bank payment file generation is not yet implemented. Use bulk export (CSV/Excel) as a workaround.

⚠️ **Compliance Reporting:** Automated compliance reports (PF, ESI, TDS, PT for India; SSS, PhilHealth, Pag-IBIG, BIR for Philippines) are planned but not yet implemented.

### Recent Enhancements (October 2025)

✅ **Employee Selection (Story 7.8.1):** You can now select specific employees for payroll processing! Use the "Select Employees" button in the Processing Control panel to choose which employees to include in a payroll run.

✅ **Country-Based Filtering (Story 7.8.2):** Employee selection now correctly filters by country with direct database relationships for improved security and performance.

---

## Prerequisites & Access

### User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Admin** | Full Access | All payroll configuration, processing, and monitoring |
| **HR** | Full Access | All payroll configuration, processing, and monitoring |
| **Account Manager** | Configuration Only | Payroll configuration (salary/statutory components) |
| **Employee** | Self-Service | View own payslips, timesheets, leave requests |

### Required Access
- **URL:** http://localhost/payroll-administration
- **Browser:** Chrome, Firefox, Safari, Edge (latest versions)
- **Credentials:** Provided by system administrator

### Navigation
1. Log in with your credentials
2. Click **"Payroll Administration"** in the left sidebar (visible only to Admin/HR roles)
3. You'll see 4 tabs:
   - **Period Management** - Create and manage payroll periods
   - **Processing Control** - Start/stop/monitor payroll processing
   - **Monitoring** - Real-time performance metrics and analytics
   - **Bulk Operations** - Bulk period operations and data export

---

## Phase 1: Initial Configuration (One-Time Setup)

This phase is performed once per country when setting up the payroll system.

### Step 1.1: Configure Country Settings

**Location:** `/payroll-configuration`

1. Navigate to **Payroll Configuration** from the sidebar
2. You'll see 5 tabs: Tax Years, Region Configurations, Exchange Rates, Salary Components, Statutory Components

#### 1.1a: Tax Years Tab

**Purpose:** Define fiscal tax years for each country.

**Instructions:**
1. Click the **"Tax Years"** tab
2. Select country from dropdown (e.g., India)
3. Click **"Add Tax Year"** button
4. Fill in the form:
   - **Year:** Enter fiscal year (e.g., 2024 for FY 2024-25)
   - **Start Date:** Tax year start (e.g., 2024-04-01 for India)
   - **End Date:** Tax year end (e.g., 2025-03-31 for India)
   - **Set as Current Tax Year:** ✓ Check this box for the active tax year
5. Click **"Save"**

**Example for India:**
- Year: 2024
- Start Date: 2024-04-01
- End Date: 2025-03-31
- Current: Yes ✓

**Example for Philippines:**
- Year: 2024
- Start Date: 2024-01-01
- End Date: 2024-12-31
- Current: Yes ✓

**Important:** Only ONE tax year per country can be marked as "Current".

#### 1.1b: Region Configurations Tab (Optional)

**Purpose:** Configure country-specific settings (company details, tax IDs, etc.).

**Instructions:**
1. Click the **"Region Configurations"** tab
2. Select country from dropdown
3. Click **"Add Configuration"** button
4. Fill in the form:
   - **Configuration Key:** Unique identifier (e.g., `COMPANY_TAX_ID`)
   - **Configuration Name:** Display name (e.g., `Company GST Number`)
   - **Value Type:** String/Number/Boolean/JSON
   - **Configuration Value:** The actual value
   - **Description:** Purpose of this configuration
   - **Active:** Yes ✓
5. Click **"Save"**

**Common Configurations:**
- Company PAN/TAN (India)
- Company GSTIN (India)
- Company BIR Registration (Philippines)
- Default payment modes

#### 1.1c: Exchange Rates Tab (Multi-Currency Only)

**Purpose:** Set currency exchange rates for multi-currency payroll.

**Instructions:**
1. Click the **"Exchange Rates"** tab
2. Select country from dropdown
3. Click **"Add Exchange Rate"** button
4. Fill in the form:
   - **From Currency:** Source currency (e.g., USD)
   - **To Currency:** Target currency (e.g., INR)
   - **Exchange Rate:** Current rate (e.g., 83.50)
   - **Effective Date:** When this rate becomes active
5. Click **"Save"**

**Example:**
- From: USD
- To: INR
- Rate: 83.50
- Effective Date: 2024-10-01

**Note:** The system shows the reversed rate automatically (e.g., INR → USD: 0.011976).

---

### Step 1.2: Configure Payroll Components

**Location:** `/payroll-configuration` → **Salary Components** and **Statutory Components** tabs

#### 1.2a: Salary Components Tab

**Purpose:** Define earnings and benefits (Basic Salary, HRA, DA, Allowances, etc.).

**Instructions:**
1. Click the **"Salary Components"** tab
2. Select country from dropdown (e.g., India)
3. Click **"Add Component"** button
4. Fill in the form:
   - **Component Code:** Unique code (e.g., `BASIC_SALARY`)
   - **Component Name:** Display name (e.g., `Basic Salary`)
   - **Component Type:** Earning, Deduction, or Benefit
   - **Calculation Type:** Fixed, Percentage, or Formula
   - **Calculation Value:** Amount or percentage (e.g., 50 for 50% of gross)
   - **Is Taxable:** Yes/No
   - **Is Active:** Yes ✓
   - **Display Order:** Sequence in payslip (1, 2, 3...)
5. Click **"Save"**

**Example India Salary Components:**

| Code | Name | Type | Calc Type | Calc Value | Taxable | Order |
|------|------|------|-----------|------------|---------|-------|
| BASIC_SALARY | Basic Salary | Earning | Fixed | 0 | Yes | 1 |
| HRA | House Rent Allowance | Earning | Percentage | 50 | Yes | 2 |
| DA | Dearness Allowance | Earning | Percentage | 20 | Yes | 3 |
| SPECIAL_ALLOW | Special Allowance | Earning | Fixed | 0 | Yes | 4 |
| CONVEYANCE | Conveyance Allowance | Earning | Fixed | 1600 | No | 5 |

**Example Philippines Salary Components:**

| Code | Name | Type | Calc Type | Calc Value | Taxable | Order |
|------|------|------|-----------|------------|---------|-------|
| BASIC_SALARY | Basic Salary | Earning | Fixed | 0 | Yes | 1 |
| DEMINIMIS | De Minimis Benefits | Earning | Fixed | 0 | No | 2 |
| ALLOWANCES | Allowances | Earning | Fixed | 0 | Yes | 3 |

#### 1.2b: Statutory Components Tab

**Purpose:** Define mandatory deductions (PF, ESI, TDS for India; SSS, PhilHealth, Pag-IBIG for Philippines).

**Instructions:**
1. Click the **"Statutory Components"** tab
2. Select country from dropdown
3. Click **"Add Component"** button
4. Fill in the form:
   - **Component Code:** Unique code (e.g., `EPF_EMPLOYEE`)
   - **Component Name:** Display name (e.g., `EPF Employee Contribution`)
   - **Statutory Type:** PF, ESI, TDS, PT, SSS, PhilHealth, Pag-IBIG, BIR
   - **Component Type:** Usually Deduction
   - **Contribution By:** Employee, Employer, or Both
   - **Calculation Type:** Percentage or Formula
   - **Calculation Value:** Percentage (e.g., 12 for 12%)
   - **Threshold Amount:** Minimum salary for applicability
   - **Max Amount:** Maximum deduction amount (if any)
   - **Is Active:** Yes ✓
5. Click **"Save"**

**Example India Statutory Components:**

| Code | Name | Statutory Type | Contribution By | Calc Type | Calc Value | Threshold | Max Amount |
|------|------|----------------|-----------------|-----------|------------|-----------|------------|
| EPF_EMPLOYEE | EPF Employee Contribution | PF | Employee | Percentage | 12 | 0 | 1800 |
| EPF_EMPLOYER | EPF Employer Contribution | PF | Employer | Percentage | 12 | 0 | 1800 |
| ESI_EMPLOYEE | ESI Employee Contribution | ESI | Employee | Percentage | 0.75 | 0 | 21000 |
| ESI_EMPLOYER | ESI Employer Contribution | ESI | Employer | Percentage | 3.25 | 0 | 21000 |
| TDS | Tax Deducted at Source | TDS | Employee | Formula | 0 | 250000 | 0 |
| PT | Professional Tax | PT | Employee | Fixed | 200 | 0 | 0 |

**Example Philippines Statutory Components:**

| Code | Name | Statutory Type | Contribution By | Calc Type | Calc Value | Threshold | Max Amount |
|------|------|----------------|-----------------|-----------|------------|-----------|------------|
| SSS_EMPLOYEE | SSS Employee Contribution | SSS | Employee | Percentage | 4.5 | 0 | 0 |
| SSS_EMPLOYER | SSS Employer Contribution | SSS | Employer | Percentage | 9.5 | 0 | 0 |
| PHILHEALTH_EMPLOYEE | PhilHealth Employee | PhilHealth | Employee | Percentage | 2 | 0 | 0 |
| PHILHEALTH_EMPLOYER | PhilHealth Employer | PhilHealth | Employer | Percentage | 2 | 0 | 0 |
| PAGIBIG_EMPLOYEE | Pag-IBIG Employee | Pag-IBIG | Employee | Percentage | 2 | 0 | 5000 |
| PAGIBIG_EMPLOYER | Pag-IBIG Employer | Pag-IBIG | Employer | Percentage | 2 | 0 | 5000 |

**Important Notes:**
- Threshold Amount: Salary below this amount is exempt
- Max Amount: Maximum contribution ceiling
- Calculation Value: Percentage is applied to gross/basic salary (depends on statutory rules)

---

## Phase 2: Monthly Payroll Period Setup

This phase is performed at the start of each payroll cycle (e.g., monthly).

### Step 2.1: Create Payroll Period

**Location:** `/payroll-administration` → **Period Management** tab

**Instructions:**
1. Navigate to **Payroll Administration**
2. Click the **"Period Management"** tab
3. Click **"Create Period"** button
4. Fill in the form:
   - **Period Name:** Descriptive name (e.g., "October 2025 - India")
   - **Country:** Select country (e.g., India)
   - **Start Date:** Period start date (e.g., 2025-10-01)
   - **End Date:** Period end date (e.g., 2025-10-31)
   - **Pay Date:** Actual payment date (e.g., 2025-11-05)
5. Click **"Create"**

**Result:** New period created with status **DRAFT** → automatically changes to **OPEN** when ready for processing.

**Period Naming Convention (Recommended):**
- `MMM YYYY - Country` (e.g., "Oct 2025 - India")
- `MMM DD-DD YYYY - Country` (e.g., "Oct 01-31 2025 - Philippines")

**Period Status Lifecycle:**
- **DRAFT:** Period created but not ready for processing
- **OPEN:** Period ready for payroll processing
- **PROCESSING:** Payroll calculation in progress
- **COMPLETED:** Payroll processed successfully
- **CLOSED:** Period finalized, no further changes allowed

### Step 2.2: Verify Period Status

**Instructions:**
1. View the Period Management DataGrid
2. Locate your newly created period
3. Verify status is **OPEN** (green chip)
4. Check start/end/pay dates are correct
5. If corrections needed, click **Edit** action button

---

## Phase 3: Employee Data Collection (Automated)

This phase is fully automated and runs continuously throughout the payroll period.

### Step 3.1: Timesheet Submission & Approval

**Employee Actions:**
1. Employees navigate to `/timesheets`
2. Submit timesheets for the period
3. Timesheets can include:
   - Regular hours
   - Overtime hours
   - Leave hours (from approved leave requests)

**Manager Actions:**
1. Managers navigate to `/timesheets`
2. Review submitted timesheets
3. Approve or reject timesheets
4. **Only APPROVED timesheets are included in payroll**

### Step 3.2: Leave Request & Approval

**Employee Actions:**
1. Employees navigate to `/leave`
2. Submit leave requests for the period
3. Leave types: Paid Leave, Sick Leave, Unpaid Leave, etc.

**Manager Actions:**
1. Managers navigate to `/leave`
2. Review leave requests
3. Approve or reject leave requests
4. **Only APPROVED leave is included in payroll**

### Step 3.3: System Behavior

**Automatic Integration:**
- ✅ Approved timesheets are **automatically fetched** during payroll processing (Step 4.2)
- ✅ Approved leave is **automatically fetched** during payroll processing (Step 4.2)
- ✅ No manual data entry required by HR/Payroll admin
- ✅ System validates data before processing

**Data Sources:**
- **Timesheet Hours:** Used for overtime, hourly calculations
- **Leave Days:** Deducted from working days, affects pro-rata calculations
- **Unpaid Leave:** Results in salary deduction

---

## Phase 4: Payroll Processing

This is the core payroll execution phase where calculations are performed.

### Step 4.1: Navigate to Processing Control

**Location:** `/payroll-administration` → **Processing Control** tab

**Instructions:**
1. Click the **"Processing Control"** tab
2. You'll see:
   - Country selector dropdown
   - Period selector dropdown
   - Processing status cards
   - Start/Stop/Retry buttons

### Step 4.2: Select Country and Period

**Instructions:**
1. **Country Dropdown:** Select the country you want to process (e.g., India)
2. **Period Dropdown:** Select the payroll period (only **OPEN** or **PROCESSING** periods are shown)
3. System automatically loads processing status for the selected period

### Step 4.3: Review Employee Count

**Before Starting:**
1. Check the **"Total Employees"** count displayed
2. This shows how many active employees will be processed in the selected country
3. **Current Limitation:** System processes ALL active employees; no UI to exclude specific employees

**Workaround for Employee Exclusion:**
- If you need to exclude specific employees, temporarily mark them as "Inactive" in `/user-management` → Employment Records
- After payroll processing, reactivate them
- **Or** use API call with `userIds` parameter (requires technical knowledge)

### Step 4.4: Initiate Payroll Processing

**Instructions:**
1. Click **"Start Processing"** button
2. Confirmation dialog appears: **"Start payroll processing for [Period Name]?"**
3. Verify details and click **"Confirm"**

**What Happens Next (7-Step Automated Workflow):**

The system orchestrates the following automatically:

1. **Fetch Approved Timesheets** (Story 7.4)
   - Retrieves all approved timesheets for the period
   - Validates timesheet data

2. **Fetch Approved Leave** (Story 7.5)
   - Retrieves all approved leave requests for the period
   - Calculates leave impacts on salary

3. **Calculate Payroll** (Story 7.3)
   - Processes in batches of 50 employees for performance
   - Calculates gross pay (Basic + HRA + DA + Allowances)
   - Calculates statutory deductions (PF, ESI, TDS, PT)
   - Calculates net pay (Gross - Deductions)
   - Uses configured salary and statutory components

4. **Save Payslips** (Story 7.6)
   - Stores calculated payslip data in database
   - Creates payslip records for each employee

5. **Generate PDF Payslips** (Story 7.6)
   - Generates PDF file for each employee payslip
   - Stores PDFs securely

6. **Send Email Notifications** (Story 7.6)
   - Sends email to each employee: "Your payslip for [Period] is ready"
   - Includes link to view/download payslip

7. **Update Processing Log**
   - Records success/failure for each employee
   - Updates period status to **COMPLETED**

### Step 4.5: Monitor Processing Progress

**Real-Time Monitoring:**
- Period status automatically changes to **PROCESSING** (blue chip)
- Progress bar shows completion percentage
- Employee count updates in real-time:
  - **Total Employees:** 100
  - **Processed:** 85
  - **Success:** 82
  - **Failed:** 3
  - **Pending:** 15

**Performance Metrics Cards:**
- **Processing Speed:** Employees/second
- **Success Rate:** Percentage
- **Total Time:** Elapsed time
- **Errors:** Count of failures

**Auto-Refresh:**
- System polls for status updates every **3 seconds** during processing
- No manual refresh required

### Step 4.6: Handle Processing Errors

**If Some Employees Fail:**
1. Processing completes with status **COMPLETED** (but with failed employees)
2. Failed employee count shows in red
3. Click **"View Details"** to see error log

**Retry Failed Employees:**
1. Click **"Retry Failed"** button
2. System re-processes ONLY the failed employees
3. No need to re-run the entire payroll

**Common Error Causes:**
- Missing bank account details
- Invalid salary component configuration
- Missing employment record data
- Data validation failures

### Step 4.7: Verify Completion

**Success Indicators:**
1. Period status changes to **COMPLETED** (green chip)
2. **Success:** 100 (all employees processed)
3. **Failed:** 0 (no errors)
4. Processing time recorded (e.g., "Completed in 2m 15s")

**Next Steps:**
- Employees can now view/download their payslips at `/payslips`
- HR can generate bank payment file (see Phase 5)
- Period can be closed after final verification

---

## Phase 5: Bank Payment (Manual Workaround)

⚠️ **Note:** Bank payment file generation is not yet implemented. Use the following workaround.

### Step 5.1: Export Payroll Data

**Location:** `/payroll-administration` → **Bulk Operations** tab

**Instructions:**
1. Click the **"Bulk Operations"** tab
2. Select the completed payroll period(s)
3. Click **"Export"** button
4. Choose format: **CSV** or **Excel**
5. Click **"Download"**

**Exported Data Includes:**
- Employee Name
- Employee ID
- Department
- Gross Pay
- Total Deductions
- Net Pay
- Bank Account Number (if available)
- IFSC Code / Bank Code (if available)

### Step 5.2: Generate Bank Payment File (Manual)

**Instructions:**
1. Open the exported CSV/Excel file
2. Create a new file in your bank's required format:
   - **India NEFT/RTGS:** Excel format with columns (Beneficiary Name, Account Number, IFSC Code, Amount, Payment Mode, Narration)
   - **Philippines ACH:** CSV format with columns (Account Number, Account Name, Amount, Bank Code, Branch Code)
   - **UK BACS:** Fixed-length text file (requires technical knowledge)
   - **US NACHA:** Fixed-length text file (requires technical knowledge)

3. Map data from export to bank format:
   - Employee Name → Beneficiary Name / Account Name
   - Net Pay → Amount
   - Bank Account → Account Number
   - IFSC/Bank Code → IFSC Code / Bank Code

4. Add required fields:
   - Payment Mode: NEFT or RTGS (India)
   - Narration: "Salary for [Month]"
   - Company details (from your bank)

**Example India NEFT File:**
```
Beneficiary Name | Account Number | IFSC Code | Amount | Payment Mode | Narration
John Doe | 1234567890 | HDFC0001234 | 45000.00 | NEFT | Salary for October 2025
Jane Smith | 9876543210 | ICIC0004567 | 52000.00 | NEFT | Salary for October 2025
```

**Example Philippines ACH File:**
```
Account Number,Account Name,Amount,Bank Code,Branch Code
1234567890,Juan Dela Cruz,25000.00,0010,0123
9876543210,Maria Santos,30000.00,0011,0456
```

### Step 5.3: Upload to Bank

**Instructions:**
1. Log in to your corporate banking portal
2. Navigate to "Bulk Payments" or "Salary Upload" section
3. Upload the bank payment file
4. Verify total amount matches your payroll total
5. Authorize the payment (may require multiple approvers)
6. Submit for processing

**Important:**
- Keep a copy of the uploaded file for audit purposes
- Record the bank reference number
- Track payment status in your banking portal

### Step 5.4: Confirm Payment Status (Manual)

**After Bank Confirmation:**
1. Download bank confirmation file (if available)
2. Verify all employees received payment
3. Document any payment failures
4. For failed payments, re-upload individual payment records

**Future Enhancement:**
- Story 7.12 (Bank Payment Integration) will automate this process
- Will support BACS, NACHA, India NEFT, Philippines ACH formats
- Will include payment status tracking and reconciliation

---

## Phase 6: Employee Access (Automatic)

This phase is fully automated after payroll processing completes.

### Step 6.1: Employee Email Notification

**Automatic Behavior:**
- Each employee receives an email: **"Your payslip for [Month] is ready"**
- Email includes a link to the payslips page
- Sent immediately after PDF generation (during Step 4.4)

### Step 6.2: Employee Views Payslip

**Employee Actions:**
1. Employee logs in to Teamified
2. Navigates to `/payslips`
3. Sees 4 tabs:
   - **My Payslips:** View/download all payslips
   - **Contribution Summary:** YTD statutory contributions (PF, ESI, SSS, etc.)
   - **Tax Documents:** Upload tax-related documents
   - **Generate Payslips:** (Admin/HR only)

**My Payslips Tab:**
- DataGrid showing all payslips
- Columns: Period, Pay Date, Gross Pay, Deductions, Net Pay, Status, Actions
- **Actions:**
  - **View:** Opens payslip preview
  - **Download PDF:** Downloads PDF file

**Contribution Summary Tab:**
- Shows YTD totals for:
  - EPF (India) / SSS (Philippines)
  - ESI (India) / PhilHealth (Philippines)
  - TDS (India) / BIR (Philippines)
  - Professional Tax (India) / Pag-IBIG (Philippines)
- Filterable by country
- Displays employee and employer contributions separately

### Step 6.3: Payslip Contents

**Standard Payslip Sections:**

1. **Header:**
   - Company name and logo
   - Employee name, ID, designation
   - Pay period and pay date

2. **Earnings:**
   - Basic Salary
   - HRA (House Rent Allowance)
   - DA (Dearness Allowance)
   - Special Allowance
   - Other allowances
   - **Gross Pay Total**

3. **Deductions:**
   - EPF / SSS (Employee contribution)
   - ESI / PhilHealth (Employee contribution)
   - TDS / BIR Tax
   - Professional Tax (India)
   - Other deductions
   - **Total Deductions**

4. **Summary:**
   - Gross Pay
   - Total Deductions
   - **Net Pay** (amount to be credited)

5. **Employer Contributions:**
   - EPF / SSS (Employer contribution)
   - ESI / PhilHealth (Employer contribution)

6. **Footer:**
   - Bank account details (last 4 digits)
   - Payment reference number
   - Generated timestamp

---

## Phase 7: Compliance Reporting (Coming Soon)

⚠️ **Note:** Automated compliance reporting (Story 7.7) is not yet implemented.

### Planned Features

**India Compliance Reports:**
- **PF Report:** EPF contributions summary for EPFO filing
- **ESI Report:** ESI contributions summary for ESIC filing
- **TDS Report:** Form 24Q data for income tax filing
- **PT Report:** Professional tax summary for state tax departments

**Philippines Compliance Reports:**
- **SSS Report:** SSS contributions summary
- **PhilHealth Report:** PhilHealth contributions summary
- **Pag-IBIG Report:** Pag-IBIG contributions summary
- **BIR Report:** BIR Form 2316 (tax certificates), BIR Form 1601-C (monthly remittance)

**Planned Functionality:**
- Automated report generation from processed payroll data
- Export in government-required formats (Excel, CSV, PDF)
- Report scheduling (monthly, quarterly, annually)
- Compliance dashboard with deadline tracking
- Filing status tracking

### Current Workaround

**Manual Report Generation:**
1. Export payroll data from Bulk Operations tab (CSV/Excel)
2. Create pivot tables or use Excel formulas to aggregate:
   - Total EPF/SSS contributions by employee
   - Total ESI/PhilHealth contributions by employee
   - TDS/BIR tax deductions by employee
   - YTD totals for annual reports
3. Format according to government templates
4. Submit to respective authorities

---

## Troubleshooting

### Issue 1: Cannot Start Payroll Processing

**Error:** "Payroll processing cannot be started"

**Possible Causes:**
1. Period status is not OPEN
2. Another processing run is already in progress
3. No active employees found in the country

**Solution:**
1. Check period status in Period Management tab (must be OPEN)
2. Wait for current processing to complete or click "Stop Processing"
3. Verify employees have active employment records in the selected country

---

### Issue 2: Some Employees Failed Processing

**Error:** "Processing completed with 5 failed employees"

**Possible Causes:**
1. Missing bank account details
2. Invalid salary configuration
3. Missing employment record data
4. Data validation errors

**Solution:**
1. Click "View Details" to see specific error messages
2. Fix the underlying data issue:
   - Add bank account details in User Management
   - Verify salary component configuration
   - Check employment record is active and valid
3. Click "Retry Failed" to re-process only failed employees

---

### Issue 3: Employee Cannot See Payslip

**Error:** "No payslips found"

**Possible Causes:**
1. Payroll processing not completed
2. Employee was not included in the payroll run
3. Employee marked as inactive

**Solution:**
1. Verify period status is COMPLETED in Period Management
2. Check employee has active employment record during the period
3. Check Processing Log for this employee (Admin view in Monitoring tab)

---

### Issue 4: Wrong Salary Calculation

**Error:** "My salary amount is incorrect"

**Possible Causes:**
1. Incorrect salary component configuration
2. Missing or incorrect timesheet data
3. Leave deductions not applied correctly
4. Statutory deduction thresholds incorrect

**Solution:**
1. Verify salary components are correctly configured in Payroll Configuration
2. Check employee's approved timesheets for the period
3. Verify approved leave requests
4. Check statutory component thresholds and calculation values
5. If issue persists, contact technical support with:
   - Employee ID
   - Period name
   - Expected vs. Actual amounts
   - Screenshot of payslip

---

### Issue 5: Real-Time Monitoring Not Updating

**Error:** Progress bar not moving / stuck at same percentage

**Possible Causes:**
1. Browser network issue
2. Backend processing stuck
3. Auto-refresh stopped

**Solution:**
1. Manually refresh the browser page
2. Check browser console for JavaScript errors (F12)
3. Navigate away and back to Processing Control tab
4. If issue persists after 5 minutes, check backend logs or contact technical support

---

### Issue 6: Bulk Export Fails or Empty

**Error:** "Export file is empty" or "Export failed"

**Possible Causes:**
1. No data in selected period
2. Period not yet processed
3. Server error during export

**Solution:**
1. Verify period status is COMPLETED
2. Check period has processed employees (not 0)
3. Try exporting smaller date range
4. Try different format (CSV vs. Excel)
5. Clear browser cache and retry

---

## FAQs

### General Questions

**Q: How long does payroll processing take?**  
**A:** Processing time depends on the number of employees. Typically:
- 100 employees: 1-2 minutes
- 500 employees: 5-8 minutes
- 1000+ employees: 10-15 minutes

**Q: Can I process payroll for multiple countries simultaneously?**  
**A:** No, you must process each country separately. However, you can run multiple countries in parallel by opening multiple browser tabs.

**Q: Can I reverse or cancel a completed payroll?**  
**A:** No, once processing is COMPLETED, you cannot reverse it. However, you can:
- Create a new "correction" period
- Process adjustments in the next period
- Contact technical support for exceptional cases

**Q: What happens if processing fails midway?**  
**A:** The system records which employees were successfully processed. You can use "Retry Failed" to complete the remaining employees without re-processing successful ones.

---

### Configuration Questions

**Q: How do I change a salary component mid-year?**  
**A:** 
1. Edit the component in Payroll Configuration → Salary Components
2. Change the calculation value or other fields
3. Click "Save"
4. Changes apply to all future payroll runs
5. Past payslips are not affected

**Q: Can I have multiple tax years active simultaneously?**  
**A:** No, only one tax year per country can be marked as "Current". However, you can create historical and future tax years for reference.

**Q: What if statutory rates change (e.g., PF contribution increases)?**  
**A:** 
1. Navigate to Payroll Configuration → Statutory Components
2. Edit the relevant component (e.g., EPF Employee Contribution)
3. Update the calculation value
4. Click "Save"
5. The new rate applies to all future payroll runs from that moment

---

### Processing Questions

**Q: Can I exclude specific employees from a payroll run?**  
**A:** Currently, the UI does not support employee selection. Workarounds:
- Temporarily mark employees as "Inactive" in User Management
- Use API call with `userIds` parameter (requires technical knowledge)
- **Future:** Employee selection UI planned for a future update

**Q: What if an employee joins mid-period?**  
**A:** The system automatically calculates pro-rata salary based on:
- Employment start date
- Number of days worked in the period
- Configured salary components

**Q: What if an employee has unpaid leave?**  
**A:** Unpaid leave automatically reduces the salary pro-rata:
- System fetches approved unpaid leave days
- Deducts proportional salary from net pay
- Statutory deductions are calculated on actual paid days

**Q: Can I manually override a payslip amount?**  
**A:** No, the system does not support manual overrides to maintain audit integrity. Instead:
- Use adjustment salary components (e.g., "Manual Adjustment - Credit" or "Manual Adjustment - Debit")
- Add the adjustment component for specific employees
- Process payroll normally

---

### Employee Access Questions

**Q: Employee says they didn't receive the payslip email**  
**A:** 
1. Verify employee's email address in User Management
2. Check spam/junk folders
3. Employee can still log in and view payslip at `/payslips`
4. Resend notification: (Feature planned for future update)

**Q: Can employees download payslips for previous years?**  
**A:** Yes, the "My Payslips" tab shows all historical payslips. Employees can filter by period and download any payslip PDF.

**Q: Can employees see employer contributions?**  
**A:** Yes, payslips include a section showing employer contributions (EPF, ESI, SSS, PhilHealth, Pag-IBIG employer portions).

---

### Technical Questions

**Q: Where are payslip PDFs stored?**  
**A:** PDFs are stored securely in the server file system at:
- `/app/uploads/payslips/[userId]/[periodId]/payslip.pdf`
- Access is restricted via authentication tokens

**Q: Can I integrate with external HR systems?**  
**A:** Yes, the system provides REST APIs for:
- Payroll period management
- Processing status
- Payslip retrieval
- API documentation available at: `/api-docs`

**Q: What database is used?**  
**A:** PostgreSQL (production), with full entity relationships and indexes for performance.

**Q: Is the system multi-tenant?**  
**A:** Currently single-tenant. Multi-tenancy planned for future versions.

---

## Support

### Contact Information

**Technical Support:**
- **Email:** support@teamified.com
- **Response Time:** 24-48 hours

**Urgent Issues:**
- **Phone:** [To be provided]
- **Hours:** Monday-Friday, 9 AM - 6 PM IST

### Reporting Bugs

When reporting issues, please include:
1. **User Role:** Admin / HR / Employee
2. **Page/Feature:** Where the issue occurred
3. **Steps to Reproduce:** Detailed steps
4. **Expected Behavior:** What should happen
5. **Actual Behavior:** What actually happened
6. **Screenshots:** If applicable
7. **Browser:** Chrome, Firefox, Safari, Edge (and version)

### Feature Requests

Submit feature requests via email with:
1. **Feature Description:** Detailed explanation
2. **Business Need:** Why this feature is needed
3. **Current Workaround:** How you're handling it now
4. **Priority:** High / Medium / Low

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Search navigation |
| `Escape` | Close dialog/modal |
| `Ctrl/Cmd + R` | Refresh current page |
| `Tab` | Navigate form fields |
| `Enter` | Submit form (when focused on submit button) |

---

## Appendix: Status Indicators

### Period Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| DRAFT | Gray | Period created but not ready |
| OPEN | Green | Ready for processing |
| PROCESSING | Blue | Payroll in progress |
| COMPLETED | Green | Successfully processed |
| CLOSED | Red | Finalized, no changes allowed |

### Processing Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Gray | Not yet started |
| In Progress | Blue | Currently processing |
| Completed | Green | Successfully finished |
| Failed | Red | Processing failed |
| Cancelled | Orange | Manually stopped |

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Next Review:** January 2026

**Change Log:**
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-04 | 1.0 | Initial document creation | Product Owner Sarah |

