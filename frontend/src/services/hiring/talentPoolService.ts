import axios from 'axios';

const HIRING_AI_API = import.meta.env.VITE_HIRING_AI_URL;
const HIRING_ZOHO_API = import.meta.env.VITE_HIRING_ZOHO_URL;

class TalentPoolService {
  // AI-powered search
  async aiSearch(searchParams: any) {
    const { data } = await axios.post(`${HIRING_AI_API}/TalentPool/ai-search`, searchParams);
    return data;
  }

  // CRM candidate lookup
  async getCandidateByEmail(email: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/crmGetCandidateDetailsByEmailOpt`, {
      email,
    });
    return data;
  }

  async assignCandidateToJob(candidateIds: string[], jobIds: string[], stageId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/assignCandidateToJob`, {
      candidateIds,
      jobRequestIds: jobIds,
      stageId,
    });
    return data;
  }

  async removeCandidateFromJob(candidateId: string, jobId: string, reason: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/removeCandidateFromJob`, {
      candidateId,
      jobRequestId: jobId,
      reason,
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

  async getCandidateDetails(candidateId: string, jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getCandidateDetails`, {
      candidateId,
      jobRequestId: jobId,
    });
    return data;
  }

  async restoreCandidate(candidateId: string, jobId: string, stageId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/restoreCandidate`, {
      candidateId,
      jobRequestId: jobId,
      stageId,
    });
    return data;
  }

  async prioritizeCandidate(candidateId: string, jobId: string, isPriority: boolean) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/prioritiseCandidate`, {
      candidateId,
      jobRequestId: jobId,
      isPrioritise: isPriority,
    });
    return data;
  }
}

export default new TalentPoolService();
