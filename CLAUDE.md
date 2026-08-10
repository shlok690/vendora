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

**Role-based auth model** ([src/context/AuthContext.tsx](src/context/AuthContext.tsx)): `AuthProvider` wraps the whole app in [src/App.tsx](src/App.tsx). Users have one of two roles — `'vendor' | 'customer'` — stored in a Firestore doc at `users/{uid}` and mirrored into `localStorage` (`user_role_{uid}`, `user_profile_{uid}`) as an offline/slow-network fallback. Role reads race Firestore against a 10s timeout (`withTimeout`) and fall back to the local cache if Firestore doesn't answer in time; role writes go to Firestore in the background (fire-and-forget) unless `saveUserRole(..., awaitFirestore=true)` is passed, which registration/login flows do.

**Route gating** ([src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx)): wraps protected routes with an `allowedRoles` prop; redirects to `/login` if unauthenticated, or to a role's home (`/seller-dashboard` for vendor, `/buyer-dashboard` for customer) if the current role isn't in `allowedRoles`.

**Routes** ([src/App.tsx](src/App.tsx)):
- Public: `/` (LandingPage), `/login`, `/register` (role picker), `/register/seller|buyer`
- Protected: `/seller-dashboard` (vendor → VendorOnboardingPage), `/buyer-dashboard` (customer → CustomerExplorePage)
- Legacy redirects: `/register/user` → `/register/buyer`, `/login/user` → `/login`

There is no admin role or admin dashboard — an earlier three-role (`admin | vendor | customer`) version of the app existed with a client-side-passcode-gated `/register/admin` route and a placeholder `/admin-dashboard`, but the admin branch was fully removed (type, routes, passcode UI, redirects) since there was never a real admin panel behind it.

## Known inconsistencies to be aware of

The product is branded **"Vendora"** (a local vendor/customer marketplace — see `index.html` and the Login/Register pages) but the repo still reflects an earlier **"society management"** concept in a couple of orphaned files:

- [src/pages/Dashboard/UserDashboardPage.tsx](src/pages/Dashboard/UserDashboardPage.tsx) and [src/pages/Dashboard/DashboardPage.tsx](src/pages/Dashboard/DashboardPage.tsx) still contain society-management copy/mock data and are not referenced by any route in `App.tsx`.

**Firebase config duplication**: there are three near-identical Firebase init files — [src/firebase.ts](src/firebase.ts), [src/firebase.js](src/firebase.js), and [src/firebase/firebase.ts](src/firebase/firebase.ts) — plus a hand-written [src/firebase.d.ts](src/firebase.d.ts) ambient declaration. All app code imports from `'../firebase'` (or `'../../firebase'`), which is ambiguous between the `.ts` and `.js` sibling files; `src/firebase/firebase.ts` is not imported anywhere and is dead code. If you touch Firebase init, update all copies or consolidate them, and check which file Vite is actually resolving. All three hardcode a real-looking Firebase API key/project config as a fallback default when `VITE_FIREBASE_*` env vars are unset.
