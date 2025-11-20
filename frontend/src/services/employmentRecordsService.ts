import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class EmploymentRecordsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/employment-records`;
  }

  async getEmploymentCountries(userId: string) {
    return { countries: [] };
  }

  async getEmploymentRecords(userId: string) {
    return { records: [] };
  }
}

export const employmentRecordsService = new EmploymentRecordsService();
