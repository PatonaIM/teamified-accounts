# TMFNUI Integration Documentation

**Status**: Planning Complete - Ready for Implementation
**Last Updated**: 2025-10-30

---

## Overview

This folder contains comprehensive documentation for integrating 3 hiring modules from the TMFNUI project into the Team Member Portal:
- **Job Requests** - Job requisition management
- **Interviews** - Interview scheduling and calendar
- **Talent Pool** - Candidate pipeline management

**Chosen Approach**: Copy & Adapt with Backend Proxy (Proof of Concept)
- **Timeline**: 4-5 weeks
- **Strategy**: Copy TMFNUI source code, adapt to portal architecture, proxy API calls to TMFNUI backend
- **Future Path**: Migrate to Module Federation after successful PoC

---

## Documentation Files

### 📖 Primary Documents

1. **[TMFNUI_INTEGRATION_POC.md](./TMFNUI_INTEGRATION_POC.md)** (Main Guide)
   - **Purpose**: Complete implementation guide with detailed instructions
   - **Length**: ~50 pages
   - **Contents**:
     - Architecture design
     - Phase-by-phase implementation steps
     - Code examples and patterns
     - Testing strategies
     - Deployment guide
     - Migration path to Module Federation
   - **Use When**: You need detailed technical guidance for any phase

2. **[TMFNUI_INTEGRATION_QUICK_START.md](./TMFNUI_INTEGRATION_QUICK_START.md)** (Quick Reference)
   - **Purpose**: Condensed quick-reference guide
   - **Length**: ~10 pages
   - **Contents**:
     - Phase summaries
     - Essential commands
     - Quick setup steps
     - Common troubleshooting
   - **Use When**: You need a quick reminder of steps or commands

3. **[TMFNUI_INTEGRATION_TRACKER.md](./TMFNUI_INTEGRATION_TRACKER.md)** (Progress Tracker)
   - **Purpose**: Implementation checklist and progress tracking
   - **Length**: ~15 pages
   - **Contents**:
     - Checkboxes for every task
     - Phase completion tracking
     - Known issues log
     - Success criteria checklist
   - **Use When**: Daily tracking of implementation progress

---

## Quick Navigation

### Getting Started
- **First Time?** Start with [Quick Start Guide](./TMFNUI_INTEGRATION_QUICK_START.md)
- **Want Full Details?** Read [Full PoC Guide](./TMFNUI_INTEGRATION_POC.md)
- **Ready to Implement?** Use [Implementation Tracker](./TMFNUI_INTEGRATION_TRACKER.md)

### By Phase

| Phase | Quick Start | Full Guide | Tracker |
|-------|-------------|------------|---------|
| **Phase 1: Preparation** | [§1](./TMFNUI_INTEGRATION_QUICK_START.md#phase-1-preparation-week-1) | [§Phase 1](./TMFNUI_INTEGRATION_POC.md#phase-1-preparation) | [Checklist](./TMFNUI_INTEGRATION_TRACKER.md#phase-1-preparation-3-4-days) |
| **Phase 2: Module Migration** | [§2](./TMFNUI_INTEGRATION_QUICK_START.md#phase-2-module-migration-week-2-3) | [§Phase 2](./TMFNUI_INTEGRATION_POC.md#phase-2-module-migration) | [Checklist](./TMFNUI_INTEGRATION_TRACKER.md#phase-2-module-migration-1-2-weeks) |
| **Phase 3: Backend Proxy** | [§3](./TMFNUI_INTEGRATION_QUICK_START.md#phase-3-backend-proxy-week-3) | [§Phase 3](./TMFNUI_INTEGRATION_POC.md#phase-3-backend-proxy) | [Checklist](./TMFNUI_INTEGRATION_TRACKER.md#phase-3-backend-proxy-2-3-days) |
| **Phase 4: Integration** | [§4](./TMFNUI_INTEGRATION_QUICK_START.md#phase-4-integration-week-4) | [§Phase 4](./TMFNUI_INTEGRATION_POC.md#phase-4-integration) | [Checklist](./TMFNUI_INTEGRATION_TRACKER.md#phase-4-integration-1-week) |
| **Phase 5: Testing** | [§5](./TMFNUI_INTEGRATION_QUICK_START.md#phase-5-testing-week-5) | [§Phase 5](./TMFNUI_INTEGRATION_POC.md#phase-5-testing) | [Checklist](./TMFNUI_INTEGRATION_TRACKER.md#phase-5-testing-3-4-days) |

### By Topic

| Topic | Document | Section |
|-------|----------|---------|
| **Architecture Overview** | PoC Guide | [Architecture](./TMFNUI_INTEGRATION_POC.md#architecture) |
| **Dependencies to Install** | Quick Start | [§1.1](./TMFNUI_INTEGRATION_QUICK_START.md#step-1-install-dependencies) |
| **Backend Proxy Setup** | PoC Guide | [Phase 3](./TMFNUI_INTEGRATION_POC.md#phase-3-backend-proxy) |
| **Converting Redux to Axios** | PoC Guide | [§2.2](./TMFNUI_INTEGRATION_POC.md#22-convert-redux-to-react-queryaxios) |
| **MUI v5 to v7 Migration** | PoC Guide | [§2.3](./TMFNUI_INTEGRATION_POC.md#23-migrate-mui-v5-to-v7) |
| **Adding Routes** | Quick Start | [§4](./TMFNUI_INTEGRATION_QUICK_START.md#add-routes) |
| **Testing Checklist** | Tracker | [Phase 5](./TMFNUI_INTEGRATION_TRACKER.md#phase-5-testing-3-4-days) |
| **Rollback Plan** | PoC Guide | [Rollback](./TMFNUI_INTEGRATION_POC.md#rollback-plan) |
| **Module Federation Migration** | PoC Guide | [Migration](./TMFNUI_INTEGRATION_POC.md#migration-to-module-federation) |

---

## Implementation Workflow

```
1. Read Quick Start Guide
   └─> Understand overall approach and timeline

2. Set up environment (Phase 1)
   ├─> Install dependencies
   ├─> Analyze TMFNUI backend
   └─> Create directory structure

3. Migrate modules (Phase 2)
   ├─> Copy source files
   ├─> Convert Redux to Axios
   ├─> Update MUI components
   └─> Fix TypeScript errors

4. Configure proxy (Phase 3)
   ├─> Update vite.config.ts
   ├─> Set environment variables
   └─> Create auth bridge

5. Integrate into portal (Phase 4)
   ├─> Add routes
   ├─> Add navigation items
   └─> Test integration

6. Test thoroughly (Phase 5)
   ├─> Unit tests
   ├─> Manual testing
   ├─> E2E tests
   └─> Performance testing

7. Deploy and monitor
   └─> See deployment guide

8. (Later) Migrate to Module Federation
   └─> See migration section
```

---

## Key Decisions Made

### Why Copy & Adapt (Not Module Federation)?
- ✅ **Faster**: 4-5 weeks vs. 5-7 weeks
- ✅ **Simpler**: Single codebase, easier debugging
- ✅ **Lower Risk**: Easy rollback, smaller scope
- ✅ **PoC First**: Validate integration before complex federation
- ✅ **Migration Path**: Can migrate to Module Federation later

### Why Backend Proxy (Not Backend Migration)?
- ✅ **No Backend Changes**: Use existing TMFNUI backend as-is
- ✅ **Faster**: No endpoint migration needed
- ✅ **Lower Risk**: Keep working backend untouched
- ✅ **Flexible**: Can migrate backend later if needed

### What Modules to Include?
- ✅ **Job Requests**: Core hiring workflow
- ✅ **Interviews**: Critical for candidate scheduling
- ✅ **Talent Pool**: Candidate pipeline management
- ❌ **Excluded**: Timesheets, Documents, User Management (portal has these)

---

## Success Criteria

### Functional
- [ ] All 3 hiring modules accessible from portal
- [ ] CRUD operations work for all modules
- [ ] Filtering, searching, sorting work correctly
- [ ] Authentication seamless between portal and hiring backend
- [ ] Role-based access control enforced

### Technical
- [ ] No console errors
- [ ] All TypeScript errors resolved
- [ ] All tests passing (unit + E2E)
- [ ] Code linted and formatted
- [ ] No accessibility violations

### Performance
- [ ] Initial load < 3s on 3G
- [ ] Page transitions < 500ms
- [ ] API calls < 1s response time
- [ ] Lighthouse score > 90

### User Experience
- [ ] Hiring pages match portal design
- [ ] Navigation intuitive and consistent
- [ ] Error messages clear and actionable
- [ ] Mobile responsive

---

## Timeline

| Week | Phase | Deliverable |
|------|-------|-------------|
| **Week 1** | Preparation | Environment set up, dependencies installed, backend analyzed |
| **Week 2-3** | Module Migration | All 3 modules copied and adapted, Redux converted to Axios |
| **Week 3** | Backend Proxy | Vite proxy configured, auth bridge created, API calls working |
| **Week 4** | Integration | Routes added, navigation updated, RBAC enforced |
| **Week 5** | Testing | All tests passing, manual testing complete, ready for deployment |

**Total**: 4-5 weeks

---

## After PoC Success

### Stabilization (2-4 weeks)
- Monitor for issues
- Collect user feedback
- Fix any bugs discovered
- Document lessons learned

### Decision Point
**Option A: Keep Copy & Adapt**
- Continue with current approach
- Simpler maintenance
- Single codebase

**Option B: Migrate to Module Federation**
- Independent deployments
- Reduced bundle size
- Better scalability
- See [Migration Guide](./TMFNUI_INTEGRATION_POC.md#migration-to-module-federation)

---

## Resources

### Internal
- **Portal Guide**: `../CLAUDE.md`
- **Portal README**: `../README.md`
- **Deployment Docs**: `deployment/vercel-*.md`
- **BMad Guide**: `../.bmad-core/user-guide.md`

### External
- **MUI v5 → v7 Migration**: https://mui.com/material-ui/migration/migration-v6/
- **React Router v7**: https://reactrouter.com/
- **Vite Proxy**: https://vitejs.dev/config/server-options.html#server-proxy
- **Module Federation**: https://module-federation.io/

---

## Questions & Support

### Common Questions

**Q: What if TMFNUI backend isn't available?**
A: See [Rollback Plan](./TMFNUI_INTEGRATION_POC.md#rollback-plan) - can keep as separate app with SSO

**Q: What if we find more modules we want?**
A: Follow same Copy & Adapt process for additional modules, or consider Module Federation if adding 5+ modules

**Q: How do we update TMFNUI code in the future?**
A: Copy & Adapt creates code duplication. For frequent updates, consider migrating to Module Federation (see migration guide)

**Q: What if performance is poor?**
A: See [Performance Testing](./TMFNUI_INTEGRATION_POC.md#54-performance-testing) and optimization techniques

### Getting Help

- **Technical Issues**: See [Troubleshooting](./TMFNUI_INTEGRATION_QUICK_START.md#troubleshooting)
- **Implementation Questions**: Refer to [Full PoC Guide](./TMFNUI_INTEGRATION_POC.md)
- **Progress Tracking**: Use [Implementation Tracker](./TMFNUI_INTEGRATION_TRACKER.md)

---

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| README (this file) | 1.0 | 2025-10-30 |
| PoC Guide | 1.0 | 2025-10-30 |
| Quick Start | 1.0 | 2025-10-30 |
| Tracker | 1.0 | 2025-10-30 |

---

## Next Steps

1. ✅ **Planning Complete** - All documentation created
2. ⬜ **Team Review** - Review plan with stakeholders
3. ⬜ **Environment Setup** - Start Phase 1
4. ⬜ **Implementation** - Follow phase-by-phase guide
5. ⬜ **Testing** - Comprehensive testing
6. ⬜ **Deployment** - Deploy to staging, then production
7. ⬜ **Stabilization** - Monitor and improve
8. ⬜ **Future Enhancement** - Consider Module Federation migration

---

**Ready to begin?** Start with the [Quick Start Guide](./TMFNUI_INTEGRATION_QUICK_START.md)! 🚀
