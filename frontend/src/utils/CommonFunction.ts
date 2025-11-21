// Country flag emoji mapping
export const FLAG_MAP: Record<string, string> = {
  IN: "🇮🇳", // India
  PH: "🇵🇭", // Philippines
  AU: "🇦🇺", // Australia
  US: "🇺🇸", // United States
  GB: "🇬🇧", // United Kingdom
  CA: "🇨🇦", // Canada
  SG: "🇸🇬", // Singapore
  MY: "🇲🇾", // Malaysia
  TH: "🇹🇭", // Thailand
  VN: "🇻🇳", // Vietnam
  ID: "🇮🇩", // Indonesia
  // Add more country codes as needed
};

// Helper function to get flag emoji for a country code
export const getCountryFlag = (countryCode: string): string => {
  return FLAG_MAP[countryCode?.toUpperCase()] || "🏳️";
};

// Convert camelCase to normal case (e.g., "screeningByTalentTeam" => "Screening By Talent Team")
export const convertCamelCaseToNormalCase = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};
