# Release Notes v1.1.0

**Release Date:** January 13, 2026  
**Read Time:** ~2 minutes

---

## Overview

Version 1.1.0 brings significant enhancements to the Teamified Accounts & SSO Platform, focusing on a smarter business signup experience, unified email branding, and improved password recovery flows.

---

## What's New

### AI-Powered Business Signup

We've made signing up for a business account faster and smarter:

- **Automatic Business Description Generation** — When you enter your company's website URL, our AI automatically analyzes your site and generates a professional business description. The field remains fully editable, so you can refine or replace the text as needed.
- **Smart URL Handling** — URLs are automatically normalized (adding `https://` when needed) for seamless analysis.
- **Clear Feedback** — A loading indicator shows while AI is analyzing, and helpful messages appear if the analysis can't complete.

### Unified Email Experience

All transactional emails now share a consistent, professional design:

- **Refreshed Email Templates** — Email Verification, Password Reset OTP, and Welcome emails now feature a cohesive purple gradient header matching the Teamified brand.
- **Personalized Greetings** — Business users see their company name, while job seekers see their first name in email greetings.
- **Role-Based CTAs** — Welcome emails now include tailored call-to-action buttons based on user type (e.g., "Post Your First Job" for businesses, "Browse Jobs" for candidates).

### Password Reset Improvements

- **OTP-Based Verification** — A secure 3-step password reset flow using one-time passcodes sent via email.
- **Consistent Styling** — Password reset emails now match the unified design system.

### UI/UX Refinements

- **Email Verification Page** — Streamlined success and error states with improved messaging and properly styled action buttons.
- **Design System Compliance** — All buttons and UI elements now consistently follow the Teamified design guide with the signature purple (#9333EA) primary color.

---

## Technical Highlights

- Frontend built with React 19, TypeScript, and Vite
- Design system powered by Radix UI primitives with Tailwind CSS
- Backend running NestJS with JWT authentication
- OpenAI integration for intelligent website analysis

---

## Getting Started

These updates are live and require no action from existing users. New business signups will automatically benefit from the AI-powered description generation.

---

*Thank you for using Teamified. We're committed to making your hiring experience seamless and efficient.*
