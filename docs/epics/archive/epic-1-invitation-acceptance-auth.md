# Epic 1 — Invitation Acceptance & Authentication - Brownfield Enhancement

## Epic Goal

Enable invited users to accept invitations, set up secure authentication, and complete their initial profile setup, building on the existing invitation creation system to complete the onboarding flow.

## Epic Description

**Existing System Context:**

- Current relevant functionality: Invitation creation and sending system with secure tokens, audit logging, and database schema for users, invitations, and clients
- Technology stack: NestJS, TypeScript, PostgreSQL, Redis, email service, Argon2 password hashing, JWT tokens
- Integration points: Existing User, Invitation, and AuditLog entities; email service; authentication guards and decorators

**Enhancement Details:**

- What's being added/changed: Complete the invitation acceptance flow by adding token validation, password setup, email verification, and initial authentication system
- How it integrates: Extends existing invitation system, uses established User entity, integrates with existing audit logging
- Success criteria: Invited users can successfully accept invitations, set passwords meeting security policy, verify email addresses, and sign in to access the portal

## Stories

1. **Story 1.1:** EOR Invitation Creation
   - As an Ops Admin, I want to invite a new EOR via email, so that they can access the portal

2. **Story 1.2:** Invitation Acceptance & Password Setup
   - As an invited user, I can click the invitation link, validate the token, set a secure password, and activate my account
   
3. **Story 1.3:** Authentication System Implementation  
   - As a user, I can sign in with email/password and receive JWT tokens for secure API access
   
4. **Story 1.4:** Email Verification & Profile Completion Prompt
   - As a newly registered user, I can verify my email address and be prompted to complete my profile information

## Compatibility Requirements

- [x] Existing APIs remain unchanged (invitation creation endpoints preserved)
- [x] Database schema changes are backward compatible (extends existing User and Invitation entities)
- [x] UI changes follow existing patterns (consistent with invitation email templates)
- [x] Performance impact is minimal (leverages existing JWT and Redis infrastructure)

## Risk Mitigation

- **Primary Risk:** Authentication implementation introducing security vulnerabilities or breaking existing invitation flow
- **Mitigation:** Follow established security patterns from architecture (Argon2, JWT, OWASP ASVS), comprehensive testing of token validation, gradual rollout
- **Rollback Plan:** Database migrations are backward compatible; new endpoints can be disabled; existing invitation creation remains functional

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Existing functionality verified through testing (invitation creation still works)
- [x] Integration points working correctly (audit logging, email service, database consistency)
- [x] Documentation updated appropriately (API docs, environment variables)
- [x] No regression in existing features (invitation creation, email sending, audit logs)

## Dependencies

**Prerequisites:**
- ✅ Story 1.1: EOR Invitation Creation (completed)

**Enables:**
- Epic 2: Profile & CV Management
- Epic C: Timesheets
- Epic D: Leave Management
- Epic E: Documents
- Epic F: Client Assignment
- Epic G: Reporting & Exports

## Technical Architecture Alignment

**Database Schema Extensions:**
- User entity: Add password reset fields, email verification status
- Session entity: JWT refresh token management
- Invitation entity: Add acceptance tracking fields

**API Endpoints:**
- POST /v1/auth/accept-invitation
- POST /v1/auth/login
- POST /v1/auth/refresh
- POST /v1/auth/logout
- POST /v1/auth/verify-email
- GET /v1/users/me

**Security Implementation:**
- Argon2id password hashing
- JWT access tokens (15 min expiry)
- JWT refresh tokens (30 days with rotation)
- Email verification flow
- Password complexity validation
- Rate limiting on auth endpoints

## Integration Points

**Existing Systems:**
- Invitation Service: Token validation and acceptance
- Email Service: Verification emails and notifications
- Audit Service: Authentication events logging
- User Management: Profile initialization

**New Components:**
- Authentication Service: Login/logout/token management
- Password Service: Hashing and validation
- Session Service: JWT and refresh token management
- Authorization Guards: Protected route enforcement

## Success Metrics

- Invitation acceptance rate > 95%
- Authentication security compliance (OWASP ASVS Level 2)
- Zero security vulnerabilities in auth flow
- < 500ms response time for login endpoints
- Complete audit trail for all authentication events

## Story Handoff Notes

**For Story Manager:**

This epic builds directly on the completed invitation system (Story 1.1) and follows established patterns:

- **Integration Points:** Existing User/Invitation entities, JWT auth system, email service, audit logging service, established database schema
- **Existing Patterns:** Argon2 password hashing, JWT tokens (15min + 30day refresh), audit logging for all actions, class-validator DTOs, OpenAPI documentation, comprehensive unit testing
- **Critical Requirements:** Preserve existing invitation creation API, maintain audit log format, follow established entity relationships, maintain database backward compatibility
- **Verification:** Each story must include regression testing to ensure existing functionality (invitation creation, email sending, audit logging) remains intact

The epic enables the complete onboarding flow and establishes the authentication foundation required for all subsequent user-facing features in the EOR Portal.

---

**Created:** 2025-08-28  
**Status:** Complete  
**Epic Owner:** Sarah (Product Owner)  
**Priority:** High (Blocks all user-facing functionality)  
**Estimated Stories:** 4  
**Epic Dependencies:** Story 1.1 (Complete)  