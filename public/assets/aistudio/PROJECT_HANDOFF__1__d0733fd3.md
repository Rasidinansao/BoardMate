# PROJECT HANDOFF: BoardMate — Boarding House Management App

**Project Title:** BoardMate (Local WiFi Boarding House Management System)  
**Current Milestone:** Step 2 Interactive Mobile Mockups & Functional UX Prototype (Pre-Milestone 1 Step 3 Flutter Engine)  
**Author / Handoff Lead:** Senior Android & Flutter Software Engineer  
**Handoff Target:** Next AI Coding Agent / Engineering Team  
**Date:** October 2026  

---

## 1. Project Overview

### 1.1 Purpose and Intended Users
BoardMate is an Android-focused, local-first boarding house management system designed specifically for typical urban boarding houses in the Philippines (e.g., Manila, Cebu, Davao). 

The target house configuration is:
- **3 to 4 multi-bed rooms** (Room A, Room B, Room C, plus renovated/expansion rooms like Room D).
- **6 to 8 tenants** (mix of students and young professionals).
- **1 Host / Manager** (traditionally referred to as "Aling Nena", customizable to any name such as "Tita Baby", "Manang Rose", etc.).
- **Zero Cloud Dependency:** The app runs without expensive recurring cloud servers or external database fees. All data is stored locally on the Manager's phone (which acts as a local HTTP/SQLite host over house WiFi), allowing offline operation during internet outages, typhoons, and local network partitions.

### 1.2 Implemented User Roles & Access Control
1. **Manager (Host Phone):**
   - **PIN & Biometric Lock:** Screen unlock via 4-digit PIN or simulated biometric sensor.
   - **Host Server & Network Identity:** Displays local IP (`192.168.1.50:8080`), WiFi SSID, registered 2.4 GHz and 5 GHz BSSIDs.
   - **Room & Bed Management:** Adds renovated rooms with automated per-bed price division (e.g., ₱6,000 ÷ 3 beds = ₱2,000.00/bed), adjusts monthly room rent with an exact calendar effective date picker, monitors live occupancy and vacant bed turnover.
   - **Financial Management & Verification:** Reviews tenant-reported GCash/Maya/Bank payments with transaction reference numbers and uploaded screenshot proof; logs physical cash payments with instant verified receipts; tracks 6-month house income vs vacancy dips; monitors the single-glance Monthly Settlement Card ("5 of 6 Paid · 1 Overdue"); auto-draws overdue rent from 30-day security deposit cushion (₱83.33/day) to safeguard cash flow.
   - **Quick Alerts Dispatcher:** Direct dispatch of contextual notices to specific rooms or tenants using a 16-emoji palette (Quiet hours, lights/fan left on, gate unlatched, water running, stove unattended, parcels, trash, brownouts) over local WiFi and fallback SMS.
   - **Maintenance & Problem Resolution:** Reviews tenant repair requests with photo attachments, updates status (`open` → `in_progress` → `done`), and adds manager notes.
   - **One-Time Pairing (QR Code):** Generates time-limited QR codes containing host IP, house UUID, and single-use secret token.
   - **Disaster Recovery:** Exports/imports complete encrypted `.zip` backups containing SQLite database and photos.
   - **Manager Profile:** Real-time editing of the host name, dynamically synchronizing to receipts, notices, and tenant interfaces.

2. **Tenant (Resident Phone):**
   - **RA 10173 Data Privacy Compliance:** Explicit consent agreement explaining that only local WiFi arrival/presence is logged (zero GPS location, zero audio/photo access, zero background tracking).
   - **Android Permission Setup:** Guidance for Location (required by Android to read WiFi SSID), Notifications, and OEM battery optimization exemptions (MIUI, ColorOS, FunTouch OS).
   - **Bills & Official Receipts:** Transparent view of rent breakdown, utilities included status, verified payment credits, and downloadable/shareable official digital receipts.
   - **Self-Reported Payment ("I Paid"):** Uploads GCash/Maya reference number and receipt screenshot, queueing for manager verification.
   - **Security Deposit Days Cushion:** Visual gauge tracking remaining deposit days (e.g., 25 of 30 days intact) and warning banner if rent is overdue and deposit days are being drawn down.
   - **Quick Alerts:** 1-tap notifications to the manager and confidential room-to-room alerts (Too noisy, lights/fan left on in other rooms, door unlocked, faucet trickling, kitchen stove unattended, gate left open).
   - **Emergency 911 Hub:** Priority 911, BFP Fire, and Barangay dialers, with a 2-second hold-to-activate priority alarm that sounds on the manager's host phone.
   - **Me & Sync Status:** Real-time indicator for house WiFi connection, manual check-in buttons ("I'm Home" / "I'm Out"), and outbox queue counter.

### 1.3 Technology Stack
- **Framework:** React 19 SPA running on Vite (TypeScript).
- **Styling:** Tailwind CSS with native mobile design language (rounded-2xl cards, 48px+ touch targets, native status bar, bottom sheet modals).
- **Target Mobile Framework (Next Step):** Flutter 3.x / Dart (targeting Android 8.0+ / API level 26+).
- **Backend Architecture:** Local-first Shelf HTTP server + SQLite (Drift ORM in Flutter).
- **Local Network Protocol:** HTTP REST + mDNS (`_boardmate._tcp`) discovery + Local WiFi WebSocket sync.

---

## 2. Complete Project Structure

```
/
├── .env.example                     # Environment template (client-only vars)
├── .gitignore                       # Git ignore configuration
├── bun.lock                         # Lockfile
├── index.html                       # HTML5 entry point with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                    # Applet metadata, capabilities, and app naming
├── package.json                     # NPM packages & build scripts (vite, tailwindcss, react, lucide-react)
├── public/                          # Static assets and icons
├── tsconfig.json                    # TypeScript compiler options
├── vite.config.ts                   # Vite bundler configuration
└── src/
    ├── App.tsx                      # Top-level orchestration, state management, and toolbar
    ├── index.css                    # Tailwind CSS v4 directives & mobile scrollbar rules
    ├── main.tsx                     # React DOM entry point
    ├── mockData.ts                  # Domain models, realistic Filipino mock data, Philippine peso math
    ├── types.ts                     # TypeScript data interfaces (Room, Bed, Tenant, Payment, Alert, etc.)
    └── components/
        ├── CompanionGuide.tsx       # Senior Flutter architecture guide & Step 2 evaluation matrix
        ├── ManagerScreens.tsx       # Complete suite of 12 Manager screens & reactive bottom sheets
        ├── PhoneFrame.tsx           # Pixel-accurate 390px × 824px Android phone viewport frame
        ├── PhotoViewerModal.tsx     # Fullscreen inspection modal for maintenance & receipt screenshots
        ├── ShareableReceiptModal.tsx# Official Philippine boarding house digital receipt generator
        └── TenantScreens.tsx        # Complete suite of 10 Tenant screens & interactive bottom sheets
```

### Key Source Files & Purpose
- `src/types.ts`: Strongly typed data contracts. Stored in integer centavos (`amountCentavos: 250000` = ₱2,500.00) to eliminate IEEE 754 floating-point rounding errors.
- `src/mockData.ts`: Realistic initial datasets (Joy Dela Cruz, Paolo Reyes with 5 days overdue deposit drawdown, Maria Santos, rooms A/B/C, 6-month income history).
- `src/components/ManagerScreens.tsx`:
  - `AddRoomBottomSheetContent`: Add room modal with live per-bed division (Total Rent ÷ Beds).
  - `EditRoomPriceBottomSheetContent`: Edit monthly rate with `<input type="date">` for effective calendar date and live tenant share updates.
  - `DispatchAlertBottomSheetContent`: 16-emoji situational alert dispatcher targeting specific rooms or tenants.
  - `EditManagerNameBottomSheetContent`: Quick manager name updater with presets ("Aling Nena", "Tita Baby", etc.).
  - Screens: `m-lock`, `m-dash`, `m-rooms`, `m-tenant`, `m-billing`, `m-pay`, `m-alerts`, `m-maint`, `m-rules`, `m-pair`, `m-settings`, `m-more`.
- `src/components/TenantScreens.tsx`:
  - Quick alert room pickers (Noise, Lights, Faucets, Kitchen, Curfew).
  - Screens: `t-consent`, `t-perm`, `t-home`, `t-bills`, `t-pay`, `t-room`, `t-report`, `t-ann`, `t-me`, `t-emergency`.
- `src/components/PhoneFrame.tsx`: Renders real device framing, Android status bar, WiFi indicator, dynamic toast notification overlay, and system notification banner.
- `src/components/CompanionGuide.tsx`: In-app engineering guide containing architectural advice, Flutter implementation details, edge cases, and screen directory.

---

## 3. Current Feature Implementation Status

| Feature | Current Implementation | Relevant Source Files | Status | Known Limitations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Manager PIN & Lock** | 4-digit PIN pad with biometrics simulation and attempt counter | `ManagerScreens.tsx` | Working | UI simulation; in Flutter will use `local_auth` and SharedPreferences. |
| **Manager Dashboard** | Host IP/status, collection bar, Needs Attention cards, tenant presence chips | `ManagerScreens.tsx` | Working | Uses local state; reactive to payment approvals. |
| **Manager Name Customization** | Edit pencil on dashboard + settings card; updates throughout UI & receipts | `App.tsx`, `ManagerScreens.tsx`, `TenantScreens.tsx` | Working | Fully reactive across both manager and tenant views. |
| **Room Addition & Renovation** | Add Room modal with dynamic 1–4 bed selector & automatic per-bed division formula | `ManagerScreens.tsx`, `App.tsx` | Working | Real-time calculation: e.g. ₱6,000 ÷ 3 beds = ₱2,000.00/bed. |
| **Room Rate Edit & Effective Date** | Dedicated sheet with `<input type="date">` calendar picker & live tenant share sync | `ManagerScreens.tsx`, `App.tsx` | Working | Updates room monthly rent, bed shares, and assigned tenants' rent shares. |
| **Vacant Bed Turnover** | Bedspace Available cards with days-on-market & per-bed monthly rate | `ManagerScreens.tsx` | Working | Displays dynamically when `roomTenants.length < room.beds.length`. |
| **Deposit Days Overdue Drawdown** | Overdue rent draws down from 30-day deposit cushion (₱83.33/day) with warning gauge | `mockData.ts`, `ManagerScreens.tsx`, `TenantScreens.tsx` | Working | Paolo Reyes has 5 overdue days ($416.65 deducted from deposit, 25 days remaining). |
| **Monthly Settlement Card** | Simple "5 of 6 Paid · 1 Overdue" snapshot card with "Verify All" button | `ManagerScreens.tsx` | Working | Includes toggle to test "All Paid" and 1-tap overdue reminder. |
| **6-Month Income & Vacancy Graph** | Visual bar chart comparing collected rent against potential, with vacancy dips | `ManagerScreens.tsx` | Working | Interactive month inspection shows vacancy revenue loss (e.g. July ₱12,500 dip). |
| **Digital Payment Verification** | Manager verification queue for GCash/Maya receipts with photo thumbnail preview | `App.tsx`, `ManagerScreens.tsx` | Working | Approving immediately generates verified receipt and marks tenant Paid. |
| **Room Alerting & Emoji Palette** | Manager dispatches alerts to specific rooms with 16 contextual emojis (WiFi + SMS) | `ManagerScreens.tsx`, `App.tsx` | Working | Logs in "Dispatched by You to Rooms" history list. |
| **Tenant-to-Room Alerts** | Tenants report noise, lights left on, unlatched doors, and water running in rooms | `TenantScreens.tsx`, `App.tsx` | Working | Confidential reporter identity routed through manager phone. |
| **Maintenance Request System** | Tenant logs repair request with category and photo; manager tracks and resolves | `TenantScreens.tsx`, `ManagerScreens.tsx` | Working | Includes photo inspection modal and resolution notes. |
| **Offline Outbox & Presence** | WiFi presence toggle (SantosHouse vs Away vs Host Away) and outbox sync | `App.tsx`, `TenantScreens.tsx` | Working | Demonstrates offline degraded mode and reconnect sync. |
| **Emergency 911 & Alarm** | Direct dialer triggers and 2-second hold-to-activate priority host alarm | `TenantScreens.tsx` | Working | Alarm modal prompts for emergency type (Fire, Medical, Intruder). |
| **Digital Receipts** | Shareable official Philippine boarding house receipt with QR and breakdown | `ShareableReceiptModal.tsx` | Working | Includes print/download and SMS/chat share triggers. |

---

## 4. Database and Backend

### 4.1 Architecture Strategy (Local-First Shelf + SQLite)
- **Database Engine:** Embedded SQLite database (`boardmate.db`) residing on the Manager's Android host phone.
- **ORM:** In the future Flutter build, Drift (formerly Moor) is specified for type-safe Dart streams. In the current React mockup, state is managed in memory with full relational fidelity in `App.tsx` and `mockData.ts`.
- **Local HTTP Server:** Dart `shelf` and `shelf_router` listening on `0.0.0.0:8080` bound to the local WiFi adapter.
- **Discovery:** Android Network Service Discovery (NSD) broadcasting mDNS service `_boardmate._tcp` on local subnet.
- **Security & Authorization:**
  - Manager access protected by local SHA-256 hashed PIN and Android KeyStore biometric master key.
  - Tenant phones authenticate using a single-use token issued via one-time QR code pairing (`m-pair`), hashed in SQLite.
  - Cross-tenant data isolation: Tenants can only query their own bills, receipts, and room info. Peering into other tenants' financial records or contact numbers is blocked at the shelf middleware layer.

---

## 5. Current Development Progress

### Completed in Step 2 Mockups
1. **Interactive Persona Switching:** Instant toggle between Manager mode and multiple Tenant personas (Joy Dela Cruz = pending verification; Paolo Reyes = 5 days overdue with deposit drawdown; Maria Santos = fully paid).
2. **Dynamic Room Expansion:** "＋ Add Room" with user-defined bed count (1–4 beds) and live automated rent division.
3. **Editable Room Rate with Calendar Date:** "✏️ Edit Price" bottom sheet with `<input type="date">` for the effective date, live per-bed division, and automatic tenant share synchronization.
4. **Custom Manager Profile:** Manager can change their name ("Aling Nena" to custom), updating headers, receipts, announcements, and tenant screens.
5. **Contextual Room Alert Dispatcher:** 16-emoji alert composer for specific rooms or tenants, plus tenant room-to-room notifications.
6. **Financial Discipline:** Overdue deposit reduction gauge, 6-month income consistency bar graph, and simple monthly settlement card ("5 of 6 Paid").
7. **Comprehensive TypeScript & Lint Cleanliness:** `compile_applet` and `lint_applet` (`tsc --noEmit`) pass with 0 errors.

---

## 6. Build and Development Environment

### Local Development (Web / Vite Prototype)
```bash
# 1. Install dependencies
npm install

# 2. Run local dev server (default port 3000)
npm run dev

# 3. Type check and lint
npm run lint

# 4. Production build
npm run build
```

---

## 7. NEXT AI AGENT INSTRUCTIONS

**CRITICAL DIRECTIVES FOR THE NEXT AI CODING AGENT:**

1. **Continue, Do Not Recreate:** Do NOT scrap or rewrite this codebase. Continue directly from this existing state.
2. **Preserve Established UX and Design Language:** Retain the clean, mobile-first design, card hierarchies, color system (indigo brand, emerald success, amber warning, rose danger), 48px+ touch targets, and Filipino boarding house contextual features.
3. **Respect Integer Centavos Math:** All monetary values MUST remain integers (₱2,500.00 = `250000`). Never introduce floating-point money calculations.
4. **Preserve Confidentiality Rules:** Never allow direct tenant-to-tenant confrontation. All noise, appliance, and cleaning alerts MUST pass through the manager phone as the confidential intermediary.
5. **Effective Date Principle:** When adjusting room rates, always honor the calendar effective date to avoid retroactively charging tenants whose due dates fall earlier in the cycle.
6. **No Phantom Integrations:** Do not add third-party cloud SDKs (Firebase, Supabase, AWS) unless the user explicitly commands a pivot away from the local WiFi host architecture.

---

## 8. Recommended Development Roadmap (Milestone 1 Step 3 and Beyond)

### Step 3: Flutter & Drift Architecture Initialization (M1)
- **Goal:** Set up Flutter project structure matching the 22 verified screens.
- **Target Files:** `pubspec.yaml`, `lib/core/db/database.dart`, `lib/features/rooms/`, `lib/features/billing/`.
- **Key Tasks:**
  1. Initialize Drift SQLite schema with tables: `Rooms`, `Beds`, `Tenants`, `Payments`, `QuickAlerts`, `Maintenance`, `HouseSettings`.
  2. Implement Shelf HTTP server running in an Android foreground service with persistent notification.
  3. Port the verified `AddRoomBottomSheetContent`, `EditRoomPriceBottomSheetContent`, and `DispatchAlertBottomSheetContent` widgets into Flutter.

---

## 9. Final Handoff Summary
- **Current Status:** Step 2 Mobile Mockups fully complete, verified, and compiling cleanly.
- **Top 3 Immediate Next Actions:**
  1. Review Step 2 acceptance checklist with user.
  2. Begin Milestone 1 Step 3 Flutter project scaffolding.
  3. Port Drift SQLite schemas based on `types.ts`.
- **Resume Checklist:**
  - [x] Room price editing with date input verified.
  - [x] Multi-room emoji alert dispatching verified.
  - [x] Dynamic manager name verified.
  - [x] `PROJECT_HANDOFF.md` created at project root.
