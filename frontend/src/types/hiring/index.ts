export enum ACTIVE_VIEW {
  details = 'details',
  timeline = 'timeline',
  delete = 'delete',
  view = 'view',
  edit = 'edit',
  clone = 'clone',
}

export interface Stage {
  code: string;
  name: string;
  count: number;
  qualifiedCount: number;
  disqualifiedCount: number;
  pedingTaskCount?: number;
}

export interface JobRequest {
  jobRequestID: string;
  jobDescription: string;
  status: 'Open' | 'Completed' | 'Cancelled';
  statusId: 1 | 2 | 3;
  clientName: string;
  clientId: string;
  recruiterName: string;
  recruiterId: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  salaryRange: string;
  requiredSkills: string[];
  experienceLevel: string;
  createdDate: string;
  updatedDate: string;
  candidateCount: number;
  stages: Stage[];
}

export interface Stage {
  stageId: string;
  stageName: string;
  order: number;
  candidateCount: number;
}

export interface Candidate {
  candidateId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  stage: string;
  stageId: string;
  disqualified: boolean;
  isPrioritise: boolean;
  resumeURL: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMeeting {
  meetingId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobRequestId: string;
  title: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  interviewers: string[];
  round: 'Round 1' | 'Round 2';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  eventId: string;
  createdAt: string;
}

export interface InterviewSlot {
  slotId: string;
  userId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
  candidateId?: string;
  jobRequestId?: string;
  meetingId?: string;
  createdAt: string;
}
