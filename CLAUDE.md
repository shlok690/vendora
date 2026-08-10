# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev        # start Vite dev server
npm run build       # tsc -b (project-references type check) && vite build
npm run preview      # preview the production build locally
```

There is no lint script and no test framework configured in this repo — don't assume `npm test` or `npm run lint` exist.

Firebase config comes from `VITE_FIREBASE_*` env vars. Copy `.env.example` to `.env` and fill in values from the Firebase console before running `dev`/`build` (see Firebase config section below for what happens if you don't).

## Architecture

This is a client-only Vite + React 18 + TypeScript SPA with Firebase (Auth + Firestore) as the only backend — no server code in this repo. Routing is `react-router-dom` v6, mounted in [src/main.tsx](src/main.tsx) with `BrowserRouter`.

**Role-based auth model** ([src/context/AuthContext.tsx](src/context/AuthContext.tsx)): `AuthProvider` wraps the whole app in [src/App.tsx](src/App.tsx). Users have one of three roles — `'admin' | 'vendor' | 'customer'` — stored in a Firestore doc at `users/{uid}` and mirrored into `localStorage` (`user_role_{uid}`, `user_profile_{uid}`) as an offline/slow-network fallback. Role reads race Firestore against a 10s timeout (`withTimeout`) and fall back to the local cache if Firestore doesn't answer in time; role writes go to Firestore in the background (fire-and-forget) unless `saveUserRole(..., awaitFirestore=true)` is passed, which registration/login flows do.

**Route gating** ([src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)): wraps protected routes with an `allowedRoles` prop; redirects to `/login` if unauthenticated, or to a role's home if the current role isn't in `allowedRoles`.

**Routes** ([src/App.tsx](src/App.tsx)):
- Public: `/` (LandingPage), `/login`, `/register` (role picker), `/register/seller|buyer|admin`
- Protected: `/seller-dashboard` (vendor → VendorOnboardingPage), `/buyer-dashboard` (customer → CustomerExplorePage), `/admin-dashboard` (admin → AdminDashboardPage)
- Legacy redirects: `/register/user` → `/register/buyer`, `/login/admin` and `/login/user` → `/login`

Admin registration is gated client-side by a hardcoded passcode (`'ADMIN123'` in [src/pages/Register/RegisterPage.tsx](src/pages/Register/RegisterPage.tsx)) — this is not a real security boundary since it ships in the client bundle.

## Known inconsistencies to be aware of

The product is branded **"Vendora"** (a local vendor/customer marketplace — see `index.html` and the Login/Register pages) but the repo, and some older dashboard pages, still reflect an earlier **"society management"** concept (residents, maintenance dues, visitor passes, flat numbers). Concretely:

- [src/pages/Dashboard/AdminDashboardPage.tsx](src/pages/Dashboard/AdminDashboardPage.tsx) (routed at `/admin-dashboard`) and [src/pages/Dashboard/UserDashboardPage.tsx](src/pages/Dashboard/UserDashboardPage.tsx) (not routed anywhere) still contain society-management copy and mock data, unrelated to the vendor/customer marketplace flow used elsewhere.
- [src/pages/Dashboard/UserDashboardPage.tsx](src/pages/Dashboard/UserDashboardPage.tsx) and [src/pages/Dashboard/DashboardPage.tsx](src/pages/Dashboard/DashboardPage.tsx) are orphaned — not referenced by any route in `App.tsx`.
- `AdminDashboardPage`'s "switch to resident view" button calls `switchRole('user')`, but `UserRole` only permits `'admin' | 'vendor' | 'customer'` — `'user'` is not a valid role.
- `ProtectedRoute` redirects role-mismatched users to `/user-dashboard`, which is not a route defined in `App.tsx` (only `/admin-dashboard`, `/seller-dashboard`, `/buyer-dashboard` exist) — this redirect currently dead-ends.

**Firebase config duplication**: there are three near-identical Firebase init files — [src/firebase.ts](src/firebase.ts), [src/firebase.js](src/firebase.js), and [src/firebase/firebase.ts](src/firebase/firebase.ts) — plus a hand-written [src/firebase.d.ts](src/firebase.d.ts) ambient declaration. All app code imports from `'../firebase'` (or `'../../firebase'`), which is ambiguous between the `.ts` and `.js` sibling files; `src/firebase/firebase.ts` is not imported anywhere and is dead code. If you touch Firebase init, update all copies or consolidate them, and check which file Vite is actually resolving. All three hardcode a real-looking Firebase API key/project config as a fallback default when `VITE_FIREBASE_*` env vars are unset.

`.vendora-history-copy/` at the repo root (untracked, full of hash-named directories) is editor/tool-generated backup state, not part of the application — ignore it when exploring the codebase.
