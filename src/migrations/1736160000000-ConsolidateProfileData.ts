import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsolidateProfileData1736160000000 implements MigrationInterface {
  name = 'ConsolidateProfileData1736160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, migrate existing comprehensive employee data to user profile_data
    await queryRunner.query(`
      UPDATE users 
      SET profile_data = jsonb_build_object(
        'personal', jsonb_build_object(
          'dateOfBirth', ce.date_of_birth,
          'gender', ce.gender,
          'maritalStatus', ce.marital_status,
          'nationality', ce.nationality,
          'countryCode', ce.country_code,
          'state', ce.state,
          'city', ce.city,
          'postalCode', ce.postal_code,
          'address', ce.address,
          'phoneNumber', ce.phone_number,
          'alternatePhone', ce.alternate_phone,
          'emergencyContact', ce.emergency_contact,
          'bloodGroup', ce.blood_group,
          'medicalConditions', ce.medical_conditions,
          'allergies', ce.allergies
        ),
        'governmentIds', jsonb_build_object(
          'panNumber', ce.pan_number,
          'aadhaarNumber', ce.aadhaar_number,
          'passportNumber', ce.passport_number,
          'drivingLicense', ce.driving_license,
          'voterId', ce.voter_id
        ),
        'banking', jsonb_build_object(
          'bankName', ce.bank_name,
          'accountNumber', ce.bank_account_number,
          'ifscCode', ce.ifsc_code,
          'accountType', ce.account_type,
          'branchName', ce.branch_name,
          'paymentMode', ce.payment_mode
        ),
        'employment', jsonb_build_object(
          'employeeId', ce.employee_id,
          'department', ce.department,
          'designation', ce.designation,
          'employmentType', ce.employment_type,
          'joiningDate', ce.joining_date,
          'reportingManager', ce.reporting_manager,
          'workLocation', ce.work_location,
          'workMode', ce.work_mode
        ),
        'documents', jsonb_build_object(
          'resume', ce.resume,
          'offerLetter', ce.offer_letter,
          'contract', ce.contract,
          'idProof', ce.id_proof,
          'addressProof', ce.address_proof,
          'bankProof', ce.bank_proof,
          'educationProof', ce.education_proof,
          'experienceProof', ce.experience_proof,
          'otherDocuments', ce.other_documents
        ),
        'preferences', jsonb_build_object(
          'communicationLanguage', ce.communication_language,
          'timezone', ce.timezone,
          'notificationPreferences', ce.notification_preferences,
          'privacySettings', ce.privacy_settings
        ),
        'onboarding', jsonb_build_object(
          'status', ce.onboarding_status,
          'completedSteps', ce.completed_steps,
          'pendingSteps', ce.pending_steps,
          'completionDate', ce.completion_date
        ),
        'metadata', jsonb_build_object(
          'lastUpdated', ce.updated_at,
          'createdAt', ce.created_at,
          'version', '1.0'
        )
      )
      FROM comprehensive_employees ce 
      WHERE users.id = ce.user_id
    `);

    // Drop the comprehensive_employees table and related tables
    await queryRunner.query(`DROP TABLE IF EXISTS employee_documents CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS emergency_contacts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS comprehensive_employees CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the comprehensive_employees table structure
    await queryRunner.query(`
      CREATE TABLE comprehensive_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR(20) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_address VARCHAR(100) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20),
        marital_status VARCHAR(20),
        nationality VARCHAR(100),
        country_code VARCHAR(3),
        state VARCHAR(100),
        city VARCHAR(100),
        postal_code VARCHAR(20),
        address TEXT,
        phone_number VARCHAR(20),
        alternate_phone VARCHAR(20),
        emergency_contact JSONB,
        blood_group VARCHAR(10),
        medical_conditions TEXT,
        allergies TEXT,
        pan_number VARCHAR(20),
        aadhaar_number VARCHAR(20),
        passport_number VARCHAR(50),
        driving_license VARCHAR(50),
        voter_id VARCHAR(50),
        bank_name VARCHAR(100),
        bank_account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        account_type VARCHAR(20),
        branch_name VARCHAR(100),
        payment_mode VARCHAR(20),
        department VARCHAR(100),
        designation VARCHAR(100),
        employment_type VARCHAR(20),
        joining_date DATE,
        reporting_manager VARCHAR(100),
        work_location VARCHAR(100),
        work_mode VARCHAR(20),
        resume VARCHAR(255),
        offer_letter VARCHAR(255),
        contract VARCHAR(255),
        id_proof VARCHAR(255),
        address_proof VARCHAR(255),
        bank_proof VARCHAR(255),
        education_proof VARCHAR(255),
        experience_proof VARCHAR(255),
        other_documents JSONB,
        communication_language VARCHAR(50),
        timezone VARCHAR(50),
        notification_preferences JSONB,
        privacy_settings JSONB,
        onboarding_status VARCHAR(20) DEFAULT 'pending',
        completed_steps JSONB,
        pending_steps JSONB,
        completion_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Recreate indexes
    await queryRunner.query(`CREATE INDEX idx_comprehensive_employees_employee_id ON comprehensive_employees(employee_id)`);
    await queryRunner.query(`CREATE INDEX idx_comprehensive_employees_email ON comprehensive_employees(email_address)`);
    await queryRunner.query(`CREATE INDEX idx_comprehensive_employees_user_id ON comprehensive_employees(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_comprehensive_employees_department ON comprehensive_employees(department)`);
    await queryRunner.query(`CREATE INDEX idx_comprehensive_employees_country ON comprehensive_employees(country_code)`);

    // Migrate data back from profile_data (this is a simplified reverse migration)
    await queryRunner.query(`
      INSERT INTO comprehensive_employees (
        user_id, email_address, first_name, last_name,
        date_of_birth, gender, marital_status, nationality,
        country_code, state, city, postal_code, address,
        phone_number, alternate_phone, emergency_contact,
        blood_group, medical_conditions, allergies,
        pan_number, aadhaar_number, passport_number,
        driving_license, voter_id, bank_name, bank_account_number,
        ifsc_code, account_type, branch_name, payment_mode,
        department, designation, employment_type, joining_date,
        reporting_manager, work_location, work_mode,
        resume, offer_letter, contract, id_proof, address_proof,
        bank_proof, education_proof, experience_proof, other_documents,
        communication_language, timezone, notification_preferences,
        privacy_settings, onboarding_status, completed_steps,
        pending_steps, completion_date, created_at, updated_at
      )
      SELECT 
        id, email, first_name, last_name,
        (profile_data->>'personal'->>'dateOfBirth')::DATE,
        profile_data->>'personal'->>'gender',
        profile_data->>'personal'->>'maritalStatus',
        profile_data->>'personal'->>'nationality',
        profile_data->>'personal'->>'countryCode',
        profile_data->>'personal'->>'state',
        profile_data->>'personal'->>'city',
        profile_data->>'personal'->>'postalCode',
        profile_data->>'personal'->>'address',
        profile_data->>'personal'->>'phoneNumber',
        profile_data->>'personal'->>'alternatePhone',
        profile_data->>'personal'->>'emergencyContact',
        profile_data->>'personal'->>'bloodGroup',
        profile_data->>'personal'->>'medicalConditions',
        profile_data->>'personal'->>'allergies',
        profile_data->>'governmentIds'->>'panNumber',
        profile_data->>'governmentIds'->>'aadhaarNumber',
        profile_data->>'governmentIds'->>'passportNumber',
        profile_data->>'governmentIds'->>'drivingLicense',
        profile_data->>'governmentIds'->>'voterId',
        profile_data->>'banking'->>'bankName',
        profile_data->>'banking'->>'accountNumber',
        profile_data->>'banking'->>'ifscCode',
        profile_data->>'banking'->>'accountType',
        profile_data->>'banking'->>'branchName',
        profile_data->>'banking'->>'paymentMode',
        profile_data->>'employment'->>'department',
        profile_data->>'employment'->>'designation',
        profile_data->>'employment'->>'employmentType',
        (profile_data->>'employment'->>'joiningDate')::DATE,
        profile_data->>'employment'->>'reportingManager',
        profile_data->>'employment'->>'workLocation',
        profile_data->>'employment'->>'workMode',
        profile_data->>'documents'->>'resume',
        profile_data->>'documents'->>'offerLetter',
        profile_data->>'documents'->>'contract',
        profile_data->>'documents'->>'idProof',
        profile_data->>'documents'->>'addressProof',
        profile_data->>'documents'->>'bankProof',
        profile_data->>'documents'->>'educationProof',
        profile_data->>'documents'->>'experienceProof',
        profile_data->>'documents'->>'otherDocuments',
        profile_data->>'preferences'->>'communicationLanguage',
        profile_data->>'preferences'->>'timezone',
        profile_data->>'preferences'->>'notificationPreferences',
        profile_data->>'preferences'->>'privacySettings',
        profile_data->>'onboarding'->>'status',
        profile_data->>'onboarding'->>'completedSteps',
        profile_data->>'onboarding'->>'pendingSteps',
        (profile_data->>'onboarding'->>'completionDate')::TIMESTAMPTZ,
        created_at, updated_at
      FROM users 
      WHERE profile_data IS NOT NULL
    `);
  }
}
