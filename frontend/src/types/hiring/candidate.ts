export interface Candidate {
  id: string;
  name: string;
  email: string;
  tags: string[];
  country?: string;
  countryCode?: string;
  stage?: string;
  jobTitle?: string;
  location?: string;
  yearsOfExperience?: number;
  salaryIOTF?: number;
}

export interface AISearchResponse {
  candidates: Candidate[];
  extractedTags: string[];
  filtersMeta: {
    yearsOfExperience: string[];
    location: string[];
    jobTitle: string[];
    stages: string[];
    clients: string[];
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}
