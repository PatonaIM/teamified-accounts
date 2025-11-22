# Teamified Platform Documentation Index

**Last Updated:** November 22, 2025

This index provides an overview of all major documentation for the Teamified platform.

## 📋 Quick Links

### Most Recent Updates (November 2025)
- [Organization Management and Roles](ORGANIZATION_MANAGEMENT_AND_ROLES.md) - **NEW** - Complete guide to organization and role system
- [November 2025 Changelog](CHANGELOG_NOVEMBER_2025.md) - **NEW** - All changes made in November 2025

### Core Documentation
- [Main README](../README.md) - Project overview and quick start guide
- [Product Requirements Document](prd.md) - Complete PRD for the platform

## 🏗️ Architecture Documentation

### Core Architecture
- [Technology Stack](architecture/tech-stack.md) - Technologies and frameworks used
- [Architecture Overview](architecture/index.md) - System architecture and design
- [Data Model Changes](architecture/data-model-changes.md) - Database schema and data model ⚠️ *Updated Nov 2025*
- [API Specifications](architecture/api-specifications.md) - REST API documentation

### Integration Documentation
- [Team Connect SSO Integration](team-connect-sso-integration.md) - OAuth integration setup
- [Supabase Implementation Plan](supabase-implementation-plan.md) - Supabase integration
- [OAuth Federated Auth Plan](oauth-federated-auth-plan.md) - Federated authentication

## 👥 Organization & Role Management

### Current System (November 2025)
- [Organization Management and Roles](ORGANIZATION_MANAGEMENT_AND_ROLES.md) - **Primary documentation for current system**
  - Organization types (client vs internal)
  - Subscription tiers (free, basic, professional, enterprise, internal)
  - Complete role system (client and internal roles)
  - API endpoints and validation rules
  - Frontend implementation details

### Role Types Reference

**Client Roles:**
- `client_admin` - Full organization management
- `client_hr` - HR functions
- `client_finance` - Financial operations  
- `client_recruiter` - Recruitment
- `client_employee` - Standard user (default)

**Internal Roles:**
- `super_admin` - Full system access
- `internal_hr` - Internal HR
- `internal_finance` - Internal finance
- `internal_account_manager` - Client account management
- `internal_recruiter` - Internal recruitment
- `internal_marketing` - Marketing operations
- `internal_employee` - Standard internal staff (default)

## 📚 Product Requirements

### Epic Documentation
- [Epic 1: Foundation & Core Infrastructure](prd/epic-1-foundation-core-infrastructure.md)
- [Epic 2: Advanced Data Operations](prd/epic-2-advanced-data-operations.md)
- [Epic 3: Employment & Salary Management](prd/epic-3-employment-salary-management.md)
- [Epic 4: Reporting & Analytics](prd/epic-4-reporting-analytics.md)
- [Epic 5: System Administration](prd/epic-5-system-administration.md)
- [Epic 6: EOR Onboarding](prd/epic-6-eor-onboarding.md)
- [Epic 7: Payroll Management](prd/epic-7-payroll-management.md)
- [Epic 8: Job Application Integration](prd/epic-8-job-application-integration.md)

## 📖 User Guides

- [Payroll Admin Guide](user-guides/payroll-admin-guide.md)
- [My Documents Guide](user-guides/my-documents.md)
- [Sample CV README](user-guides/sample-cv-readme.md)

## 🧪 Testing Documentation

### Payroll Testing
- [Payroll Testing Guide](testing/payroll-testing-guide.md)
- [Payroll Components Testing Guide](testing/payroll-components-testing-guide.md)

### Story Testing
- [Story 8.1 Test Plan](testing/story-8.1-test-plan.md)
- [Story 8.1 Test Results](testing/story-8.1-test-results.md)
- [Story 8.1 Quickstart](testing/story-8.1-quickstart.md)
- [Story 8.1 Playwright Results](testing/story-8.1-playwright-results.md)

## 🎨 Design & Style Guide

- [Style Guide README](style-guide/README.md)
- [Quick Reference](style-guide/quick-reference.md)
- [Material UI 3 Expressive Design](style-guide/material-ui-3-expressive-design.md)

### Archived Style Guides
- [Typography](style-guide/archive/typography.md)
- [Spacing](style-guide/archive/spacing.md)
- [Icons](style-guide/archive/icons.md)
- [Components](style-guide/archive/components.md)
- [Colors](style-guide/archive/colors.md)
- [Accessibility](style-guide/archive/accessibility.md)

## 🔌 API Documentation

- [API Documentation Guidelines](api/api-documentation-guidelines.md)
- [API Security](api/api-security.md)
- [API Rate Limiting](api/api-rate-limiting.md)
- [API Performance Testing](api/api-performance-testing.md)
- [Payroll Salary Components API](api/payroll-salary-components-api.md)
- [Payroll Statutory Components API](api/payroll-statutory-components-api.md)

## 📖 User Stories

### Active Stories
- [Story 1.1](stories/1.1.story.md) - [Story 1.2](stories/1.2.story.md) - [Story 1.3](stories/1.3.story.md) - [Story 1.4](stories/1.4.story.md) - [Story 1.5](stories/1.5.story.md)
- [Story 2.1](stories/2.1.story.md) - [Story 2.5](stories/2.5.story.md) - [Story 2.6](stories/2.6.story.md) - [Story 2.7](stories/2.7.story.md)
- [Story 6.1](stories/6.1.story.md) - [Story 6.1.1](stories/6.1.1.story.md) - [Story 6.2](stories/6.2.story.md) - [Story 6.3](stories/6.3.story.md) - [Story 6.4](stories/6.4.story.md) - [Story 6.5](stories/6.5.story.md)
- [Story 7.1](stories/7.1.story.md) through [Story 7.12](stories/7.12.story.md)
- [Story 8.1](stories/8.1.story.md) - [Story 8.2](stories/8.2.story.md) - [Story 8.3](stories/8.3.story.md)

### Notable Story Documentation
- [Story 7.5 Deployment Summary](stories/7.5.DEPLOYMENT_SUMMARY.md)
- [Story 7.5 Role Alignment Verification](stories/7.5.ROLE_ALIGNMENT_VERIFICATION.md) ⚠️ *Note: Uses legacy role names*
- [Story 7.5 Auth Fix](stories/7.5.AUTH_FIX.md)
- [Story 7.5 Task 7 Progress](stories/7.5.TASK_7_PROGRESS.md)
- [Client Scoping HR Manager](stories/client-scoping-hr-manager.story.md)

## 🔧 Integration Documentation

### TMF Integration
- [TMF Integration README](TMF-integration/TMFNUI_INTEGRATION_README.md)
- [TMF Integration POC](TMF-integration/TMFNUI_INTEGRATION_POC.md)
- [TMF Integration Quick Start](TMF-integration/TMFNUI_INTEGRATION_QUICK_START.md)
- [TMF Integration Tracker](TMF-integration/TMFNUI_INTEGRATION_TRACKER.md)
- [TMF API Documentation](TMF-integration/TMFNUI_API_DOCUMENTATION.md)
- [Azure Connectivity Test Results](TMF-integration/AZURE_CONNECTIVITY_TEST_RESULTS.md)
- [Azure Integration Update](TMF-integration/TMFNUI_INTEGRATION_AZURE_UPDATE.md)
- [Phase 1 Completion Summary](TMF-integration/PHASE1_COMPLETION_SUMMARY.md)

## 🔒 Security & Compliance

- [GDPR PII Implementation Plan](GDPR_PII_IMPLEMENTATION_PLAN.md)
- [Team Connect OAuth Setup](TEAM_CONNECT_OAUTH_SETUP.md)

## 🐛 Debugging & Troubleshooting

- [Payroll Config Diagnosis](debugging/payroll-config-diagnosis.md)

## 📦 Archive

Older documentation that may not reflect current implementation:

### Archived PRD Sections
- [Epic 6: System Administration (Old)](prd/archive/epic-6-system-administration-old.md)
- [Epic 3: Advanced User Operations](prd/archive/epic-3-advanced-user-operations.md)
- [Epic 2: Core Data Management](prd/archive/epic-2-core-data-management.md)
- [Users & Roles](prd/archive/4-users-roles.md) ⚠️ *Outdated - see current Organization Management docs*

### Archived Stories
Located in `stories/archive/` - includes stories 1.1-1.4, 2.1-2.2, 3.1-3.5

### Archived Architecture
Located in `architecture/archive/` - includes legacy architecture documentation

## 🔄 Change Management

### Recent Changes
- **November 22, 2025**: Organization and role system refactoring
  - Replaced separate "Internal Users" tool with Teamified organization
  - Renamed `internal_member` → `internal_employee`
  - Added organization-based role validation
  - See [November 2025 Changelog](CHANGELOG_NOVEMBER_2025.md) for complete details

### Version History
| Date | Version | Description |
|------|---------|-------------|
| 2025-11-22 | 2.0 | Organization and role system refactor |
| 2024-12-19 | 1.0 | Initial platform documentation |

## 📝 Documentation Guidelines

When updating documentation:
1. Update version numbers and dates
2. Add entries to relevant changelog
3. Update this index if adding new documents
4. Cross-reference related documentation
5. Mark outdated information with ⚠️ warnings

## 🆘 Getting Help

For questions about:
- **Organization & Roles**: See [Organization Management Documentation](ORGANIZATION_MANAGEMENT_AND_ROLES.md)
- **API Usage**: See [API Specifications](architecture/api-specifications.md)
- **Development Setup**: See [Main README](../README.md)
- **Testing**: See [Testing Documentation](#-testing-documentation)

---

*This index is maintained by the Teamified development team. Last major update: November 22, 2025*
