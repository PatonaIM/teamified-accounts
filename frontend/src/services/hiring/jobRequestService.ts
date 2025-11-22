import axios from 'axios';

const HIRING_ZOHO_API = import.meta.env.VITE_HIRING_ZOHO_URL;

class JobRequestService {
  async getJobRequests(filters: any) {
    console.log('[jobRequestService] Calling API:', `${HIRING_ZOHO_API}/getFilteredJobRequets`, 'with filters:', filters);
    console.log('[jobRequestService] Full URL:', `${HIRING_ZOHO_API}/getFilteredJobRequets`);

    try {
      const startTime = Date.now();
      console.log('[jobRequestService] Request started at', new Date(startTime).toISOString());

      // Prepare request body according to API schema
      // Note: clientId: 0 gets all jobs, pageNumber starts at 1 (not 0)
      const requestBody = {
        showActiveJobs: filters.showActiveJobs ?? true,
        clientId: 0, // 0 = all jobs (null also works, but 0 is more explicit)
        searchValue: filters.searchValue ?? "",
        recruiterId: filters.recruiterId ?? "",
        timeframe: filters.timeframe ?? "",
        host: typeof window !== 'undefined' ? window.location.hostname : "",
        pageNumber: (filters.pageNumber ?? 0) + 1, // API uses 1-based pagination, not 0-based
        showTestJobs: false, // Default to false to exclude test jobs
        pageSize: filters.pageSize ?? 10,
      };

      console.log('[jobRequestService] Formatted request body:', requestBody);

      const { data } = await axios.post(
        `${HIRING_ZOHO_API}/getFilteredJobRequets`,
        requestBody,
        {
          timeout: 10000, // 10 second timeout
        }
      );

      const endTime = Date.now();
      console.log('[jobRequestService] Request completed in', endTime - startTime, 'ms');
      console.log('[jobRequestService] API response received:', data);
      console.log('[jobRequestService] Response type check:', {
        hasData: !!data,
        hasDataData: !!data.data,
        dataKeys: Object.keys(data),
        dataDataKeys: data.data ? Object.keys(data.data) : 'N/A',
        dataDataType: typeof data.data,
        dataType: typeof data
      });

      // API response structure from Azure:
      // {
      //   status: 200,
      //   successful: true,
      //   data: {
      //     jobs: [...],
      //     paginationFilter: { pageNumber, pageSize, count }
      //   }
      // }
      const responseData = data.data || data; // Handle both wrapped and unwrapped responses
      console.log('[jobRequestService] responseData keys:', Object.keys(responseData || {}));
      const jobs = responseData.jobs || [];
      const paginationFilter = responseData.paginationFilter || {};
      const totalCount = paginationFilter.count || 0;

      console.log('[jobRequestService] Parsed response:', {
        jobsCount: jobs.length,
        totalCount,
        hasMore: jobs.length === requestBody.pageSize,
        firstJob: jobs[0] ? jobs[0].title || jobs[0].jobTitle || 'No title' : 'No jobs'
      });

      // Transform response to match expected format
      return {
        data: jobs,
        hasMore: jobs.length === requestBody.pageSize,
        totalCount: totalCount,
      };
    } catch (error: any) {
      console.error('[jobRequestService] API call failed:', error);
      console.error('[jobRequestService] Error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        timeout: error.code === 'ECONNABORTED',
      });
      throw error;
    }
  }

  async getJobRequestById(id: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getJobRequestById`, { jobRequestId: id });
    return data;
  }

  async createJobRequest(jobData: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/addJobRequest`, jobData);
    return data;
  }

  async updateJobRequest(id: string, jobData: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/updateJobRequest`, {
      jobRequestId: id,
      ...jobData,
    });
    return data;
  }

  async getJobStats(jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getJobStats`, { jobRequestId: jobId });
    return data;
  }

  async getCandidatesByStage(jobId: string, stageId: string, page: number = 1) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getCandidateListPerStageByJobId`, {
      jobRequestId: jobId,
      stageId,
      pageNumber: page,
      pageSize: 20,
    });
    return data;
  }

  async getCandidateDetails(candidateId: string, jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getCandidateDetails`, {
      candidateId,
      jobRequestId: jobId,
    });
    return data;
  }

  async addCandidate(jobId: string, candidateData: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/addCandidate`, {
      jobRequestId: jobId,
      ...candidateData,
    });
    return data;
  }

  async updateCandidate(candidateId: string, jobId: string, updates: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/updateCandidate`, {
      candidateId,
      jobRequestId: jobId,
      ...updates,
    });
    return data;
  }

  async addCandidateComment(candidateId: string, jobId: string, comment: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/addCandidateComment`, {
      candidateId,
      jobRequestId: jobId,
      comment,
    });
    return data;
  }

  async getCandidateTimeline(candidateId: string, jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getCandidateTimeline`, {
      candidateId,
      jobRequestId: jobId,
    });
    return data;
  }

  async getAllDynamicStages() {
    const { data } = await axios.get(`${HIRING_ZOHO_API}/getAllDynamicStages`);
    return data;
  }

  async getAllJobRequests() {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getAllJobRequests`);
    return data;
  }

  async getAssignJobTimelineOnCandidate(candidateId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getAssignJobTimelineOnCandidate`, {
      candidateId,
    });
    return data;
  }
}

export default new JobRequestService();
