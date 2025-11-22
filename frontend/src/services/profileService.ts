import api from './api';
import { calculateProfileCompletion, type ProfileData } from '../utils/profileCompletion';

// Backend API types for User.profile_data structure
interface UserProfileData {
  personal?: {
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    countryCode?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    address?: string;
    phoneNumber?: string;
    alternatePhone?: string;
    emergencyContact?: any;
    bloodGroup?: string;
    medicalConditions?: string;
    allergies?: string;
  };
  governmentIds?: {
    panNumber?: string;
    aadhaarNumber?: string;
    passportNumber?: string;
    drivingLicense?: string;
    voterId?: string;
  };
  banking?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountType?: string;
    branchName?: string;
    paymentMode?: string;
  };
  employment?: {
    employeeId?: string;
    department?: string;
    designation?: string;
    employmentType?: string;
    joiningDate?: string;
    reportingManager?: string;
    workLocation?: string;
    workMode?: string;
  };
  documents?: {
    resume?: string;
    offerLetter?: string;
    contract?: string;
    idProof?: string;
    addressProof?: string;
    bankProof?: string;
    educationProof?: string;
    experienceProof?: string;
    otherDocuments?: any;
  };
  preferences?: {
    communicationLanguage?: string;
    timezone?: string;
    notificationPreferences?: any;
    privacySettings?: any;
  };
  onboarding?: {
    status?: string;
    completedSteps?: string[];
    pendingSteps?: string[];
    completionDate?: string;
  };
  metadata?: {
    lastUpdated?: string;
    createdAt?: string;
    version?: string;
  };
}

class ProfileService {

  private convertToProfileData(userProfileData: UserProfileData | null | undefined): ProfileData {
    if (!userProfileData) {
      // Return empty profile data if no data provided
      return {
        employeeId: '',
        firstName: '',
        lastName: '',
        fathersName: '',
        nickName: '',
        emailAddress: '',
        clientAssignment: '',
        department: '',
        location: '',
        title: '',
        employmentType: '',
        status: '',
        primaryReportingManager: '',
        secondaryReportingManager: '',
        joiningDate: '',
        confirmationDate: '',
        experienceTracking: '',
        dateOfBirth: '',
        age: 0,
        gender: '',
        maritalStatus: '',
        personalDescription: '',
        citizenship: '',
        bloodGroup: '',
        expertise: '',
        linkedinUrl: '',
        workPhone: '',
        extension: '',
        seatingLocation: '',
        personalMobile: '',
        personalEmail: '',
        presentAddress: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          stateProvince: '',
          postalCode: '',
          country: ''
        },
        emergencyContacts: [],
        pan: '',
        aadhaar: '',
        pfNumber: '',
        uan: '',
        nic: '',
        sss: '',
        philhealth: '',
        pagibig: '',
        tin: '',
        bankAccountNumber: '',
        ifscCode: '',
        paymentMode: '',
        bankName: '',
        accountType: '',
        bankHolderName: '',
        languagePreference: '',
        communicationPreferences: [],
        notificationSettings: []
      };
    }

    // Calculate age from date of birth if available
    const calculateAge = (dateOfBirth: string | undefined): number => {
      if (!dateOfBirth) return 0;
      try {
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      } catch {
        return 0;
      }
    };

    return {
      employeeId: userProfileData.employment?.employeeId || '',
      firstName: (userProfileData as any).firstName || '', // Will be populated from user data
      lastName: (userProfileData as any).lastName || '', // Will be populated from user data
      fathersName: userProfileData.personal?.fathersName || '',
      nickName: userProfileData.personal?.nickName || '',
      emailAddress: (userProfileData as any).emailAddress || '', // Will be populated from user data
      clientAssignment: userProfileData.employment?.clientAssignment || '',
      department: userProfileData.employment?.department || '',
      location: userProfileData.employment?.workLocation || '',
      title: userProfileData.employment?.designation || '',
      employmentType: userProfileData.employment?.employmentType || '',
      status: userProfileData.employment?.status || '',
      primaryReportingManager: userProfileData.employment?.reportingManager || '',
      secondaryReportingManager: userProfileData.employment?.secondaryReportingManager || '',
      joiningDate: userProfileData.employment?.joiningDate || '',
      confirmationDate: userProfileData.employment?.confirmationDate || '',
      experienceTracking: userProfileData.employment?.experienceTracking || '',
      dateOfBirth: userProfileData.personal?.dateOfBirth || '',
      age: calculateAge(userProfileData.personal?.dateOfBirth),
      gender: userProfileData.personal?.gender || '',
      maritalStatus: userProfileData.personal?.maritalStatus || '',
      personalDescription: userProfileData.personal?.personalDescription || '',
      citizenship: userProfileData.personal?.nationality || '',
      bloodGroup: userProfileData.personal?.bloodGroup || '',
      expertise: (userProfileData as any).expertise || '',
      linkedinUrl: (userProfileData as any).linkedinUrl || '',
      workPhone: userProfileData.personal?.phoneNumber || '',
      extension: userProfileData.employment?.extension || '',
      seatingLocation: userProfileData.employment?.seatingLocation || '',
      personalMobile: userProfileData.personal?.alternatePhone || '',
      personalEmail: userProfileData.personal?.personalEmail || '',
      presentAddress: {
        addressLine1: userProfileData.personal?.address || '',
        addressLine2: userProfileData.personal?.addressLine2 || '',
        city: userProfileData.personal?.city || '',
        stateProvince: userProfileData.personal?.state || '',
        postalCode: userProfileData.personal?.postalCode || '',
        country: userProfileData.personal?.countryCode || '',
      },
      pan: userProfileData.governmentIds?.panNumber || '',
      aadhaar: userProfileData.governmentIds?.aadhaarNumber || '',
      pfNumber: userProfileData.governmentIds?.pfNumber || '',
      uan: userProfileData.governmentIds?.uan || '',
      nic: userProfileData.governmentIds?.nic || '',
      sss: userProfileData.governmentIds?.sss || '',
      philhealth: userProfileData.governmentIds?.philhealth || '',
      pagibig: userProfileData.governmentIds?.pagibig || '',
      tin: userProfileData.governmentIds?.tin || '',
      emergencyContacts: userProfileData.personal?.emergencyContact ? [userProfileData.personal.emergencyContact] : [],
      bankAccountNumber: userProfileData.banking?.accountNumber || '',
      ifscCode: userProfileData.banking?.ifscCode || '',
      paymentMode: userProfileData.banking?.paymentMode || '',
      bankName: userProfileData.banking?.bankName || '',
      accountType: userProfileData.banking?.accountType || '',
      bankHolderName: userProfileData.banking?.bankHolderName || '',
      languagePreference: userProfileData.preferences?.communicationLanguage || '',
      communicationPreferences: userProfileData.preferences?.communicationPreferences || [],
      notificationSettings: userProfileData.preferences?.notificationSettings || [],
    };
  }

  private convertToUpdateDto(profileData: Partial<ProfileData>): any {
    // Convert from flat ProfileData structure to nested UserProfileData structure
    // that the backend expects in the JSONB profile_data column
    return {
      personal: {
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        maritalStatus: profileData.maritalStatus,
        nationality: profileData.citizenship,
        countryCode: profileData.presentAddress?.country,
        state: profileData.presentAddress?.stateProvince,
        city: profileData.presentAddress?.city,
        postalCode: profileData.presentAddress?.postalCode,
        address: profileData.presentAddress?.addressLine1,
        phoneNumber: profileData.workPhone,
        alternatePhone: profileData.personalMobile,
        emergencyContact: profileData.emergencyContacts?.[0],
        bloodGroup: profileData.bloodGroup,
        // Include other personal fields that might be in the backend structure
        fathersName: profileData.fathersName,
        nickName: profileData.nickName,
        personalEmail: profileData.personalEmail,
        personalDescription: profileData.personalDescription,
        addressLine2: profileData.presentAddress?.addressLine2,
      },
      governmentIds: {
        panNumber: profileData.pan,
        aadhaarNumber: profileData.aadhaar,
        pfNumber: profileData.pfNumber,
        uan: profileData.uan,
        nic: profileData.nic,
        sss: profileData.sss,
        philhealth: profileData.philhealth,
        pagibig: profileData.pagibig,
        tin: profileData.tin,
      },
      banking: {
        bankName: profileData.bankName,
        accountNumber: profileData.bankAccountNumber,
        ifscCode: profileData.ifscCode,
        accountType: profileData.accountType,
        paymentMode: profileData.paymentMode,
        bankHolderName: profileData.bankHolderName,
      },
      employment: {
        employeeId: profileData.employeeId,
        department: profileData.department,
        designation: profileData.title,
        employmentType: profileData.employmentType,
        joiningDate: profileData.joiningDate,
        reportingManager: profileData.primaryReportingManager,
        workLocation: profileData.location,
        clientAssignment: profileData.clientAssignment,
        secondaryReportingManager: profileData.secondaryReportingManager,
        confirmationDate: profileData.confirmationDate,
        experienceTracking: profileData.experienceTracking,
        status: profileData.status,
        seatingLocation: profileData.seatingLocation,
        extension: profileData.extension,
      },
      preferences: {
        communicationLanguage: profileData.languagePreference,
        communicationPreferences: profileData.communicationPreferences,
        notificationSettings: profileData.notificationSettings,
      },
      // Include fields that might be stored at the root level
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      emailAddress: profileData.emailAddress,
      expertise: profileData.expertise,
      linkedinUrl: profileData.linkedinUrl,
      // CRITICAL: Also store flat fields at root level for validation
      personalMobile: profileData.personalMobile,
      personalEmail: profileData.personalEmail,
      dateOfBirth: profileData.dateOfBirth,
      fathersName: profileData.fathersName,
      presentAddress: profileData.presentAddress,
      emergencyContacts: profileData.emergencyContacts || [],
    };
  }

  /**
   * Get current user's profile data
   */
  async getProfileData(): Promise<ProfileData & { id?: string; roles?: string[] }> {
    try {
      // Get profile data first (this seems to work)
      const profileResponse = await api.get('/v1/auth/me/profile');

      const profileData = profileResponse.data.profileData;

      // Convert profile data
      const convertedProfileData: any = this.convertToProfileData(profileData);
      
      // Try to get user data, but handle the case where it returns HTML
      let userData = null;
      try {
        const userResponse = await api.get('/v1/users/me');
        
        // Check if the response is HTML (nginx routing issue)
        if (typeof userResponse.data === 'string' && userResponse.data.includes('<!doctype html>')) {
          userData = null;
        } else {
          userData = userResponse.data.user || userResponse.data;
        }
      } catch (error) {
        userData = null;
      }
      
      // Merge user data into profile data if available
      if (userData) {
        console.log('profileService: userData found:', userData);
        console.log('profileService: userData.roles:', userData.roles);
        convertedProfileData.firstName = userData.firstName || '';
        convertedProfileData.lastName = userData.lastName || '';
        convertedProfileData.emailAddress = userData.email || '';
        convertedProfileData.id = userData.id || '';
        convertedProfileData.roles = userData.roles || [];
        console.log('profileService: Set convertedProfileData.roles to:', convertedProfileData.roles);
      } else {
        console.log('profileService: userData is null, using JWT fallback');
        // Use fallback data from JWT token
        const token = localStorage.getItem('teamified_access_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            convertedProfileData.id = payload.sub || '';
            convertedProfileData.emailAddress = payload.email || '';
            convertedProfileData.roles = payload.roles || [];
            console.log('profileService: JWT payload.roles:', payload.roles);
            console.log('profileService: Set convertedProfileData.roles to:', convertedProfileData.roles);
          } catch (e) {
            // Silent fail - use empty values
            console.log('profileService: Failed to parse JWT:', e);
          }
        }
      }
      
      console.log('profileService: Returning profile data with roles:', convertedProfileData.roles);
      
      return convertedProfileData;
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Return empty profile data if API fails
      return this.getEmptyProfileData() as any;
    }
  }

  /**
   * Get empty profile data structure
   */
  private getEmptyProfileData(): ProfileData {
    return {
      employeeId: '',
      firstName: '',
      lastName: '',
      fathersName: '',
      nickName: '',
      emailAddress: '',
      clientAssignment: '',
      department: '',
      location: '',
      title: '',
      employmentType: '',
      status: '',
      primaryReportingManager: '',
      secondaryReportingManager: '',
      joiningDate: '',
      confirmationDate: '',
      experienceTracking: '',
      dateOfBirth: '',
      age: 0,
      gender: '',
      maritalStatus: '',
      personalDescription: '',
      citizenship: '',
      bloodGroup: '',
      expertise: '',
      linkedinUrl: '',
      workPhone: '',
      extension: '',
      seatingLocation: '',
      personalMobile: '',
      personalEmail: '',
      presentAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: '',
      },
      pan: '',
      aadhaar: '',
      pfNumber: '',
      uan: '',
      nic: '',
      sss: '',
      philhealth: '',
      pagibig: '',
      tin: '',
      emergencyContacts: [],
      bankAccountNumber: '',
      ifscCode: '',
      paymentMode: '',
      bankName: '',
      accountType: '',
      bankHolderName: '',
      languagePreference: '',
      communicationPreferences: [],
      notificationSettings: [],
    };
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(): Promise<number> {
    const profileData = await this.getProfileData();
    return calculateProfileCompletion(profileData);
  }

  /**
   * Update profile data
   */
  async updateProfileData(updates: Partial<ProfileData>): Promise<ProfileData> {
    try {
      // Get current profile data first
      const currentProfileData = await this.getProfileData();
      
      // Merge updates with current data
      const mergedData = { ...currentProfileData, ...updates };
      
      // Convert to the format expected by the API
      const updateDto = this.convertToUpdateDto(mergedData);

      // Update the profile using the new endpoint
      const response = await api.put(
        '/v1/users/me/profile',
        {
          profileData: updateDto,
        }
      );

      // Get updated profile data
      return await this.getProfileData();
    } catch (error) {
      console.error('Failed to update profile data:', error);
      throw new Error('Failed to save profile data. Please try again.');
    }
  }

  /**
   * Get profile data for a specific user (admin only)
   */
  async getUserProfileData(userId: string): Promise<ProfileData> {
    try {
      // Get profile data for specific user
      const profileResponse = await api.get(`/v1/users/${userId}/profile`);

      const profileData = profileResponse.data.profileData;

      // Convert profile data
      const convertedProfileData = this.convertToProfileData(profileData);
      
      // Get user data for the specific user
      let userData = null;
      try {
        const userResponse = await api.get(`/v1/users/${userId}`);
        
        // Check if the response is HTML (nginx routing issue)
        if (typeof userResponse.data === 'string' && userResponse.data.includes('<!doctype html>')) {
          userData = null;
        } else {
          userData = userResponse.data.user || userResponse.data;
        }
      } catch (error) {
        userData = null;
      }
      
      // Merge user data into profile data if available
      if (userData) {
        convertedProfileData.firstName = userData.firstName || '';
        convertedProfileData.lastName = userData.lastName || '';
        convertedProfileData.emailAddress = userData.email || '';
        convertedProfileData.id = userData.id || '';
        convertedProfileData.roles = userData.roles || [];
      }
      
      return convertedProfileData;
    } catch (error) {
      console.error('Failed to load user profile data:', error);
      // Return empty profile data if API fails
      return this.getEmptyProfileData();
    }
  }

  /**
   * Update profile data for a specific user (admin only)
   */
  async updateUserProfileData(userId: string, updates: Partial<ProfileData>): Promise<ProfileData> {
    try {
      // Get current profile data for the user first
      const currentProfileData = await this.getUserProfileData(userId);
      
      // Merge updates with current data
      const mergedData = { ...currentProfileData, ...updates };
      
      // Convert to the format expected by the API
      const updateDto = this.convertToUpdateDto(mergedData);

      // Update the profile using the new endpoint
      const response = await api.put(
        `/v1/users/${userId}/profile`,
        updateDto
      );

      // Get updated profile data
      return await this.getUserProfileData(userId);
    } catch (error) {
      console.error('Failed to update user profile data:', error);
      throw new Error('Failed to save user profile data. Please try again.');
    }
  }

  /**
   * Get user employment records
   */
  async getEmploymentRecords(): Promise<any[]> {
    try {
      const response = await api.get('/v1/users/me/employment');
      return response.data;
    } catch (error) {
      console.error('Failed to load employment records:', error);
      return [];
    }
  }
}

export const profileService = new ProfileService();

/**
 * Resolve profile picture URL from user data
 */
export function resolveProfilePictureUrl(user: any): string | undefined {
  return user?.profilePicture || user?.picture || undefined;
}
