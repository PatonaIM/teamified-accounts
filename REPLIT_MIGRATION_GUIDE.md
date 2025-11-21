# TMFNUI Module Migration Guide for Replit Agent

**Date**: 2025-10-30
**Task**: Migrate 3 hiring modules from TMFNUI to Team Member Portal
**Files Copied**: 52 files (15 Job Request, 10 Interview, 21 Talent Pool, 6 Shared)

---

## 📋 Overview

You need to migrate 52 TMFNUI source files to work within the Team Member Portal. The files have been copied to:
- `frontend/src/pages/hiring/JobRequest/` (15 files)
- `frontend/src/pages/hiring/Interview/` (10 files)
- `frontend/src/pages/hiring/TalentPool/` (21 files)
- `frontend/src/components/hiring/` (6 files)

---

## 🎯 Your Mission

Transform these TMFNUI React components to work in the portal by:
1. Converting Redux Toolkit Query → Axios + React hooks
2. Updating MUI v5 → MUI v7
3. Fixing import paths
4. Creating service layer and TypeScript types
5. Ensuring all code compiles without errors

---

## 📦 Step 1: Install Required Dependencies

First, install the TMFNUI dependencies that the portal doesn't have:

```bash
cd frontend
npm install moment moment-timezone formik yup yup-password @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid react-alert react-alert-template-basic country-state-city jwt-decode
npm install --save-dev @types/react-alert
```

**Note on Styling**: We are NOT installing SCSS support or TMFNUI-specific styling packages. The styling transformation will happen in Phase 2B (see REPLIT_STYLING_GUIDE.md).

---

## 🔧 Step 2: Create Service Layer (Convert Redux to Axios)

### 2.1 Create Job Request Service

**File**: `frontend/src/services/hiring/jobRequestService.ts`

```typescript
import axios from 'axios';

const HIRING_ZOHO_API = import.meta.env.VITE_HIRING_ZOHO_URL;

class JobRequestService {
  async getJobRequests(filters: any) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getFilteredJobRequets`, filters);
    return data;
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
}

export default new JobRequestService();
```

### 2.2 Create Interview Service

**File**: `frontend/src/services/hiring/interviewService.ts`

```typescript
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
    const { data } = await axios.post(`${HIRING_ZOHO_API}/updateSlotsAvailability`, {
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
```

### 2.3 Create Talent Pool Service

**File**: `frontend/src/services/hiring/talentPoolService.ts`

```typescript
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
```

---

## 🪝 Step 3: Create React Hooks

### 3.1 Job Request Hooks

**File**: `frontend/src/hooks/hiring/useJobRequests.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import jobRequestService from '../../services/hiring/jobRequestService';

export function useJobRequests(filters: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchJobRequests = useCallback(async () => {
    try {
      setLoading(true);
      const result = await jobRequestService.getJobRequests(filters);
      setData(result.data || []);
      setHasMore(result.hasMore || false);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchJobRequests();
  }, [fetchJobRequests]);

  return { data, loading, error, hasMore, refetch: fetchJobRequests };
}

export function useJobRequest(id: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchJobRequest = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobRequestById(id);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobRequest();
  }, [id]);

  return { data, loading, error };
}

export function useJobStats(jobId: string) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getJobStats(jobId);
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [jobId]);

  return { data, loading, error };
}

export function useCandidatesByStage(jobId: string, stageId: string, page: number = 1) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const result = await jobRequestService.getCandidatesByStage(jobId, stageId, page);
      setData(result.data || []);
      setHasMore(result.hasMore || false);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [jobId, stageId, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return { data, loading, error, hasMore, refetch: fetchCandidates };
}

export function useDynamicStages() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        const result = await jobRequestService.getAllDynamicStages();
        setData(result.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  return { data: data, loading, error };
}
```

### 3.2 Interview Hooks

**File**: `frontend/src/hooks/hiring/useInterviews.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import interviewService from '../../services/hiring/interviewService';

export function useInterviews(filters: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const result = await interviewService.getAllMeetings(filters);
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return { data, loading, error, refetch: fetchInterviews };
}

export function useInterviewSlots(userId: string, startDate: string, endDate: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!userId || !startDate || !endDate) return;

    try {
      setLoading(true);
      const result = await interviewService.getSlotsForEmployer(userId, startDate, endDate);
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, startDate, endDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { data, loading, error, refetch: fetchSlots };
}
```

### 3.3 Talent Pool Hooks

**File**: `frontend/src/hooks/hiring/useTalentPool.ts`

```typescript
import { useState, useCallback } from 'react';
import talentPoolService from '../../services/hiring/talentPoolService';

export function useAITalentSearch() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchParams: any) => {
    try {
      setLoading(true);
      const result = await talentPoolService.aiSearch(searchParams);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, search };
}

export function useCandidateByEmail() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByEmail = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const result = await talentPoolService.getCandidateByEmail(email);
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchByEmail };
}
```

---

## 🔄 Step 4: Convert Redux Usage to Hooks

In all copied component files, replace RTK Query hooks with the new custom hooks:

### Pattern to Find and Replace:

**BEFORE (TMFNUI - Redux)**:
```typescript
import { useGetFilteredJobRequetsQuery } from '../../redux/Hire/jobRequestApi';

const { data: jobRequests, isLoading, error } = useGetFilteredJobRequetsQuery({
  userId: user.id,
  statusId: [1],
  pageNumber: 1,
  pageSize: 20
});
```

**AFTER (Portal - Custom hooks)**:
```typescript
import { useJobRequests } from '../../hooks/hiring/useJobRequests';

const { data: jobRequests, loading: isLoading, error } = useJobRequests({
  userId: user.id,
  statusId: [1],
  pageNumber: 1,
  pageSize: 20
});
```

### Common Redux → Hook Conversions:

| TMFNUI (Redux) | Portal (Hooks) |
|----------------|----------------|
| `useGetFilteredJobRequetsQuery` | `useJobRequests` |
| `useGetJobRequestByIdQuery` | `useJobRequest(id)` |
| `useGetJobStatsQuery` | `useJobStats(jobId)` |
| `useGetAllMeetingsQuery` | `useInterviews(filters)` |
| `useGetSlotsForEmployerQuery` | `useInterviewSlots(userId, startDate, endDate)` |
| `useGetCandidateListPerStageByJobIdQuery` | `useCandidatesByStage(jobId, stageId, page)` |
| `useGetAllDynamicStagesQuery` | `useDynamicStages()` |

---

## 🎨 Step 5: Migrate MUI v5 to v7 (Minimal Styling)

**IMPORTANT**: For this phase, we're focusing on functionality, not styling. We'll do a proper styling transformation in Phase 2B.

### 5.1 Comment Out SCSS Imports

For now, comment out any `.scss` imports to avoid compilation errors:

**BEFORE**:
```typescript
import './index.scss';
```

**AFTER**:
```typescript
// TODO: Phase 2B - Replace with portal theme styling
// import './index.scss';
```

### 5.2 Remove makeStyles

**BEFORE (MUI v5)**:
```typescript
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
  }
}));

function MyComponent() {
  const classes = useStyles();
  return <div className={classes.container}>Content</div>;
}
```

**AFTER (MUI v7 - use sx prop)**:
```typescript
import { Box } from '@mui/material';

function MyComponent() {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: 'background.paper',
      }}
    >
      Content
    </Box>
  );
}
```

### 5.3 Use Basic MUI Styling (Portal Theme Integration Comes Later)

For now, use simple `sx` prop with basic values. We'll integrate portal theme and dark mode in Phase 2B.

**Simple conversions for now**:
```typescript
// Basic color values (will be replaced with theme in Phase 2B)
sx={{
  backgroundColor: '#f5f5f5',  // Will become theme.palette.background.paper
  color: '#000',               // Will become theme.palette.text.primary
  padding: 2,                  // Keep as-is (theme-aware)
  borderRadius: 1              // Keep as-is (theme-aware)
}}
```

### 5.4 Common MUI Migrations:

| MUI v5 | MUI v7 (Minimal) |
|--------|--------|
| `makeStyles()` | Use `sx` prop with basic values |
| `@mui/styles` | Remove import |
| `theme.spacing(2)` | `sx={{ padding: 2 }}` |
| `className={classes.foo}` | `sx={{ ...styles }}` or comment out for now |
| Custom SCSS | Comment out import, add TODO for Phase 2B |

---

## 📝 Step 6: Fix Import Paths

Update all import paths to match the portal structure:

### Imports to Update:

**BEFORE (TMFNUI)**:
```typescript
import Layout from '../../shared/components/LayoutV2';
import Header from '../../shared/components/CommonPageHeader/Header';
import { useGetJobRequestByIdQuery } from '../../redux/Hire/jobRequestApi';
```

**AFTER (Portal)**:
```typescript
import Layout from '../../components/hiring/HiringLayout';
import Header from '../../components/hiring/HiringHeader';
import { useJobRequest } from '../../hooks/hiring/useJobRequests';
```

### Import Path Patterns:

| Old Path | New Path |
|----------|----------|
| `../../shared/components/LayoutV2` | `../../components/hiring/HiringLayout` |
| `../../shared/components/CommonPageHeader` | `../../components/hiring/HiringHeader` |
| `../../redux/Hire/*` | Use service layer instead |
| `../../modules/JobRequest/*` | `../JobRequest/*` (relative within hiring) |

---

## 🔐 Step 7: Handle Authentication

Replace TMFNUI auth with portal auth:

**BEFORE (TMFNUI)**:
```typescript
import { useSelector } from 'react-redux';
const user = useSelector((state: any) => state.login.user);
```

**AFTER (Portal)**:
```typescript
import { useAuth } from '../../hooks/useAuth';
const { user } = useAuth();
```

---

## 🧩 Step 8: Create TypeScript Types

**File**: `frontend/src/types/hiring/index.ts`

```typescript
export interface JobRequest {
  jobRequestID: string;
  jobTitle: string;
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
  jobTitle: string;
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
```

---

## ✅ Step 9: Checklist for Each File

For each of the 52 copied files, ensure:

- [ ] All Redux imports removed
- [ ] All Redux hooks replaced with custom hooks
- [ ] All `makeStyles` converted to `sx` prop (basic values, not themed yet)
- [ ] All `.scss` imports commented out with "TODO: Phase 2B"
- [ ] All import paths updated to portal structure
- [ ] All `@mui/styles` imports removed
- [ ] Authentication uses portal's `useAuth` hook
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] Component compiles successfully (styling will be refined in Phase 2B)

---

## 🚨 Common Issues and Solutions

### Issue 1: Missing Dependencies
**Error**: `Cannot find module 'moment'`
**Solution**: Run `npm install` (Step 1)

### Issue 2: Redux Import Errors
**Error**: `Cannot find module '../../redux/Hire/jobRequestApi'`
**Solution**: Replace with service layer (Step 2) and hooks (Step 3)

### Issue 3: makeStyles Errors
**Error**: `makeStyles is not a function`
**Solution**: Convert to `sx` prop (Step 5)

### Issue 4: Auth State Not Found
**Error**: `state.login is undefined`
**Solution**: Use portal's `useAuth()` hook (Step 7)

### Issue 5: Type Errors
**Error**: `Property 'data' does not exist on type...`
**Solution**: Add TypeScript types (Step 8)

---

## 📊 Progress Tracking

Track your progress for each module:

### Job Request (15 files)
- [ ] Container.tsx
- [ ] JobsContainer.tsx
- [ ] JobCard/JobCard.tsx
- [ ] JobRequestFormContainer.tsx
- [ ] JobBreadcrumbs.tsx
- [ ] ... (10 more files)

### Interview (10 files)
- [ ] Interview.tsx
- [ ] InterviewBody.tsx
- [ ] InterviewCalendar.tsx
- [ ] InterviewHeader.tsx
- [ ] ... (6 more files)

### Talent Pool (21 files)
- [ ] Container.tsx
- [ ] TalentPoolBody.tsx
- [ ] TalentPoolCandidatesList.tsx
- [ ] CandidateCard/CandidateCard.tsx
- [ ] ... (17 more files)

### Shared Components (6 files)
- [ ] HiringLayout/*
- [ ] HiringHeader/*

---

## 🎯 Definition of Done (Phase 2A: Functionality)

Migration is complete when:

1. ✅ All 52 files migrated (no Redux, no MUI v5)
2. ✅ All services created (`jobRequestService`, `interviewService`, `talentPoolService`)
3. ✅ All hooks created (`useJobRequests`, `useInterviews`, `useTalentPool`)
4. ✅ All TypeScript types defined
5. ✅ No TypeScript errors in any file
6. ✅ No console errors when running `npm run dev`
7. ✅ All components compile successfully
8. ✅ All `.scss` imports commented out with TODOs
9. ✅ Basic MUI styling in place (functional, not themed)
10. ✅ Ready for Phase 2B (styling transformation) OR Phase 3 (auth bridge)

**Note**: Components will be functional but not yet styled with portal theme or dark mode. That comes in Phase 2B (see REPLIT_STYLING_GUIDE.md).

---

## 📚 Reference Documentation

- **API Documentation**: `docs/TMF-integration/TMFNUI_API_DOCUMENTATION.md`
- **Azure Update**: `docs/TMF-integration/TMFNUI_INTEGRATION_AZURE_UPDATE.md`
- **Phase 1 Summary**: `docs/TMF-integration/PHASE1_COMPLETION_SUMMARY.md`
- **Original Plan**: `docs/TMF-integration/TMFNUI_INTEGRATION_POC.md`

---

## 🚀 Ready to Start?

You have:
- ✅ 52 files copied
- ✅ Clear migration patterns
- ✅ Service layer templates
- ✅ Hook templates
- ✅ Type definitions
- ✅ Step-by-step guide

**Start with**: Job Request module (smallest, 15 files)
**Then**: Interview module (10 files)
**Finally**: Talent Pool module (largest, 21 files)

Good luck! 🎉
