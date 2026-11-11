# EGIRE Robotics Android app: system design (draft 1)

Date: 2026-11-10. Status: for review. Nothing is built yet. Do's and don'ts will be added after you read this.

## 1. What we want

One Android app that contains the three web projects:

| Project | What it is | Where it lives |
|---|---|---|
| **Website + Academy** | egirerobotics.com: programs, Physics labs, Wiring Lab, blog, sign-in, enquiries | `OpenFPV_vercel_version/OpenFPV_Pilot` (Vite, React 19, three.js, React Flow, Supabase) |
| **CRM / LMS** | crm.egirerobotics.com: students, exams, certificates, enquiries, admin tools | `computer_vison/fpv-crm` (Vite, React 19, TypeScript, Tailwind, Supabase + Edge Functions) |
| **Electronics Atlas** | Interactive knowledge graph from physics to flight controllers | `EgireRobotics_Basics_of_Electronics_Research_Knowledge_Graphs` (package name `egire-electronics-atlas`; Vite, React 19, d3, KaTeX, no backend) |

Goals: one install, under 100 MB, fast on cheap phones, works offline where it makes sense, reuses the existing code and the existing Supabase project, one sign-in for all three.

Not goals (for now): iOS, rewriting the apps in native Kotlin, a new backend.

## 2. Is it possible?

**Yes.** All three projects are web apps built with the same tools (Vite, React 19). The two big costs, a native rewrite and a new backend, are avoided by running the existing web apps inside one Android shell.

**100 MB: yes, with margin, but only after one clean-up.** Measured today:

| Part | Built size now | Main weight |
|---|---|---|
| Website (`dist`) | **175 MB** | `public/images` 131 MB (37 physics tutorial files, 64 MB; 66 PNG part photos, 61 MB), gallery 25 MB, videos 8 MB, PDF brochures 2.5 MB |
| Website JavaScript | 4.4 MB | three.js, drei, React Flow, framer-motion |
| CRM (`dist`) | 2.9 MB | JavaScript only, no heavy media |
| Atlas (`dist`) | 7.5 MB | 4.6 MB of board photos (JPEG), 1.1 MB of lessons |

So the website's raw images are the only thing that threatens the limit. They are oversized originals, not content that needs 131 MB. Estimated app size after the clean-up in section 8: **about 25 to 40 MB installed APK, and a smaller download from Google Play** (these are estimates; the first build in phase 1 gives the real number).

## 3. Options compared

| Option | Size | Effort | Offline | Verdict |
|---|---|---|---|---|
| **A. Capacitor shell with the three web apps bundled inside** | 25 to 40 MB | Low to medium | Yes | **Recommended** |
| B. Trusted Web Activity / PWA (just opens the live sites) | 2 to 5 MB | Lowest | Weak | Too thin: Play may reject it, and no offline Atlas |
| C. Native Kotlin / Compose rewrite | 15 to 30 MB | Very high (months, three apps) | Yes | Not worth it now |
| D. React Native rewrite | 25 to 35 MB | High | Yes | Same rewrite cost as C, no real gain |

Decision: **A**. Capacitor wraps the apps we already have, adds native features (push, biometrics, files, QR scanning), and lets us keep one codebase for web and Android.

## 4. Architecture

```
+-------------------------------------------------------------+
|                 Android app (Capacitor shell)               |
|  Kotlin: MainActivity, deep links, push (FCM), secure store |
|                                                             |
|   Native plugins: Push, Browser (Custom Tabs for Google),   |
|   Biometric, Filesystem/Share, Camera (QR), App (links)     |
|                                                             |
|   +-----------------------------------------------------+   |
|   |        One WebView, one origin (https://localhost)   |   |
|   |                                                     |   |
|   |   /            Launcher shell (tabs, role-aware)    |   |
|   |   /web/*       Website + Academy      (module 1)    |   |
|   |   /crm/*       CRM / LMS              (module 2)    |   |
|   |   /atlas/*     Electronics Atlas      (module 3)    |   |
|   |                                                     |   |
|   |   Shared package: auth client, API client, theme,   |   |
|   |   analytics, error reporting                        |   |
|   +-----------------------------------------------------+   |
+---------------------------+---------------------------------+
                            | HTTPS
                +-----------v-----------+      +----------------------+
                |  Supabase project     |      | Voice agent (Vercel) |
                |  egirerobotics-lms    |      | optional, online     |
                |  Auth, Postgres+RLS,  |      +----------------------+
                |  Storage, Edge Funcs  |
                +-----------------------+
```

Key points:

1. **One WebView, one origin, three route prefixes.** Each project is built with its own `base` path (`/web/`, `/crm/`, `/atlas/`), so they share storage and one sign-in session, and do not clash.
2. **A small launcher shell** (new, about 20 KB) holds the bottom navigation: Home, Learn (Academy), Atlas, and CRM (visible only to approved accounts). It lazy-loads a module only when opened, so start-up stays fast.
3. **No new backend.** Every module keeps talking to the same Supabase project. The app only changes where the front-end files come from (inside the app, not the web).
4. **Shared package `@egire/app-core`**: the Supabase client, session handling, theme tokens, error reporting. The website and CRM each have their own copy today; the shell gives them one.
5. **Platform adapters** (`isNative`) wrap the few places the web apps behave differently inside an app: opening links, downloading a certificate, the Google sign-in, the share button.

## 5. Who sees what

The website already has members and an admin-approved CRM request. The app follows the same rules:

| Account | Website + Academy | Atlas | CRM |
|---|---|---|---|
| Visitor (not signed in) | Public pages only | Yes (no sign-in needed) | No |
| Member (signed in) | Yes, including Physics and Wiring Lab | Yes | Hidden |
| Member with CRM access approved by an admin | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes, with admin tools |

All real permission checks stay on the server (Supabase RLS and Edge Functions). Hiding the CRM tab is only a convenience: the CRM front-end code is already public on crm.egirerobotics.com, so shipping it in the app exposes nothing new.

## 6. Sign-in

- **Email and password / email codes:** work as they do on the web, inside the WebView.
- **Google sign-in:** Google blocks sign-in inside an embedded WebView. So the app opens Google in the system browser (Chrome Custom Tab), and Google returns to the app through a deep link (`com.egirerobotics.app://auth`). Supabase finishes the session. This replaces today's web redirect.
- **One session for the whole app.** The Supabase session is stored once and used by all three modules.
- **Needed in Supabase:** add the app's redirect link to the allowed redirect URLs (alongside the website and CRM ones already listed).
- **Turnstile (the CRM's bot check):** add the app's origin to the allowed hostnames. This is a configuration change, not a workaround.
- **Optional later:** fingerprint or face unlock when the app opens, mainly for the CRM tab.

## 7. Data, caching and offline

| Content | Where it comes from | Offline? |
|---|---|---|
| Atlas lessons, graph, glossary, board photos | Bundled in the app | Fully offline |
| Website pages and lessons, Physics, Wiring Lab, Drone Lab, intro | Bundled in the app (static code) | Yes (they do not need a server) |
| Blog, program text, brochures | Bundled copy, refreshed from the site when online | Last version offline |
| Gallery photos | Small thumbnails bundled; full size loaded and cached on demand | Thumbnails offline |
| Videos | Streamed (not bundled), cached after first play | No |
| Sign-in, progress, enquiries, CRM data | Supabase | **Online only** |

Rules:

- **No student or CRM data is stored on the phone** beyond the sign-in session. The session goes in Android Keystore-backed storage, not plain local storage.
- **Enquiries made offline** are queued and sent when the connection returns (the website's enquiry form is the only write worth queueing).
- Cached images and pages use a size cap (for example 150 MB) with oldest-first clean-up, so the app never grows without limit.

## 8. Keeping it under 100 MB (and fast)

Size plan, with the biggest wins first:

| Step | Saves (estimate) |
|---|---|
| Convert and resize the large PNGs in `public/images` to WebP (about 100 to 200 KB each instead of about 1 to 2.8 MB); the 37 physics tutorial files (64 MB) become about 6 MB | about 110 MB of the 131 MB |
| First check which of those PNGs are still used at all: the part cards now use the 47 SVG illustrations, and a search of the source found no direct reference to the 66 top-level PNGs by file name (to be confirmed with a full usage scan before deleting anything) | possibly all of the 61 MB |
| Keep 640 px gallery thumbnails in the app, full-size gallery photos stay on the web | about 15 to 20 MB |
| Stream the 8 MB of videos instead of bundling them | 8 MB |
| Atlas board photos: JPEG to WebP at the size they are shown | about 3 MB |
| Android App Bundle (AAB): Google Play sends only the phone's own CPU build and screen density | 30 to 40% of install size |
| R8/ProGuard, remove unused plugins and fonts, only needed font weights | 1 to 3 MB |

Estimated result (bundled content): website code 4.4 MB + website assets 12 to 20 MB + CRM 2.9 MB + Atlas 5 MB + Capacitor and native code 4 to 6 MB = **roughly 30 to 40 MB**. A hard CI check fails the build if the APK passes 60 MB, leaving headroom below the 100 MB goal.

Speed plan:

- Each module is a separate lazy chunk; only the launcher loads at start.
- Start-up target: first screen in under 2 seconds on a mid-range phone (measured on a real device before release).
- The three.js scenes (Physics, Wiring Lab, Drone model) load only when opened and reduce quality on low-end phones (the website already caps the frame time for slow phones).
- The home page's 3D drone currently comes from Sketchfab (needs internet). In the app we use a bundled poster by default and the live 3D model only on a good connection.
- Images use WebP with fixed sizes, no layout shift, and the in-app cache.

## 9. Native features that make it a real app (and help Play approval)

Google Play can reject apps that are only a website in a frame. These give the app real value of its own:

1. **Push notifications** (Firebase Cloud Messaging): new enquiry for admins; exam results, approvals and certificates for students. This reuses the existing `broadcast` and notify Edge Functions, with a device-token table added.
2. **Offline Electronics Atlas.**
3. **Certificate PDF** saved to the phone and shared through the Android share sheet; QR scanning with the camera to verify a certificate.
4. **Deep links:** egirerobotics.com links open in the app.
5. **Biometric unlock** for the CRM tab.
6. **Home-screen widgets or shortcuts** (later).

## 10. Security and privacy

- Server-side permission checks only (RLS and Edge Functions); the app is never trusted for access control.
- HTTPS only; the WebView allows only our own origins and Supabase, plus the few third parties we use (Sketchfab, YouTube nocookie, Turnstile, voice agent). Everything else opens in the system browser.
- Session in Keystore-backed storage. No student data cached. CRM screens block screenshots and the recent-apps preview.
- No secrets in the app. Only the public Supabase URL and anon key ship, as on the website today.
- Release signing key stored safely and backed up (losing it means losing the ability to update the app).
- A privacy policy covering the app (the website's privacy page is the base), and Play's Data Safety form filled in honestly.
- Server-side "minimum app version" switch, so a broken or insecure build can be forced to update.

## 11. Code layout and build

New repository `egire-app` (monorepo), so the three web projects can stay where they are while we learn the build:

```
egire-app/
  android/                 Capacitor Android project (Kotlin shell, plugins, signing)
  shell/                   Launcher (tabs, role-aware, lazy modules)
  packages/app-core/       Shared: Supabase client, session, platform adapters
  modules/web/             Pulled from OpenFPV_Pilot (build with base=/web/)
  modules/crm/             Pulled from fpv-crm (base=/crm/)
  modules/atlas/           Pulled from the Atlas project (base=/atlas/)
  scripts/                 Image optimiser, size budget check, version stamping
```

- Phase 1 builds each project from its own repository with a different `base`, and copies the output into the shell. The code stays in one place per project; no merge needed yet.
- One command builds all three, optimises assets, syncs into Android and produces a signed AAB.
- Continuous checks: the three projects' tests, the size budget, a lint for unwanted network calls, and a smoke test on an emulator.

## 12. Releases and updates

- **Play Store (AAB)** for the app itself: internal testing, then closed testing (Play requires a test period for new personal accounts), then production.
- **Content updates without a store release:** the blog, program text and brochures refresh from the website when online. Code changes ship as normal app updates.
- A "live update" system for code (updating the bundled web files without the store) is possible later, but is off the first version: it adds risk and Play has rules about it.

## 13. Risks and what we do about them

| Risk | Why it matters | Plan |
|---|---|---|
| Play rejects a "website in a frame" | Reviewers want real app value | Section 9 features; first release as the Academy + Atlas + CRM with push and offline |
| Heavy 3D and the Wiring Lab canvas on low-end phones | Slow or hot phones | Lazy load, quality tiers, touch tuning, test on a cheap phone |
| CRM tables and forms are made for desktop | Hard to use on a phone | Mobile review of the CRM screens that staff really need; hide or simplify the rest |
| Google sign-in in a WebView | Blocked by Google | Custom Tab + deep link (section 6) |
| Three apps with three dependency sets | Duplicate React and Supabase copies cost size | Share one React and Supabase in the build; measure before optimising further |
| Signing key loss | Cannot update the app | Back it up in two places from day one |
| Hidden dependence on web-only behaviour (cookies, `window.open`, downloads, file pickers) | Bugs only found on a device | Platform adapter layer and a test checklist per module |

## 14. Phases (rough, to be re-estimated after the first build)

1. **Spike (about 1 week):** Capacitor shell with the Atlas only; real APK size and start-up time on a real phone. Confirms the design.
2. **Academy in the app:** website module, asset clean-up, Google sign-in via Custom Tab, deep links.
3. **CRM in the app:** CRM module, role-aware tab, biometric lock, mobile review of key screens.
4. **Native features:** push, certificate download and share, QR scan.
5. **Hardening and release:** size budget in CI, security review, Play listing, closed test, production.

## 15. Questions for you

1. **App name and package id**, for example "EGIRE Robotics" and `com.egirerobotics.app`.
2. **Google Play developer account:** do you have one, and personal or organisation? (Personal accounts need a closed test with testers before production.)
3. **Who gets the CRM tab:** only approved accounts and admins (recommended), or only admins?
4. **Push notifications in the first release?** (Recommended, it helps Play approval.)
5. **Is the voice assistant required in the app,** or can it stay website-only at first?
6. **Offline Atlas:** confirm it should be fully bundled (about 5 MB).

## 16. Do's and don'ts

*(To be added by you. This section is intentionally empty.)*
