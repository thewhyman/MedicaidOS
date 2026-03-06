# MedicaidOS

MedicaidOS is a premium financial operating system and SaaS platform designed specifically for healthcare nonprofits and grant-dependent organizations. It streamlines the grant lifecycle, automates budget tracking, and ensures strict compliance with real-time analytics and AI-powered insights.

---

## 🚀 Features

### 1. Grant Management
- **Centralized Database**: Track active and historical grants in one place.
- **AI Matching**: Discover new funding opportunities based on your organizational profile (90%+ accuracy).
- **Document Storage**: Centralized repository for grant agreements and funder communications.

### 2. Budget Management
- **Multi-Dimensional Tracking**: Track spend by grant, department, or custom categories.
- **Real-time Visualization**: Interactive charts for expenditure vs. allocation using Recharts.
- **Automated Reconciliation**: Easy CSV imports for transaction matching.

### 3. Compliance Management
- **Dynamic Checklists**: Grant-specific tracking of requirements and deadlines.
- **AI Policy Scan**: Automate extraction of reporting conditions from complex grant documents.
- **Deadline Alerts**: Proactive notifications for upcoming compliance milestones.

### 4. Premium Dashboard
- **Executive Oversight**: High-level financial health metrics at a glance.
- **Reporting**: One-click exports to PDF (Audit-ready) and Excel.

---

## 🛠 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **AI**: [OpenAI API](https://openai.com/api/) (GPT-4o)
- **Visualization**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Integration), [Playwright](https://playwright.dev/) (E2E)

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (Latest LTS)
- Supabase Project
- OpenAI API Key

### 2. Environment Variables
Create a `.env.local` file in the root directory (refer to [.env.example](.env.example)):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Installation
```bash
npm install
```

### 4. Database Setup
Apply migrations and seed data:
```bash
# Run Supabase migrations
npx supabase migration up

# Seed initial test data
node scripts/seed.js
```

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧪 Testing

We maintain a high-quality codebase with dual-layered testing:

```bash
# Run Unit & Integration tests (Vitest)
npm run test

# Run End-to-End tests (Playwright)
npm run test:e2e
```

---

## 🌐 Deployment

### Deploy to Vercel
1.  Connect your GitHub repository to [Vercel](https://vercel.com/new).
2.  Add your environment variables in the Vercel Project Settings.
3.  Click **Deploy**.

The `(dashboard)` route group structure ensures a persistent sidebar and premium layout across all authenticated views.

---

## 📄 License

This project is private and proprietary.
