import axios from 'axios';

const HIRING_INTERVIEW_API = import.meta.env.VITE_HIRING_INTERVIEW_URL;
const HIRING_ZOHO_API = import.meta.env.VITE_HIRING_ZOHO_URL;

class InterviewService {
  // Meeting management (Zoho API)
  async getAllMeetings(filters: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getAllMeetings`, filters);
    return data;
  }

  async createInterview(meetingData: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/addInterviewMeeting`, meetingData);
    return data;
  }

  async updateInterview(meetingId: string, updates: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/updateInterviewMeeting`, {
      meetingId,
      ...updates,
    });
    return data;
  }

  async deleteInterview(meetingId: string, reason: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/deleteInterview`, {
      meetingId,
      reason,
    });
    return data;
  }

  // Slot management (Zoho API)
  async getSlotsForEmployer(userId: string, startDate: string, endDate: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getSlotsForEmployer`, {
      userId,
      startDate,
      endDate,
    });
    return data;
  }

  async createSlots(userId: string, slots: any[]) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/setSlotsAvailability`, {
      userId,
      slots,
    });
    return data;
  }

  async updateSlot(slotId: string, updates: any) {
    const { data} = await axios.post(`${HIRING_ZOHO_API}/updateSlotsAvailability`, {
      slotId,
      ...updates,
    });
    return data;
  }

  async deleteSlot(slotId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/deleteSlots`, { slotId });
    return data;
  }

  async reserveSlot(slotId: string, candidateId: string, jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/reserveCandidateSlots`, {
      slotId,
      candidateId,
      jobRequestId: jobId,
    });
    return data;
  }

  // Interview questions (Interview Service API)
  async getQuestionnaire(interviewId: string) {
    const { data } = await axios.get(`${HIRING_INTERVIEW_API}/questionnaire`, {
      params: { interviewId },
    });
    return data;
  }

  async addQuestion(interviewId: string, question: string) {
    const { data } = await axios.post(`${HIRING_INTERVIEW_API}/${interviewId}/add-question`, {
      question,
    });
    return data;
  }

  async deleteQuestion(interviewId: string, questionId: string) {
    const { data } = await axios.delete(
      `${HIRING_INTERVIEW_API}/${interviewId}/question/${questionId}`
    );
    return data;
  }

  async getSummary(interviewId: string) {
    const { data } = await axios.get(`${HIRING_INTERVIEW_API}/summary/${interviewId}`);
    return data;
  }
}

export default new InterviewService();
