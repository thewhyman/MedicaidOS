# Test Plan - MedicaidOS

## Objective
To ensure the application is reliable, secure, and production-ready by verifying all core functional requirements and UI interactivity.

## Test Cases

### 1. Authentication & Security
- **TC-AUTH-01**: Successful Login with valid credentials.
- **TC-AUTH-02**: Failed Login with invalid credentials.
- **TC-AUTH-03**: Multi-tenancy Isolation (User A cannot see User B's grant data).
- **TC-AUTH-04**: Logout redirects to /login and clears session.

### 2. Dashboard Interactivity (Post-Fix)
- **TC-DASH-01**: StatCards navigate to respective modules (/grants, /budget, etc.).
- **TC-DASH-02**: Sidebar persists during internal navigation.
- **TC-DASH-03**: "Export Report" triggers a "sonner" toast notification.

### 3. Grant Management
- **TC-GRANT-01**: List all grants belonging to the user's organization.
- **TC-GRANT-02**: Search/Filter grants by title or funder.
- **TC-GRANT-03**: "Manage Grant" triggers a "sonner" toast.
- **TC-GRANT-04**: Sidebar stays visible on the Grants page.

### 4. Budget & Financials
- **TC-BUDG-01**: Switch between "Overview", "Reconciliation", and "History" tabs.
- **TC-BUDG-02**: "Import CSV" and "Add Expense" trigger "sonner" toasts.

### 5. Compliance & Reporting
- **TC-COMP-01**: "AI Compliance Scan" triggers a toast.
- **TC-REPO-01**: Report generation cards trigger toasts.
- **TC-REPO-02**: "Download" button in history triggers a toast.

## Execution Strategy
1. **Manual/Subagent Verification**: Use the browser tool to walk through these TCs.
2. **Automated Seeding**: Ensure the test org `Safe Net Health` exists with users `admin@safenet.org`.
3. **Bug Tracking**: Log any failures in the `BUILD_LOG.md`.
