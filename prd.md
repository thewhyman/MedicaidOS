# Scope
This is a Medicaid financial operating system for grant-dependent organizations. This web app is for a grant manager or finance director at a nonprofit or healthcare org drowning in manual work — tracking multiple grants with different reporting requirements, budget allocations, compliance deadlines, manual data entry across spreadsheets, reconciliation between grant rules and actual spend. 

This will be a SaaS app with a subscription model. Users belonging to the same organization will be able to access the app and the data related to that organization, ensuring strict data isolation.

## User Personas
### 1. Finance Director (The Auditor)
- **Pain Points**: Errors in reconciliation, missing compliance deadlines, difficulty in multi-grant reporting.
- **Goals**: High-level financial health oversight, automated audit trails, accurate forecasting.

### 2. Grant Manager (The Executor)
- **Pain Points**: Manual data entry, tracking complex funder requirements, finding new funding sources.
- **Goals**: Real-time spend tracking, AI-assisted grant matching, easy report generation.

### 3. Compliance Officer (The Gatekeeper)
- **Pain Points**: Keeping up with changing state/federal regulations, document management.
- **Goals**: Automated compliance checks, centralized document repository, risk mitigation.

## Features
### 1. Grant Management
- Centralized database for all active and historical grants.
- Document storage for grant agreements and funder communications.
- AI-powered grant matching to discover new funding opportunities based on organizational profile.
- Ability to import grants from CSV files. Check for duplicates before importing.
- Add ability to delete or edit grants.
- Add ability to add grants manually.


### 2. Budget Management
- Multi-dimensional budget tracking (by grant, by department, by category).
- Real-time expenditure vs. allocation visualization.
- Automated reconciliation of transactions from CSV uploads or accounting integrations.

### 3. Compliance Management
- Dynamic checklist for grant-specific requirements.
- AI-driven "Policy Scan" that reads grant agreements and extracts reporting dates/conditions.
- Alert system for upcoming deadlines and potential risk areas.

### 4. Reporting & Analytics
- Executive dashboard with key financial health metrics.
- One-click export of data to PDF (Audit ready) and Excel (Data analysis).
- Customizable report builders for specific funder formats.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS.
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage).
- **Visualization**: Recharts.
- **AI**: OpenAI API (GPT-4o) for document analysis and matching.

## UI/UX Principles
- **Premium Material Design**: Transparent glassmorphic effects, subtle shadows, and high-contrast typography.
- **Responsiveness**: Full functionality on Desktop, Tablet, and Mobile.
- **Accessibility**: Compliance with WCAG 2.1 standards for healthcare accessibility.

## Security & Privacy
- **Tenancy**: Row Level Security (RLS) in PostgreSQL to ensure no cross-org data leaks.
- **Encryption**: AES-256 for data at rest, TLS 1.3 for data in transit.

## Roadmap & Success Metrics
- **Phase 1 (MVP)**: Core management modules, basic AI matching, and CSV exports. (Current)
- **Phase 2**: Direct accounting software integrations (QuickBooks, Sage), advanced AI compliance scanning.
- **Phase 3**: Predictive financial forecasting, expanded marketplace for grant writers.

## Testing & Verification
- Automated unit and integration tests for core logic.
- Browser-based end-to-end testing for critical flows (Login -> Manage Grant -> Export).
- Manual verification of AI output accuracy.

## Architectural Principles
- Testability
- Maintainability
- Security
- Production Ready

## Docs to maintain
- `BUILD_LOG.md`: Chronological tracking of build progress.
- `DECISIONS.md`: Log of architectural and design choices.
- `AI_REFLECTION.md`: Documentation of AI-assisted development and feature logic.

