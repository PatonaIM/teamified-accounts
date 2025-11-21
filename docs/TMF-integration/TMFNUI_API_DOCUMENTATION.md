# TMFNUI API Documentation

**Generated**: 2025-10-30
**Source**: Reverse-engineered from TMFNUI frontend code
**Backend Architecture**: Azure Functions (Microservices)
**Authentication**: JWT Bearer Token

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication](#authentication)
3. [Job Requests API](#job-requests-api)
4. [Interviews API](#interviews-api)
5. [Talent Pool API](#talent-pool-api)
6. [Supporting APIs](#supporting-apis)
7. [Data Models](#data-models)
8. [Environment URLs](#environment-urls)

---

## Architecture Overview

### Backend Services

TMFNUI uses a **microservices architecture** hosted on **Azure Functions** and **Azure API Management (APIM)**.

#### Development Environment

| Service | Base URL | Purpose |
|---------|----------|---------|
| **Zoho Service** | `https://func-tmf-reg-dev.azurewebsites.net/api/` | Job requests, candidates, workflow |
| **Workable Integration** | `https://func-tmf-workable-dev.azurewebsites.net/api/` | ATS integration |
| **Interview Service** | `https://api-interview-dev.azurewebsites.net/` | Meeting scheduling |
| **Onboarding Service** | `https://apionboarding-dev.azurewebsites.net/api/` | User management, auth |
| **Recruitly Integration** | `https://func-tmf-recruitly-dev.azurewebsites.net/api/` | Recruitment platform |
| **Teamified AI** | `https://teamified-ai-dev.azurewebsites.net/` | AI-powered talent search |

#### Production Environment

| Service | Base URL | Purpose |
|---------|----------|---------|
| **APIM Gateway** | `https://apim-tmf-prod-ausest-02.azure-api.net/` | API Management Gateway |
| - Zoho API | `/zoho/` | Job requests endpoints |
| - Workable API | `/workable/` | Workable integration |
| - Onboarding API | `/onboarding/api/` | User management |
| - Recruitly API | `/recruitly/` | Recruitment platform |
| **Interview Service** | `https://interview-prod-gbd5cyduehbeedgp.australiaeast-01.azurewebsites.net/` | Interview scheduling |
| **Teamified AI** | `https://teamified-ai.azurewebsites.net/` | AI talent search |

---

## Authentication

### JWT Authentication Flow

**Token Type**: JWT (JSON Web Token)
**Storage**: Redux store + localStorage
**Header Format**: `Authorization: Bearer {access_token}`

### Authentication Endpoints

**Base URL**: `{ONBOARDING_URL}/api/` (e.g., `https://apionboarding-dev.azurewebsites.net/api/`)

#### POST /signin
**Description**: User login with email/password

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Admin"
  }
}
```

#### POST /googlesignin
**Description**: Google OAuth login

**Request**:
```json
{
  "idToken": "google_id_token"
}
```

**Response**: Same as `/signin`

#### POST /refreshtoken
**Description**: Refresh access token

**Request**:
```json
{
  "token": "current_access_token",
  "refreshToken": "current_refresh_token"
}
```

**Response**:
```json
{
  "success": true,
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

#### POST /auth
**Description**: Get guest token (no authentication required)

**Request**: Empty body `{}`

**Response**:
```json
{
  "success": true,
  "token": "guest_token_string"
}
```

**Use Case**: Used for candidate-facing endpoints (assessment submissions, interview booking)

#### POST /logout
**Description**: User logout

**Request**: Empty body `{}`

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Token Refresh Flow

1. All requests include `Authorization: Bearer {access_token}` header
2. If response is `401 Unauthorized`:
   - Get guest token via `POST /auth`
   - Use guest token to call `POST /refreshtoken` with user's refresh token
   - Store new access token
   - Retry original request with new token

---

## Job Requests API

**Base URL**: `{ZOHO_URL}/api/` (e.g., `https://func-tmf-reg-dev.azurewebsites.net/api/`)

### Job Request Management

#### POST /getFilteredJobRequets
**Description**: Get filtered job requests with pagination (infinite scroll)

**Request**:
```json
{
  "userId": "string",
  "statusId": [1, 2, 3],  // Optional: [1=Open, 2=Completed, 3=Cancelled]
  "search": "Software Engineer",  // Optional
  "pageNumber": 1,
  "pageSize": 20,
  "clientId": "string"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "jobRequestID": "string",
      "jobTitle": "Senior React Developer",
      "jobDescription": "Job description...",
      "status": "Open",
      "statusId": 1,
      "clientName": "Acme Corp",
      "clientId": "string",
      "recruiterName": "Jane Smith",
      "recruiterId": "string",
      "location": "Sydney, Australia",
      "employmentType": "Full-time",
      "salaryRange": "$120k - $150k",
      "createdDate": "2025-10-15T10:00:00Z",
      "updatedDate": "2025-10-20T14:30:00Z",
      "candidateCount": 15,
      "stages": [
        {
          "stageId": "string",
          "stageName": "Applied",
          "candidateCount": 8
        },
        {
          "stageId": "string",
          "stageName": "Interview",
          "candidateCount": 5
        }
      ]
    }
  ],
  "hasMore": true,
  "totalCount": 45
}
```

#### POST /getJobRequestById
**Description**: Get detailed job request information

**Request**:
```json
{
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobRequestID": "string",
    "jobTitle": "Senior React Developer",
    "jobDescription": "Detailed job description...",
    "status": "Open",
    "statusId": 1,
    "clientName": "Acme Corp",
    "clientId": "string",
    "recruiterName": "Jane Smith",
    "recruiterId": "string",
    "location": "Sydney, Australia",
    "employmentType": "Full-time",
    "salaryRange": "$120k - $150k",
    "requiredSkills": ["React", "TypeScript", "Node.js"],
    "experienceLevel": "5-7 years",
    "educationRequirement": "Bachelor's degree",
    "createdDate": "2025-10-15T10:00:00Z",
    "updatedDate": "2025-10-20T14:30:00Z",
    "stages": [...],
    "candidateCount": 15
  }
}
```

#### POST /addJobRequest
**Description**: Create new job request

**Request**:
```json
{
  "jobTitle": "Senior React Developer",
  "jobDescription": "We are looking for...",
  "clientId": "string",
  "recruiterId": "string",
  "location": "Sydney, Australia",
  "employmentType": "Full-time",
  "salaryRange": "$120k - $150k",
  "requiredSkills": ["React", "TypeScript"],
  "experienceLevel": "5-7 years",
  "educationRequirement": "Bachelor's degree"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobRequestID": "newly_created_id",
    "message": "Job request created successfully"
  }
}
```

#### POST /updateJobRequest
**Description**: Update existing job request

**Request**:
```json
{
  "jobRequestId": "string",
  "jobTitle": "Senior React Developer (Updated)",
  "jobDescription": "Updated description...",
  "location": "Sydney, Australia",
  "salaryRange": "$130k - $160k"
  // Include only fields to update
}
```

**Response**:
```json
{
  "success": true,
  "message": "Job request updated successfully"
}
```

#### POST /updateJobRequestStatus
**Description**: Update job request status (Open/Completed/Cancelled)

**Request**:
```json
{
  "jobRequestId": "string",
  "statusId": 2  // 1=Open, 2=Completed, 3=Cancelled
}
```

**Response**:
```json
{
  "success": true,
  "message": "Job status updated successfully"
}
```

#### POST /getJobStats
**Description**: Get candidate statistics per stage for a job

**Request**:
```json
{
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCandidates": 15,
    "stages": [
      {
        "stageId": "string",
        "stageName": "Applied",
        "candidateCount": 8,
        "percentage": 53.3
      },
      {
        "stageId": "string",
        "stageName": "Phone Screen",
        "candidateCount": 5,
        "percentage": 33.3
      },
      {
        "stageId": "string",
        "stageName": "Interview",
        "candidateCount": 2,
        "percentage": 13.3
      }
    ]
  }
}
```

#### POST /getJobRequestTimeline
**Description**: Get activity timeline for job request

**Request**:
```json
{
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "eventId": "string",
      "eventType": "Status Change",
      "description": "Job status changed to Open",
      "performedBy": "Jane Smith",
      "performedAt": "2025-10-15T10:00:00Z"
    },
    {
      "eventId": "string",
      "eventType": "Candidate Added",
      "description": "John Doe added to Applied stage",
      "performedBy": "System",
      "performedAt": "2025-10-16T14:30:00Z"
    }
  ]
}
```

#### POST /markJobReqAsCancelled
**Description**: Cancel job request

**Request**:
```json
{
  "jobRequestId": "string",
  "reason": "Client cancelled the position"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Job request cancelled successfully"
}
```

#### GET /getAllJobRequests
**Description**: Get all job requests (no filters)

**Request**: No body

**Response**:
```json
{
  "success": true,
  "data": [...]  // Array of job requests
}
```

#### POST /getAllJobTitle
**Description**: Search job titles (autocomplete)

**Request**:
```json
{
  "search": "Software"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    "Software Engineer",
    "Software Developer",
    "Software Architect"
  ]
}
```

#### POST /getSalaryRangeMatrix
**Description**: Get salary ranges by job title and location

**Request**:
```json
{
  "jobTitle": "Software Engineer",
  "location": "Sydney"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobTitle": "Software Engineer",
    "location": "Sydney",
    "ranges": [
      { "level": "Junior", "min": 70000, "max": 90000 },
      { "level": "Mid", "min": 90000, "max": 120000 },
      { "level": "Senior", "min": 120000, "max": 160000 }
    ]
  }
}
```

### Candidate Management

#### POST /getCandidateListPerStageByJobId
**Description**: Get candidates for specific job and stage (paginated)

**Request**:
```json
{
  "jobRequestId": "string",
  "stageId": "string",  // Optional, omit for all stages
  "search": "john",  // Optional
  "pageNumber": 1,
  "pageSize": 20
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "candidateId": "string",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+61400000000",
      "headline": "Senior React Developer",
      "location": "Sydney, Australia",
      "stage": "Interview",
      "stageId": "string",
      "resumeURL": "https://storage.blob.core.windows.net/...",
      "isPrioritise": false,
      "disqualified": false,
      "createdAt": "2025-10-16T10:00:00Z"
    }
  ],
  "hasMore": true,
  "totalCount": 35
}
```

#### POST /getCandidateDetails
**Description**: Get full candidate profile

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "candidateId": "string",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+61400000000",
    "headline": "Senior React Developer with 7 years experience",
    "summary": "Experienced developer...",
    "location": "Sydney, Australia",
    "yearsOfExperience": 7,
    "skills": ["React", "TypeScript", "Node.js", "GraphQL"],
    "jobTitle": "Senior Developer",
    "stage": "Interview",
    "stageId": "string",
    "resumeURL": "https://storage.blob.core.windows.net/...",
    "candidateWorkExperiences": [
      {
        "company": "Tech Corp",
        "title": "Senior Developer",
        "startDate": "2020-01-01",
        "endDate": null,
        "current": true,
        "description": "Leading React development..."
      }
    ],
    "candidateEducationEntries": [
      {
        "institution": "University of Sydney",
        "degree": "Bachelor of Computer Science",
        "fieldOfStudy": "Computer Science",
        "startDate": "2014-01-01",
        "endDate": "2017-12-31"
      }
    ],
    "isPrioritise": false,
    "disqualified": false,
    "tentativeDOJ": "2025-12-01",
    "salaryIOTF": 140000,
    "createdAt": "2025-10-16T10:00:00Z",
    "updatedAt": "2025-10-20T14:30:00Z"
  }
}
```

#### POST /getCandidateDetailsByEmail
**Description**: Get candidate by email address (job-specific)

**Request**:
```json
{
  "email": "john@example.com",
  "jobRequestId": "string"
}
```

**Response**: Same as `/getCandidateDetails`

#### POST /addCandidate
**Description**: Add new candidate to job

**Request**:
```json
{
  "jobRequestId": "string",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+61400000000",
  "headline": "Senior React Developer",
  "location": "Sydney, Australia",
  "yearsOfExperience": 7,
  "skills": ["React", "TypeScript"],
  "resumeURL": "https://storage.blob.core.windows.net/...",
  "stageId": "string"  // Initial stage
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "candidateId": "newly_created_id",
    "message": "Candidate added successfully"
  }
}
```

#### POST /updateCandidate
**Description**: Update candidate information

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "name": "John Doe",
  "phone": "+61400000001",
  "headline": "Updated headline",
  "yearsOfExperience": 8,
  "resumeURL": "https://new-resume-url.com/..."
  // Include only fields to update
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate updated successfully"
}
```

#### POST /restoreCandidate
**Description**: Restore disqualified candidate

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "stageId": "string"  // Stage to restore to
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate restored successfully"
}
```

#### POST /prioritiseCandidate
**Description**: Mark candidate as priority or remove priority

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "isPrioritise": true  // true to add, false to remove
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate priority updated"
}
```

### Candidate Interactions

#### POST /addCandidateComment
**Description**: Add comment to candidate timeline

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "comment": "Great interview, strong technical skills",
  "commentType": "Interview Feedback"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "commentId": "string",
    "message": "Comment added successfully"
  }
}
```

#### POST /getCandidateAllComments
**Description**: Get all comments for candidate

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "commentId": "string",
      "comment": "Great interview, strong technical skills",
      "commentType": "Interview Feedback",
      "createdBy": "Jane Smith",
      "createdById": "string",
      "createdAt": "2025-10-18T15:30:00Z"
    }
  ]
}
```

#### POST /getCandidateTimeline
**Description**: Get full activity timeline for candidate

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "eventId": "string",
      "eventType": "Stage Change",
      "description": "Moved to Interview stage",
      "performedBy": "Jane Smith",
      "performedAt": "2025-10-18T10:00:00Z"
    },
    {
      "eventId": "string",
      "eventType": "Comment Added",
      "description": "Great interview, strong technical skills",
      "performedBy": "Jane Smith",
      "performedAt": "2025-10-18T15:30:00Z"
    }
  ]
}
```

#### POST /getAssignJobTimelineOnCandidate
**Description**: Get candidate's job assignment history

**Request**:
```json
{
  "candidateId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "jobRequestId": "string",
      "jobTitle": "Senior React Developer",
      "assignedDate": "2025-10-16T10:00:00Z",
      "currentStage": "Interview",
      "status": "Active"
    },
    {
      "jobRequestId": "string",
      "jobTitle": "Full Stack Developer",
      "assignedDate": "2025-09-20T10:00:00Z",
      "finalStage": "Offer",
      "status": "Rejected"
    }
  ]
}
```

### Workflow Management

#### GET /getAllDynamicStages
**Description**: Get all pipeline stages

**Request**: No body

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "stageId": "string",
      "stageName": "Applied",
      "order": 1
    },
    {
      "stageId": "string",
      "stageName": "Phone Screen",
      "order": 2
    },
    {
      "stageId": "string",
      "stageName": "Interview",
      "order": 3
    },
    {
      "stageId": "string",
      "stageName": "Offer",
      "order": 4
    }
  ]
}
```

---

## Interviews API

**Base URL**: `{ZOHO_URL}/api/` (e.g., `https://func-tmf-reg-dev.azurewebsites.net/api/`)

### Interview Meeting Management

#### POST /addInterviewMeeting
**Description**: Schedule interview meeting (employer flow)

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "title": "Technical Interview - John Doe",
  "startTime": "2025-11-01T10:00:00Z",
  "endTime": "2025-11-01T11:00:00Z",
  "meetingLink": "https://meet.google.com/xxx-yyyy-zzz",
  "interviewers": ["interviewer1@company.com", "interviewer2@company.com"],
  "round": "Round 1",  // "Round 1" or "Round 2"
  "notes": "Technical interview focusing on React and TypeScript"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "meetingId": "string",
    "eventId": "google_calendar_event_id",
    "message": "Interview scheduled successfully"
  }
}
```

#### POST /addInterviewMeetingCandidate
**Description**: Schedule interview meeting (candidate flow, uses guest auth)

**Request**:
```json
{
  "candidateEmail": "john@example.com",
  "jobRequestId": "string",
  "slotId": "string",
  "timeZone": "Australia/Sydney"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "meetingId": "string",
    "confirmationMessage": "Your interview has been scheduled"
  }
}
```

#### POST /getAllMeetings
**Description**: Get all meetings with filters

**Request**:
```json
{
  "userId": "string",  // Optional: filter by interviewer
  "candidateId": "string",  // Optional: filter by candidate
  "startDate": "2025-11-01",  // Optional: YYYY-MM-DD
  "endDate": "2025-11-30",  // Optional: YYYY-MM-DD
  "round": "Round 1"  // Optional: filter by round
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "meetingId": "string",
      "candidateName": "John Doe",
      "candidateEmail": "john@example.com",
      "jobTitle": "Senior React Developer",
      "jobRequestId": "string",
      "title": "Technical Interview - John Doe",
      "startTime": "2025-11-01T10:00:00Z",
      "endTime": "2025-11-01T11:00:00Z",
      "meetingLink": "https://meet.google.com/xxx-yyyy-zzz",
      "interviewers": ["Jane Smith", "Bob Johnson"],
      "round": "Round 1",
      "status": "Scheduled",
      "eventId": "google_calendar_event_id",
      "createdAt": "2025-10-25T09:00:00Z"
    }
  ]
}
```

#### POST /getAllLinkedMeetingsForCandidate
**Description**: Get all meetings for a specific candidate

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "meetingId": "string",
      "title": "Technical Interview",
      "startTime": "2025-11-01T10:00:00Z",
      "endTime": "2025-11-01T11:00:00Z",
      "round": "Round 1",
      "status": "Completed"
    },
    {
      "meetingId": "string",
      "title": "Culture Fit Interview",
      "startTime": "2025-11-05T14:00:00Z",
      "endTime": "2025-11-05T15:00:00Z",
      "round": "Round 2",
      "status": "Scheduled"
    }
  ]
}
```

#### POST /updateInterviewMeeting
**Description**: Update/reschedule interview meeting

**Request**:
```json
{
  "meetingId": "string",
  "startTime": "2025-11-02T10:00:00Z",  // Optional
  "endTime": "2025-11-02T11:00:00Z",  // Optional
  "meetingLink": "https://meet.google.com/new-link",  // Optional
  "notes": "Updated notes"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interview updated successfully"
}
```

#### POST /deleteInterview
**Description**: Cancel/delete interview meeting

**Request**:
```json
{
  "meetingId": "string",
  "reason": "Candidate no longer available"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interview cancelled successfully"
}
```

### Interview Slot Management

#### POST /getSlotsForEmployer
**Description**: Get employer's available time slots

**Request**:
```json
{
  "userId": "string",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "slotId": "string",
      "startTime": "2025-11-01T10:00:00Z",
      "endTime": "2025-11-01T11:00:00Z",
      "isBooked": false,
      "bookedBy": null
    },
    {
      "slotId": "string",
      "startTime": "2025-11-01T14:00:00Z",
      "endTime": "2025-11-01T15:00:00Z",
      "isBooked": true,
      "bookedBy": "John Doe"
    }
  ]
}
```

#### POST /getSlotsForCandidate
**Description**: Get available slots for candidate to book (guest auth)

**Request**:
```json
{
  "jobRequestId": "string",
  "candidateEmail": "john@example.com",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "offSet": 600  // Timezone offset in minutes (e.g., +10:00 = 600)
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "slotId": "string",
      "startTime": "2025-11-01T10:00:00Z",
      "endTime": "2025-11-01T11:00:00Z",
      "interviewer": "Jane Smith",
      "available": true
    }
  ]
}
```

#### POST /setSlotsAvailability
**Description**: Create multiple time slots

**Request**:
```json
{
  "userId": "string",
  "slots": [
    {
      "startTime": "2025-11-01T10:00:00Z",
      "endTime": "2025-11-01T11:00:00Z"
    },
    {
      "startTime": "2025-11-01T14:00:00Z",
      "endTime": "2025-11-01T15:00:00Z"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "createdCount": 2,
    "slotIds": ["slot_id_1", "slot_id_2"]
  }
}
```

#### POST /updateSlotsAvailability
**Description**: Update existing time slot

**Request**:
```json
{
  "slotId": "string",
  "startTime": "2025-11-01T11:00:00Z",
  "endTime": "2025-11-01T12:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Slot updated successfully"
}
```

#### POST /deleteSlots
**Description**: Delete time slot

**Request**:
```json
{
  "slotId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Slot deleted successfully"
}
```

#### POST /reserveCandidateSlots
**Description**: Reserve slot for candidate

**Request**:
```json
{
  "slotId": "string",
  "candidateId": "string",
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "meetingId": "string",
    "message": "Slot reserved successfully"
  }
}
```

#### POST /candidateInterviewRescheduledSlots
**Description**: Reschedule interview slot

**Request**:
```json
{
  "meetingId": "string",
  "newSlotId": "string",
  "reason": "Candidate requested different time"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interview rescheduled successfully"
}
```

### Interview Questions

#### POST /getInterviewQuestions
**Description**: Get interview questions for job

**Request**:
```json
{
  "jobRequestId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "questionId": "string",
      "question": "Explain the difference between useMemo and useCallback",
      "category": "Technical",
      "difficulty": "Medium"
    },
    {
      "questionId": "string",
      "question": "Describe your experience with TypeScript",
      "category": "Experience",
      "difficulty": "Easy"
    }
  ]
}
```

---

## Talent Pool API

### AI-Powered Talent Search

**Base URL**: `{TEAMIFIED_AI_URL}/` (e.g., `https://teamified-ai-dev.azurewebsites.net/`)

#### POST /TalentPool/ai-search
**Description**: AI-powered semantic candidate search with scoring

**Request**:
```json
{
  "searchText": "experienced React developer with TypeScript and GraphQL",
  "tags": ["React", "TypeScript", "GraphQL"],
  "filters": {
    "yearsOfExperience": "5-7",
    "location": ["Sydney", "Melbourne"],
    "jobTitle": ["Senior Developer", "Lead Developer"],
    "type": "all",  // "all" | "active" | "disqualified"
    "stages": ["Applied", "Interview"],
    "clients": ["client_id_1", "client_id_2"],
    "excludeJobIds": [123, 456]
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "candidateId": "string",
        "name": "John Doe",
        "email": "john@example.com",
        "headline": "Senior React Developer",
        "score": 0.92,
        "matchExplanation": "Strong match: 7 years React experience, TypeScript expert, GraphQL in recent projects",
        "keyHighlights": [
          "7 years React experience",
          "TypeScript expert (4 years)",
          "GraphQL implementation experience"
        ],
        "concerns": [
          "No formal AWS certification mentioned"
        ],
        "yearsOfExperience": 7,
        "location": "Sydney, Australia",
        "skills": ["React", "TypeScript", "GraphQL", "Node.js"],
        "resumeURL": "https://storage.blob.core.windows.net/..."
      }
    ],
    "extractedTags": ["React", "TypeScript", "GraphQL", "API Development"],
    "filtersMeta": {
      "availableLocations": ["Sydney", "Melbourne", "Brisbane"],
      "availableJobTitles": ["Developer", "Senior Developer", "Lead Developer"],
      "experienceRanges": ["0-2", "3-5", "5-7", "7-10", "10+"]
    },
    "pagination": {
      "currentPage": 1,
      "hasMore": true,
      "totalCount": 45,
      "totalPages": 3
    }
  }
}
```

**Key Features**:
- Semantic search (understands intent, not just keywords)
- AI-powered candidate scoring (0-1 scale)
- Match explanations for each candidate
- Key highlights extraction
- Concerns/red flags identification
- Tag extraction from search query
- Advanced filtering options

### CRM Candidate Search

**Base URL**: `{ZOHO_URL}/api/`

#### POST /crmGetCandidateDetailsByEmailOpt
**Description**: Get candidate details by email (optimized CRM view, searches across all jobs)

**Request**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "candidateId": "string",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+61400000000",
    "headline": "Senior React Developer",
    "location": "Sydney, Australia",
    "yearsOfExperience": 7,
    "skills": ["React", "TypeScript", "Node.js"],
    "jobApplications": [
      {
        "jobRequestId": "string",
        "jobTitle": "Senior React Developer",
        "stage": "Interview",
        "appliedDate": "2025-10-16T10:00:00Z",
        "status": "Active"
      },
      {
        "jobRequestId": "string",
        "jobTitle": "Full Stack Developer",
        "stage": "Offer",
        "appliedDate": "2025-09-20T10:00:00Z",
        "status": "Rejected"
      }
    ],
    "resumeURL": "https://storage.blob.core.windows.net/...",
    "totalApplications": 2
  }
}
```

### Candidate Job Assignment

#### POST /assignCandidateToJob
**Description**: Assign candidate(s) to job(s)

**Request**:
```json
{
  "candidateIds": ["candidate_id_1", "candidate_id_2"],
  "jobRequestIds": ["job_id_1", "job_id_2"],
  "stageId": "string"  // Initial stage
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "assignedCount": 4,
    "message": "2 candidates assigned to 2 jobs successfully"
  }
}
```

#### POST /removeCandidateFromJob
**Description**: Remove candidate from job

**Request**:
```json
{
  "candidateId": "string",
  "jobRequestId": "string",
  "reason": "No longer interested"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Candidate removed from job successfully"
}
```

---

## Supporting APIs

### Tasks API

**Base URL**: `{ZOHO_URL}/api/`

#### POST /GetAllTasksByRole
**Description**: Get tasks filtered by role

**Request**:
```json
{
  "role": "Recruiter",
  "status": "Pending"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "taskId": "string",
      "title": "Review resume for John Doe",
      "description": "...",
      "status": "Pending",
      "dueDate": "2025-11-01T00:00:00Z",
      "assignedTo": "Jane Smith",
      "createdBy": "System"
    }
  ]
}
```

#### POST /addTask
**Description**: Create new task

**Request**:
```json
{
  "title": "Review resume",
  "description": "Review resume for John Doe",
  "candidateId": "string",
  "jobRequestId": "string",
  "assignedToUserId": "string",
  "dueDate": "2025-11-01T00:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "string",
    "message": "Task created successfully"
  }
}
```

### Documents API

**Base URL**: `{ZOHO_URL}/api/`

#### POST /GetAllDocuments
**Description**: Get all documents for candidate

**Request**:
```json
{
  "candidateId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "documentId": "string",
      "fileName": "John_Doe_Resume.pdf",
      "fileType": "Resume",
      "fileURL": "https://storage.blob.core.windows.net/...",
      "uploadedAt": "2025-10-16T10:00:00Z"
    }
  ]
}
```

#### POST /generateUploadLink
**Description**: Generate Azure Blob Storage upload link

**Request**:
```json
{
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "candidateId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "uploadURL": "https://storage.blob.core.windows.net/...",
    "documentId": "string",
    "expiresAt": "2025-10-30T12:00:00Z"
  }
}
```

---

## Data Models

### JobRequest
```typescript
interface JobRequest {
  jobRequestID: string;
  jobTitle: string;
  jobDescription: string;
  status: "Open" | "Completed" | "Cancelled";
  statusId: 1 | 2 | 3;
  clientName: string;
  clientId: string;
  recruiterName: string;
  recruiterId: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  salaryRange: string;
  requiredSkills: string[];
  experienceLevel: string;
  educationRequirement: string;
  createdDate: string;  // ISO 8601
  updatedDate: string;  // ISO 8601
  candidateCount: number;
  stages: Stage[];
}

interface Stage {
  stageId: string;
  stageName: string;
  order: number;
  candidateCount: number;
}
```

### Candidate
```typescript
interface Candidate {
  candidateId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  headline: string;
  summary: string;
  location: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  zipCode: string;
  yearsOfExperience: number;
  skills: string[];
  jobTitle: string;
  stage: string;
  stageId: string;
  disqualified: boolean;
  disqualificationReason?: string;
  isPrioritise: boolean;
  resumeURL: string;
  fileName: string;
  candidateWorkExperiences: WorkExperience[];
  candidateEducationEntries: Education[];
  tentativeDOJ: string;  // Date of Joining
  probationPeriod: number;
  noticePeriodPostProbation: number;
  salaryIOTF: number;  // In-office to Field
  isNoticeNegotiable: boolean;
  hiredAt?: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  tags: string[];
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}
```

### InterviewMeeting
```typescript
interface InterviewMeeting {
  meetingId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobRequestId: string;
  jobTitle: string;
  title: string;
  startTime: string;  // ISO 8601
  endTime: string;  // ISO 8601
  meetingLink: string;
  interviewers: string[];
  round: "Round 1" | "Round 2";
  status: "Scheduled" | "Completed" | "Cancelled";
  notes: string;
  eventId: string;  // Google Calendar event ID
  createdAt: string;
  updatedAt: string;
}
```

### InterviewSlot
```typescript
interface InterviewSlot {
  slotId: string;
  userId: string;
  startTime: string;  // ISO 8601
  endTime: string;  // ISO 8601
  isBooked: boolean;
  bookedBy?: string;
  candidateId?: string;
  jobRequestId?: string;
  meetingId?: string;
  createdAt: string;
}
```

---

## Environment URLs

### Development
```bash
# Zoho Service (Job Requests, Candidates, Meetings)
REACT_APP_BASE_API_URL=https://func-tmf-reg-dev.azurewebsites.net/api/

# Onboarding Service (Auth, Users)
REACT_APP_ONBAORDING_URL=https://apionboarding-dev.azurewebsites.net/api/

# Interview Service
REACT_APP_INTERVIEW_URL=https://api-interview-dev.azurewebsites.net/

# Teamified AI (Talent Search)
REACT_APP_TEAMIFIED_AI_URL=https://teamified-ai-dev.azurewebsites.net/

# Workable Integration
REACT_APP_WORKABLE_API_URL=https://func-tmf-workable-dev.azurewebsites.net/api/

# Recruitly Integration
REACT_APP_RECRUITLY_API_URL=https://func-tmf-recruitly-dev.azurewebsites.net/api/
```

### Production
```bash
# API Management Gateway
REACT_APP_BASE_API_URL=https://apim-tmf-prod-ausest-02.azure-api.net/zoho/

REACT_APP_ONBAORDING_URL=https://apim-tmf-prod-ausest-02.azure-api.net/onboarding/api/

REACT_APP_INTERVIEW_URL=https://interview-prod-gbd5cyduehbeedgp.australiaeast-01.azurewebsites.net/

REACT_APP_TEAMIFIED_AI_URL=https://teamified-ai.azurewebsites.net/

REACT_APP_WORKABLE_API_URL=https://apim-tmf-prod-ausest-02.azure-api.net/workable/

REACT_APP_RECRUITLY_API_URL=https://apim-tmf-prod-ausest-02.azure-api.net/recruitly/
```

---

## Notes

1. **All endpoints use POST method** except where noted (GET)
2. **Authentication**: Include `Authorization: Bearer {token}` header in all requests (except `/auth` and guest-auth endpoints)
3. **Pagination**: Uses `pageNumber` and `pageSize` (not offset/limit)
4. **Dates**: ISO 8601 format (`2025-10-30T10:00:00Z`)
5. **Guest Authentication**: Some candidate-facing endpoints accept guest tokens from `/auth` endpoint
6. **Google Calendar**: Interviews integrate with Google Calendar via `eventId`
7. **Azure Blob Storage**: Document uploads use generated upload links
8. **No Swagger**: This documentation was reverse-engineered from TypeScript code

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Integration Team
