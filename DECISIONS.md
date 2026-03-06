# Design Decisions - MedicaidOS

## Architecture
- **Framework**: Next.js 16+ (App Router) for modern server-side rendering and routing.
- **Backend**: Supabase for Auth, PostgreSQL, and RLS.
- **Styling**: Tailwind CSS with a custom glassmorphic design system.

## Security
- **RLS**: Row Level Security is the primary mechanism for multi-tenancy.
- **SSR**: Middleware handles session refreshment and server-side route protection.

## UI/UX
- **Premium Aesthetics**: High contrast, subtle gradients, and glassmorphism.
- **Component System**: Custom-built `Button`, `Input`, and `Card` components for consistency.
- **Data Viz**: Recharts chosen for its robust React integration and customizability.

## AI
- **Provider**: OpenAI (GPT-4o) selected for its advanced reasoning in grant matching and compliance checking.
- **Integration**: Decoupled AI utility layer for easy swap/expansion.
