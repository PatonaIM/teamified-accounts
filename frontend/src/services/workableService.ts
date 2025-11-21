import axios from 'axios';

// Use environment variable for API URL (Vercel deployment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://teamified-team-member-portal-backend.vercel.app/api';

export interface WorkableJob {
  id: string;
  title: string;
  shortcode: string;
  description: string;
  requirements: string;
  benefits: string;
  location: {
    location_str: string;
    country: string;
    country_code: string;
    region: string;
    region_code: string;
    city: string;
    zip_code: string;
    telecommuting: boolean;
  };
  department: string;
  employment_type: string;
  experience: string;
  function: string;
  industry: string;
  education: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface WorkableJobsResponse {
  jobs: WorkableJob[];
  paging: {
    next: string | null;
  };
}

export interface WorkableFormField {
  id: string;
  key: string;
  label: string;
  type: string;
  required: boolean;
  fields?: any[];
}

export interface WorkableApplicationForm {
  form_fields: WorkableFormField[];
}

export interface ApplicationData {
  candidate: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    resume?: string;
    cover_letter?: string;
  };
  answers?: Array<{
    question_key: string;
    body: string;
  }>;
}

/**
 * Get list of published jobs
 */
export const getJobs = async (params?: {
  offset?: number;
  limit?: number;
  search?: string;
  location?: string;
  department?: string;
  employment_type?: string;
}): Promise<WorkableJobsResponse> => {
  const { offset = 0, limit = 12, search, location, department, employment_type } = params || {};
  
  const queryParams = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append('search', search);
  }
  
  if (location) {
    queryParams.append('location', location);
  }
  
  if (department) {
    queryParams.append('department', department);
  }
  
  if (employment_type) {
    queryParams.append('employment_type', employment_type);
  }

  const response = await axios.get<WorkableJobsResponse>(
    `${API_BASE_URL}/v1/workable/jobs?${queryParams.toString()}`
  );

  return response.data;
};

/**
 * Get job details by shortcode
 */
export const getJobDetails = async (shortcode: string): Promise<WorkableJob> => {
  const response = await axios.get<WorkableJob>(
    `${API_BASE_URL}/v1/workable/jobs/${shortcode}`
  );

  return response.data;
};

/**
 * Get application form for a job
 */
export const getApplicationForm = async (
  shortcode: string
): Promise<WorkableApplicationForm> => {
  const response = await axios.get<WorkableApplicationForm>(
    `${API_BASE_URL}/v1/workable/jobs/${shortcode}/form`
  );

  return response.data;
};

/**
 * Submit job application
 */
export const submitApplication = async (
  shortcode: string,
  applicationData: ApplicationData
): Promise<{ success: boolean; message: string; result: any }> => {
  const response = await axios.post(
    `${API_BASE_URL}/v1/workable/jobs/${shortcode}/apply`,
    applicationData
  );

  return response.data;
};

