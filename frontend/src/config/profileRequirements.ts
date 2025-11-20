export const isFieldRequired = (fieldName: string): boolean => {
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'dateOfBirth',
    'nationality',
  ];
  
  return requiredFields.includes(fieldName);
};

export const ONBOARDING_HELPER_TEXT: Record<string, string> = {
  firstName: 'Please enter your legal first name',
  lastName: 'Please enter your legal last name',
  email: 'Your primary email address for communication',
  phoneNumber: 'Your contact phone number',
  dateOfBirth: 'Your date of birth',
  nationality: 'Your legal nationality',
  gender: 'Your gender identity',
  address: 'Your current residential address',
  emergencyContactName: 'Name of your emergency contact',
  emergencyContactPhone: 'Phone number of your emergency contact',
  emergencyContactRelationship: 'Relationship to emergency contact',
};
