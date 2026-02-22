# PROJECT PLAN: Mercadinho Connect (Zap Ofertas)

## 1. Overview
Mobile-first web application designed to help small shop owners create professional "Offer Showcases" quickly and share them via WhatsApp. Solves the pain point of spamming customers with multiple photos by consolidating daily offers into a single, shareable link.

- **Primary Goal:** Simplify the "photo-to-whatsapp" workflow.
- **Key Metric:** Time to create and share an offer < 30 seconds.
- **Target Audience:** Non-technical small business owners (Mobile users).

## 2. Project Type
**WEB** (Mobile-First PWA)
- Primary Agent: `frontend-specialist` (UI/UX)
- Backend Agent: `backend-specialist` (API/DB)

## 3. Success Criteria
- [ ] User can take a photo, add price/name, and save.
- [ ] Public "Showcase Page" renders all active offers correctly on mobile.
- [ ] "Share on WhatsApp" button opens WhatsApp with pre-filled link + text.
- [ ] Phase X verification scripts pass (Security, UX, Lighthouse).

## 4. Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Shadcn/UI (Mobile-first components).
- **Backend/DB:** Supabase (Auth, Postgres, Storage for images).
- **State:** React Query (TanStack Query) for async state.
- **Validation:** Zod + React Hook Form.
- **Hosting:** Vercel (Frontend) + Supabase (Backend).

## 5. File Structure
```
mercadinho-connect/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx       # Owner login
│   │   ├── (dashboard)/admin/page.tsx  # Offer management
│   │   ├── (public)/[storeSlug]/page.tsx # Public showcase
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                         # Shadcn primitives
│   │   ├── offers/                     # OfferCard, OfferForm
│   │   └── layout/                     # MobileHeader, BottomNav
│   ├── lib/
│   │   ├── supabase/                   # Client & Server clients
│   │   ├── utils.ts
│   │   └── types.ts
│   └── actions/                        # Server Actions (CRUD)
├── public/
├── .agent/                             # Antigravity Kit
├── next.config.mjs
└── tailwind.config.ts
```

## 6. Task Breakdown

### Phase 1: Foundation (Setup)
- [ ] **Task 1.1: Initialize Next.js Project** (`orchestrator`)
    - **Skill:** `app-builder`
    - **Input:** `npx create-next-app`
    - **Output:** Running Next.js app with Tailwind.
    - **Verify:** `npm run dev` opens default page.

- [ ] **Task 1.2: Supabase Setup** (`backend-specialist`)
    - **Skill:** `database-design`
    - **Input:** Create Supabase project, define `offers` table schema (id, photo_url, price, title, active).
    - **Output:** Connection string in `.env.local` + Migration file.
    - **Verify:** Able to connect and select from table.

- [ ] **Task 1.3: Mobile UI Framework** (`frontend-specialist`)
    - **Skill:** `frontend-design` (Mobile-First)
    - **Input:** Install Shadcn/UI (Button, Card, Input, Drawer).
    - **Output:** UI components available in `src/components/ui`.
    - **Verify:** Storybook or test page rendering components.

### Phase 2: Core Features (The "Happy Path")
- [ ] **Task 2.1: Authentication (Simple)** (`security-auditor`)
    - **Skill:** `api-patterns`
    - **Input:** Implement Supabase Auth (Magic Link or Email/Pass).
    - **Output:** Protected `/admin` route.
    - **Verify:** Unauthenticated user redirects to login.

- [ ] **Task 2.2: Offer Management (CRUD)** (`frontend-specialist`)
    - **Skill:** `clean-code`
    - **Input:** Create "Add Offer" form (Camera access for photo upload to Supabase Storage).
    - **Output:** Working form that saves data + image.
    - **Verify:** Uploaded image appears in Supabase Storage bucket.

- [ ] **Task 2.3: Public Showcase Page** (`frontend-specialist`)
    - **Skill:** `seo-fundamentals`
    - **Input:** Create dynamic route `/[storeSlug]` fetching active offers.
    - **Output:** Mobile-optimized list of products.
    - **Verify:** Lighthouse Mobile score > 90.

- [ ] **Task 2.4: WhatsApp Integration** (`frontend-specialist`)
    - **Skill:** `brainstorming` (Copywriting)
    - **Input:** "Share" floating button generating `wa.me` link with text.
    - **Output:** Click opens WhatsApp with "🔥 Olha as ofertas: [Link]".
    - **Verify:** Manual click test on mobile device.

### Phase X: Final Verification
- [ ] **Security:** `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] **UX/Mobile:** `python .agent/skills/frontend-design/scripts/ux_audit.py .` (Focus on Touch Targets)
- [ ] **Performance:** `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py .`
- [ ] **Linting:** `npm run lint`

---
**Status:** 🟡 Ready for Approval.
