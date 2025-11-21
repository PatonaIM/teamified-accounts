# TMFNUI Integration - Azure Backend Update

**Date**: 2025-10-30
**Status**: Integration Plan Updated
**Critical Discovery**: TMFNUI uses Azure-hosted microservices (not local backend)

---

## 🚨 Key Discovery

After analyzing the TMFNUI project, we discovered that:

**❌ There is NO local backend to run**
**✅ TMFNUI uses Azure Functions (serverless microservices)**

This changes our integration approach from the original plan.

---

## Updated Architecture

### Original Plan (Incorrect Assumption)
```
Portal Frontend ──proxy──> Local TMFNUI Backend (localhost:4000)
                            ↓
                            Database
```

### Actual Architecture (Discovered)
```
Portal Frontend ──proxy──> Azure Functions (Development)
                            ↓
                            https://func-tmf-reg-dev.azurewebsites.net/api/
                            https://api-interview-dev.azurewebsites.net/
                            https://teamified-ai-dev.azurewebsites.net/
                            ↓
                            Azure SQL Database
```

---

## Updated Integration Strategy

### Phase 3: Backend Proxy (REVISED)

#### Option A: Proxy to Azure Development (Recommended for PoC) ⭐

**Configuration**: Update `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Portal API (existing)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },

      // NEW: Hiring API - Job Requests, Candidates, Meetings
      '/hiring-api/zoho': {
        target: 'https://func-tmf-reg-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/zoho/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const token = req.headers.authorization;
            if (token) {
              proxyReq.setHeader('Authorization', token);
            }
            console.log(`[Hiring API] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });
        },
      },

      // NEW: Interview Service
      '/hiring-api/interview': {
        target: 'https://api-interview-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/interview/, ''),
      },

      // NEW: AI Talent Search
      '/hiring-api/ai': {
        target: 'https://teamified-ai-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/ai/, ''),
      },

      // NEW: Onboarding/Auth Service
      '/hiring-api/auth': {
        target: 'https://apionboarding-dev.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/hiring-api\/auth/, '/api'),
      },
    },
  },
});
```

**How it works**:
```
Frontend Request                    Vite Proxy                   Azure Backend
────────────────                   ──────────                   ─────────────

/hiring-api/zoho/getFilteredJobRequets  ──> [Rewrite] ──> https://func-tmf-reg-dev.../api/getFilteredJobRequets

/hiring-api/interview/questionnaire      ──> [Rewrite] ──> https://api-interview-dev.../questionnaire

/hiring-api/ai/TalentPool/ai-search      ──> [Rewrite] ──> https://teamified-ai-dev.../TalentPool/ai-search
```

---

## Updated Environment Variables

### Development `.env.development`

```bash
# Portal API (existing)
VITE_API_URL=http://localhost:3000/api

# NEW: Hiring APIs - Proxied to Azure Development
VITE_HIRING_ZOHO_URL=/hiring-api/zoho
VITE_HIRING_INTERVIEW_URL=/hiring-api/interview
VITE_HIRING_AI_URL=/hiring-api/ai
VITE_HIRING_AUTH_URL=/hiring-api/auth

# Direct Azure URLs (for reference/debugging)
VITE_AZURE_ZOHO_URL=https://func-tmf-reg-dev.azurewebsites.net/api/
VITE_AZURE_INTERVIEW_URL=https://api-interview-dev.azurewebsites.net/
VITE_AZURE_AI_URL=https://teamified-ai-dev.azurewebsites.net/
VITE_AZURE_AUTH_URL=https://apionboarding-dev.azurewebsites.net/api/
```

### Production `.env.production`

```bash
# Portal API
VITE_API_URL=https://api.teamified.com/api

# NEW: Hiring APIs - Direct to Azure Production (via APIM)
VITE_HIRING_ZOHO_URL=https://apim-tmf-prod-ausest-02.azure-api.net/zoho
VITE_HIRING_INTERVIEW_URL=https://interview-prod-gbd5cyduehbeedgp.australiaeast-01.azurewebsites.net
VITE_HIRING_AI_URL=https://teamified-ai.azurewebsites.net
VITE_HIRING_AUTH_URL=https://apim-tmf-prod-ausest-02.azure-api.net/onboarding/api
```

---

## Updated Service Layer

### Job Request Service (Updated)

```typescript
// frontend/src/services/hiring/jobRequestService.ts
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
}

export default new JobRequestService();
```

### Interview Service (Updated)

```typescript
// frontend/src/services/hiring/interviewService.ts
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

  // Slot management (Zoho API)
  async getSlotsForEmployer(userId: string, startDate: string, endDate: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getSlotsForEmployer`, {
      userId,
      startDate,
      endDate,
    });
    return data;
  }

  async createSlots(slots: any[]) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/setSlotsAvailability`, { slots });
    return data;
  }

  // Interview questions (Interview Service API)
  async getQuestionnaire(interviewId: string) {
    const { data } = await axios.get(`${HIRING_INTERVIEW_API}/questionnaire`, {
      params: { interviewId },
    });
    return data;
  }
}

export default new InterviewService();
```

### Talent Pool Service (Updated)

```typescript
// frontend/src/services/hiring/talentPoolService.ts
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

  async getCandidateTimeline(candidateId: string, jobId: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/getCandidateTimeline`, {
      candidateId,
      jobRequestId: jobId,
    });
    return data;
  }
}

export default new TalentPoolService();
```

---

## Updated Authentication Bridge

```typescript
// frontend/src/services/hiring/authBridge.ts
import axios from 'axios';

const HIRING_AUTH_API = import.meta.env.VITE_HIRING_AUTH_URL;

class HiringAuthBridge {
  private guestToken: string | null = null;

  /**
   * Set up Axios interceptors for hiring API authentication
   */
  setupInterceptors() {
    axios.interceptors.request.use(
      async (config) => {
        // Only process hiring API requests
        if (config.url?.startsWith('/hiring-api')) {
          // Get portal token
          const portalToken = localStorage.getItem('auth_token');

          if (portalToken) {
            // Use portal token for hiring API
            config.headers.Authorization = `Bearer ${portalToken}`;
          } else {
            // If no portal token, get guest token
            const guestToken = await this.getGuestToken();
            config.headers.Authorization = `Bearer ${guestToken}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 from hiring API
        if (
          error.config?.url?.startsWith('/hiring-api') &&
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          console.log('[Auth Bridge] 401 from hiring API, attempting token refresh');

          // Get portal refresh token
          const refreshToken = localStorage.getItem('refresh_token');

          if (refreshToken) {
            try {
              // Get guest token first
              const guestToken = await this.getGuestToken();

              // Use guest token to refresh portal token
              const response = await axios.post(
                `${HIRING_AUTH_API}/refreshtoken`,
                {
                  token: localStorage.getItem('auth_token'),
                  refreshToken,
                },
                {
                  headers: { Authorization: `Bearer ${guestToken}` },
                }
              );

              if (response.data.success) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                localStorage.setItem('auth_token', newToken);
                localStorage.setItem('refresh_token', newRefreshToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.error('[Auth Bridge] Token refresh failed:', refreshError);
              // Redirect to login if refresh fails
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get guest token from TMFNUI auth service
   */
  async getGuestToken(): Promise<string> {
    if (this.guestToken) {
      return this.guestToken;
    }

    try {
      const response = await axios.post(`${HIRING_AUTH_API}/auth`, {});

      if (response.data.success && response.data.token) {
        this.guestToken = response.data.token;
        return this.guestToken;
      }

      throw new Error('Failed to get guest token');
    } catch (error) {
      console.error('[Auth Bridge] Failed to get guest token:', error);
      throw error;
    }
  }

  /**
   * Clear cached guest token
   */
  clearGuestToken() {
    this.guestToken = null;
  }
}

export default new HiringAuthBridge();
```

---

## Updated Development Workflow

### Running Services

**Terminal 1: Portal Frontend**
```bash
cd frontend
npm run dev  # http://localhost:5173
```

**Terminal 2: Portal Backend**
```bash
npm run start:dev  # http://localhost:3000
```

**No Terminal 3 Needed!** ✅
TMFNUI backend is running on Azure (no local server needed)

### Testing Connectivity

Before starting development, verify access to Azure services:

```bash
# Test Zoho API (Job Requests)
curl https://func-tmf-reg-dev.azurewebsites.net/api/getAllDynamicStages

# Test Interview Service
curl https://api-interview-dev.azurewebsites.net/

# Test AI Service
curl https://teamified-ai-dev.azurewebsites.net/

# Test Auth Service
curl -X POST https://apionboarding-dev.azurewebsites.net/api/auth -H "Content-Type: application/json" -d "{}"
```

**Expected Results**:
- ✅ 200 OK or JSON response = Service accessible
- ❌ Connection timeout = VPN/network access needed
- ❌ 403 Forbidden = CORS or API key needed

---

## Implications for Integration

### ✅ Benefits of Azure Architecture

1. **No Local Backend Setup**: No need to install/run TMFNUI backend locally
2. **Always Up-to-date**: Development environment reflects latest backend changes
3. **Real Data**: Access to development database with test data
4. **Faster Setup**: Skip backend installation in Phase 1
5. **Production-like**: Development closely mirrors production setup

### ⚠️ Considerations

1. **Network Dependency**: Requires internet connection to Azure
2. **CORS Configuration**: May need CORS updates on Azure services
3. **API Keys**: Might need Azure API keys or subscription keys
4. **Rate Limiting**: Azure services may have rate limits
5. **VPN Required**: May need VPN for accessing dev environment

### 🔧 Updated Phase 1 Checklist

**Remove** these tasks (no longer needed):
- ❌ ~~Locate TMFNUI backend directory~~
- ❌ ~~Start TMFNUI backend locally~~
- ❌ ~~Note backend port~~

**Add** these tasks:
- ✅ Verify access to Azure development services
- ✅ Test Azure API connectivity
- ✅ Obtain Azure credentials (if needed)
- ✅ Configure CORS on Azure services (if needed)

---

## Rollback Considerations

If Azure connectivity issues arise:

### Plan B: Replicate Endpoints in Portal Backend

Create NestJS controllers that replicate critical TMFNUI endpoints:

```typescript
// src/modules/hiring/job-requests/job-requests.controller.ts
@Controller('v1/hiring/jobs')
export class JobRequestsController {
  @Post('filtered')
  async getFilteredJobs(@Body() filters: JobRequestFilters) {
    // Call Azure API internally (server-side)
    // or implement logic in portal backend
  }
}
```

**Timeline**: 2-3 weeks to replicate critical endpoints

---

## Next Steps

1. ✅ **Test Azure Connectivity** (Task C)
2. ✅ **Implement Vite Proxy** (Task D)
3. ✅ **Verify Authentication Flow**
4. ✅ **Begin Module Migration** (Phase 2)

---

## Updated Timeline

| Phase | Original | Updated | Change |
|-------|----------|---------|--------|
| Phase 1: Preparation | 3-4 days | **2-3 days** | ⬇️ Faster (no backend setup) |
| Phase 2: Module Migration | 1-2 weeks | 1-2 weeks | ➡️ Same |
| Phase 3: Backend Proxy | 2-3 days | **3-4 days** | ⬆️ Slightly longer (multiple Azure services) |
| Phase 4: Integration | 1 week | 1 week | ➡️ Same |
| Phase 5: Testing | 3-4 days | 3-4 days | ➡️ Same |
| **Total** | **4-5 weeks** | **4-5 weeks** | ➡️ Same |

Net change: ~Same overall timeline, but Phase 1 faster, Phase 3 slightly longer

---

## Questions & Answers

**Q: Do we need VPN to access Azure dev services?**
A: TBD - Will test connectivity in Task C

**Q: Are there CORS restrictions on Azure APIs?**
A: TBD - Will discover during connectivity testing

**Q: Can portal users authenticate with TMFNUI APIs?**
A: Yes, using guest token + portal token flow (see Auth Bridge above)

**Q: What about production deployment?**
A: Production uses Azure APIM gateway with direct URLs (no proxy needed)

---

**Document Version**: 1.0
**Status**: Integration Plan Updated ✅
**Next Action**: Test Azure Connectivity (Task C)
