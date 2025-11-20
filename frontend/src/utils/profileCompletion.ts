export const calculateProfileCompletion = (profileData: any): number => {
  if (!profileData) return 0;

  const fields = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'dateOfBirth',
    'nationality',
    'gender',
  ];

  const completedFields = fields.filter(field => {
    const value = profileData[field];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / fields.length) * 100);
};
