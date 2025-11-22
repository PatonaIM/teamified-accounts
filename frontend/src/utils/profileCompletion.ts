// Profile completion calculation utility
export interface ProfileData {
  employeeId: string;
  firstName: string;
  lastName: string;
  fathersName: string;
  nickName: string;
  emailAddress: string;
  clientAssignment: string;
  department: string;
  location: string;
  title: string;
  employmentType: string;
  status: string;
  primaryReportingManager: string;
  secondaryReportingManager: string;
  joiningDate: string;
  confirmationDate: string;
  experienceTracking: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  maritalStatus: string;
  personalDescription: string;
  citizenship: string;
  bloodGroup: string;
  expertise: string;
  linkedinUrl: string;
  workPhone: string;
  extension: string;
  seatingLocation: string;
  personalMobile: string;
  personalEmail: string;
  presentAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  };
  pan: string;
  aadhaar: string;
  pfNumber: string;
  uan: string;
  nic: string;
  sss: string;
  philhealth: string;
  pagibig: string;
  tin: string;
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phoneNumber: string;
    address: string;
  }>;
  bankAccountNumber: string;
  ifscCode: string;
  paymentMode: string;
  bankName: string;
  accountType: string;
  bankHolderName: string;
  languagePreference: string;
  communicationPreferences: string[];
  notificationSettings: string[];
}

/**
 * Calculate profile completion percentage based on filled fields
 * @param profileData - The profile data object
 * @returns Completion percentage (0-100)
 */
export const calculateProfileCompletion = (profileData: ProfileData): number => {
  const totalFields = Object.keys(profileData).length;
  const filledFields = Object.values(profileData).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      // For nested objects like presentAddress, check if any field has a value
      return Object.values(value).some(v => v !== '' && v !== 0);
    }
    return value !== '' && value !== 0;
  }).length;
  
  return Math.round((filledFields / totalFields) * 100);
};

/**
 * Get profile completion status and message
 * @param completion - Completion percentage
 * @returns Object with status and message
 */
export const getProfileCompletionStatus = (completion: number) => {
  if (completion >= 100) {
    return {
      status: 'complete',
      message: 'Profile is complete!',
      color: 'success' as const
    };
  } else if (completion >= 75) {
    return {
      status: 'almost-complete',
      message: 'Almost there! Complete a few more fields.',
      color: 'info' as const
    };
  } else if (completion >= 50) {
    return {
      status: 'in-progress',
      message: 'Good progress! Keep filling out your profile.',
      color: 'warning' as const
    };
  } else {
    return {
      status: 'incomplete',
      message: 'Complete your profile to access all features.',
      color: 'error' as const
    };
  }
};
