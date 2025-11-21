reso# Epic 2 — Profile & CV Management - Brownfield Enhancement

## Epic Goal

Enable authenticated EOR users to complete, view, and update their professional profiles and CV information, building on the existing authentication system to provide the foundational data management required for all EOR operations.

## Epic Description

**Existing System Context:**

- Current relevant functionality: User authentication system with JWT tokens, user accounts with basic fields (name, email, role), audit logging system, and established REST API patterns
- Technology stack: NestJS, TypeScript, PostgreSQL, Redis, JWT authentication, class-validator DTOs, OpenAPI documentation
- Integration points: Existing User entity, authentication guards, audit logging service, role-based access control

**Enhancement Details:**

- What's being added/changed: Complete EORProfile entity implementation with comprehensive professional information, CV data management, profile completion workflow, and self-service profile updates
- How it integrates: Extends existing User entity with 1:1 EORProfile relationship, uses established auth guards, follows existing API patterns, integrates with audit logging
- Success criteria: EOR users can complete mandatory profile setup, view/edit their professional information, upload/manage CV documents, and track profile completion status

## Stories

1. **Story 2.1:** EOR Profile Entity & Database Schema ✅ **COMPLETED**
   - As a system, I need comprehensive EOR profile data structures to store professional information and CV details

2. **Story 2.2:** Comprehensive Profile Fields Implementation 🔄 **BACKEND COMPLETED**
   - As a system administrator, I want to store comprehensive profile information for EOR employees including personal details, government IDs, emergency contacts, and banking information, so that we can maintain complete employee records for legal compliance, EOR operations, and client management

3. **Story 2.3:** Profile Completion Workflow ⏳ **PENDING**
   - As an EOR user, I want to complete my mandatory profile information so that I can access all portal features

4. **Story 2.4:** Profile Management & Self-Service Updates ⏳ **PENDING**
   - As an EOR user, I want to view and update my profile information and CV details so that I can keep my professional data current

5. **Story 2.5:** CV Upload and Management ✅ **COMPLETED**
   - As an EOR, I want to upload and manage my CV, so that I can maintain current professional information for potential client assignments and keep version history for reference

## Compatibility Requirements

- [x] Existing APIs remain unchanged (authentication endpoints preserved)
- [x] Database schema changes are backward compatible (extends existing User entity)
- [x] UI changes follow existing patterns (consistent with invitation/auth flows)
- [x] Performance impact is minimal (leverages existing JWT and database infrastructure)

## Risk Mitigation

- **Primary Risk:** Profile data requirements blocking existing authentication flow or creating data inconsistencies
- **Mitigation:** Optional profile completion initially, backward compatible schema changes, comprehensive validation, existing user accounts remain functional
- **Rollback Plan:** Database migrations are backward compatible; profile endpoints can be disabled; existing authentication and user management remains functional

## Definition of Done

- [x] Core profile entity and database schema implemented (Story 2.1)
- [x] CV upload and management functionality completed (Story 2.5)
- [X] Comprehensive profile fields implementation (Story 2.2) - Backend completed, frontend pending
- [ ] Profile completion workflow (Story 2.3)
- [ ] Profile management and self-service updates (Story 2.4)
- [x] Existing functionality verified through testing (authentication and user management still works)
- [x] Integration points working correctly (audit logging, role-based access, JWT authentication)
- [x] Documentation updated appropriately (API docs, database schema)
- [x] No regression in existing features (invitation flow, authentication, user session management)

## Dependencies

**Prerequisites:**
- ✅ Story 1.1: EOR Invitation Creation (completed)
- ✅ Story 1.2: Invitation Acceptance & Password Setup (completed)
- 🟡 Story 1.3: Authentication System Implementation (draft - should complete first)
- 🟡 Story 1.4: Email Verification & Profile Completion Prompt (draft - can run in parallel)

**Enables:**
- Epic 3: Timesheet Management (requires profile data for time tracking)
- Epic 4: Leave Management (requires profile data for leave policies)
- Epic 5: Document Management (requires profile data for document association)
- Epic 6: Client Assignment (requires complete EOR profiles)

## Technical Architecture Alignment

**Database Schema Extensions:**
- EORProfile entity: Personal details, professional information, CV data, skills, certifications
- ProfileCompletion tracking: Required fields checklist, completion percentage
- Document entity extension: CV file upload and management

**API Endpoints:**
- GET /v1/users/me/profile
- PATCH /v1/users/me/profile
- POST /v1/users/me/profile/complete
- GET /v1/users/me/profile/completion-status
- POST /v1/users/me/cv (file upload)
- GET /v1/users/me/cv
- DELETE /v1/users/me/cv

**Data Management:**
- Profile validation rules based on country requirements
- File upload handling for CV documents (PDF, DOC)
- Profile completion tracking and notifications
- Audit logging for all profile changes

## Integration Points

**Existing Systems:**
- User Management: Extends User entity with EORProfile relationship
- Authentication: Uses existing JWT guards for protected endpoints
- Audit Service: Logs profile changes and completion events
- Role-Based Access: Enforces EOR role for profile access

**New Components:**
- Profile Service: Manages EOR profile data and validation
- Profile Controller: REST endpoints for profile management
- CV Upload Service: Handles document upload and storage
- Profile Completion Service: Tracks mandatory field completion

## Success Metrics

- Profile completion rate > 90% within 30 days of account activation
- Profile update frequency demonstrates active user engagement
- Zero data corruption or loss during profile operations
- < 200ms response time for profile retrieval endpoints
- Complete audit trail for all profile modifications

## Story Handoff Notes

**For Story Manager:**

This epic builds directly on the completed authentication system (Stories 1.1-1.2) and follows established patterns:

- **Integration Points:** Existing User entity (1:1 with EORProfile), JWT authentication system, audit logging service, established REST API patterns, role-based access controls
- **Existing Patterns:** class-validator DTOs, OpenAPI documentation, comprehensive unit testing, NestJS modular architecture, PostgreSQL entity relationships, file upload handling patterns
- **Critical Requirements:** Preserve existing user authentication, maintain audit log format, follow established API design (REST v1 with RFC 7807 errors), ensure backward compatibility with existing User entity
- **Verification:** Each story must include regression testing to ensure existing functionality (authentication, user management, invitation flow) remains intact

The epic establishes the foundational data layer required for all subsequent EOR operations (timesheets, leave, assignments) while providing immediate value through professional profile management.

---

**Created:** 2025-08-28  
**Status:** Ready for Story Development  
**Epic Owner:** Sarah (Product Owner)  
**Priority:** High (Foundation for all EOR operations)  
**Estimated Stories:** 3  
**Epic Dependencies:** Stories 1.1-1.2 (Complete), Story 1.3 (Should complete first)  