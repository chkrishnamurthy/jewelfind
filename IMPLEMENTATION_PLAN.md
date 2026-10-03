# JewelFind — Phase-wise Implementation Plan

**Goal:** turn the JewelFind HTML prototype into a working product for Hyderabad, starting small and cheap, then adding automation only when volume needs it.

**Timeline:** launchable in about 6 weeks (Phases 0–5) and live with pilot showrooms by about week 8 (Phase 6). Phases 7–9 come later, only when the numbers justify them.

**Budget:** first year ₹25,000–60,000 if you build it yourself, ₹1.2–2.2 lakh with one freelance developer (details in [Budget by phase](#budget-by-phase)).

---

## Phase overview

| Phase | Name | When | Outcome |
|---|---|---|---|
| 0 | Decisions and accounts | Week 1 | Domain, server, WhatsApp and Cloudflare accounts ready; key decisions made |
| 1 | Foundation | Weeks 1–2 | Next.js app, database and photo storage running on the live server |
| 2 | Shopper flow | Weeks 2–3 | Shopper can upload a photo, submit a request and track it |
| 3 | Admin console | Weeks 3–4 | Admin can log in, see requests, record showroom replies and release a match |
| 4 | WhatsApp messages | Weeks 4–5 | Shopper gets confirmation, match and not-found messages automatically |
| 5 | Hardening and launch prep | Weeks 5–6 | Bugs fixed, legal pages, backups, monitoring, phone testing |
| 6 | Pilot launch | Weeks 6–8 | 10–20 showrooms, real requests, measured results |
| 7 | Automation | Month 3–4 | Showrooms reply with WhatsApp buttons; replies flow in automatically |
| 8 | Showroom portal | Month 4–5 | Showrooms log in and reply, upload photos of available pieces |
| 9 | Growth | Month 6+ | AI photo tagging, similar-design matching, monetisation, new cities |

**Rule:** do not start Phase 7 until Phase 6 shows that showrooms reply and shoppers use the service.

---

## Tech stack (small launch)

| Part | Choice | Why |
|---|---|---|
| Website + admin panel | Next.js (React, TypeScript) + Tailwind CSS | The HTML is already React + Tailwind; reuse the design |
| Backend | Next.js API routes | One codebase, one deployment |
| Database | PostgreSQL 16 (Docker, on the VPS) | Free, reliable, handles years of growth |
| ORM / migrations | Drizzle ORM (or Prisma) | Typed queries and versioned schema changes |
| Validation | Zod | Same rules on the form and the server |
| Photo storage | Cloudflare R2 (private bucket) | 10 GB free, no download charges |
| Image processing | `sharp` | Resize, convert iPhone HEIC to JPEG, strip GPS location data |
| Admin login | Auth.js or Better Auth, email + hashed password | Real admin security |
| Shopper messages | Meta WhatsApp Cloud API (direct) | Pay Meta's rate only, no middleman |
| Showroom messages | WhatsApp Business app, by hand (Phases 0–6) | Free until automation is worth it |
| Hosting | One VPS (2 CPU, 4 GB RAM, Ubuntu) + Docker Compose + Caddy | Cheapest; Caddy gives automatic HTTPS |
| DNS, SSL, spam protection | Cloudflare free plan + Turnstile | Free CDN, HTTPS, bot check on the upload form |
| Error alerts | Sentry free plan | Know when something breaks |
| Backups | Daily `pg_dump` uploaded to R2 | Recover from server loss |

---

## Phase 0 — Decisions and accounts (week 1)

**Goal:** remove blockers before writing code. WhatsApp approval can take days, so start it first.

### Decisions to make
- [ ] Revenue direction (free at launch is fine; note the likely model: per-lead fee, subscription or featured listing)
- [ ] Whether a showroom ever receives the shopper's phone number (recommended: no; the shopper contacts the showroom)
- [ ] List of 10–20 pilot showrooms willing to reply on WhatsApp
- [ ] Areas and jewellery types for the form (start with the 8 areas and 7 types in the HTML)
- [ ] How long to keep photos and phone numbers (suggested: photos 90 days after closing, numbers 12 months)

### Accounts and purchases
- [ ] Buy domain (`jewelfind.in` or similar) — ₹500–1,200/year
- [ ] Cloudflare account; move the domain's DNS to Cloudflare
- [ ] VPS (2 CPU, 4 GB RAM, Ubuntu 24.04, India or Singapore region) — ₹600–2,000/month
- [ ] Cloudflare R2 bucket `jewelfind-photos` (private) + API token
- [ ] Meta Business account → business verification → WhatsApp Cloud API app → dedicated phone number (new SIM, not used on personal WhatsApp)
- [ ] Sentry account (free)
- [ ] GitHub repository (private)

### Done when
All accounts exist, the domain points to Cloudflare, and WhatsApp business verification is submitted.

---

## Phase 1 — Foundation (weeks 1–2)

**Goal:** an empty but real app running on the live server with database and storage connected.

### Tasks
- [ ] Create Next.js project (TypeScript, App Router, Tailwind, ESLint)
- [ ] Copy the colour palette and fonts from the HTML into Tailwind config (cream `#FFFBF2`, ink `#11100F`, gold `#E7C78E`, border `#E9DDC8`); load Cormorant Garamond and Inter with `next/font`
- [ ] Add Drizzle + PostgreSQL; write the first migration (tables below)
- [ ] Seed script with the areas, jewellery types and a few test showrooms
- [ ] R2 helper: create presigned upload URL, create short-lived signed view URL
- [ ] `docker-compose.yml` with `app`, `postgres`, `caddy`
- [ ] Server setup: Docker, firewall (only ports 22, 80, 443), SSH key login only, automatic security updates
- [ ] Deploy script (GitHub Actions over SSH, or a manual `git pull && docker compose up -d --build`)
- [ ] `.env.example` documenting every variable (list below)
- [ ] Sentry installed

### Database tables (first version)

```sql
admins           (id, email unique, password_hash, name, role, created_at)
showrooms        (id, name, area, address, phone, whatsapp, maps_url,
                  categories text[], active bool, created_at, updated_at)
requests         (id uuid, code unique,            -- e.g. JF-7K3P9QXM (8 random chars)
                  name, phone_e164, area, category,
                  budget_min, budget_max,           -- in rupees, optional
                  status,                           -- see status flow below
                  consent_at, consent_version,
                  created_at, updated_at, closed_at)
request_photos   (id, request_id, r2_key, width, height, bytes, created_at)
showroom_replies (id, request_id, showroom_id,
                  reply,                            -- has | similar | no
                  note, photo_r2_key, recorded_by_admin_id, created_at)
matches          (id, request_id, showroom_id, reply_id, kind,  -- exact | similar
                  sent_to_shopper_at, created_at,
                  unique (request_id, showroom_id))
messages         (id, request_id, to_phone, template, wa_message_id,
                  status, error, created_at)
audit_log        (id, admin_id, action, entity, entity_id, details jsonb, created_at)
```

Replies are never overwritten: a changed answer is a new row, so history is kept.

### Request status flow

```
submitted → checking → matched → closed
                     ↘ similar_offered → matched (if exact arrives) / closed
                     ↘ not_found → closed
any open status → cancelled
```

### Environment variables

```
DATABASE_URL
AUTH_SECRET
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN
TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
SENTRY_DSN
APP_URL
```

### Done when
`https://jewelfind.in` shows a placeholder page over HTTPS, the database has tables, and a test file uploads to R2.

---

## Phase 2 — Shopper flow (weeks 2–3)

**Goal:** a shopper can submit a real request from a phone and track it.

### Tasks
- [ ] Port pages from the HTML as separate routes: `/` (hero + form), `/how-it-works`, `/for-showrooms`
- [ ] Photo upload component: keyboard accessible, drag and drop, preview, remove, progress bar, max 10 MB, JPEG/PNG/WebP/HEIC
- [ ] Compress the photo in the browser before upload (target under 2 MB)
- [ ] Upload directly to R2 using a presigned URL (`POST /api/uploads/presign`)
- [ ] Server-side image job: convert HEIC, resize, strip EXIF/GPS, save width/height
- [ ] Request form with Zod validation: name 2–60 chars, Indian mobile number normalised to `+91XXXXXXXXXX`, area, type, budget as ranges (e.g. under 50k, 50k–1L, 1–2L, 2–5L, 5L+)
- [ ] Consent checkbox with a link to the privacy page
- [ ] Cloudflare Turnstile on the form; rate limit 5 requests per phone per day
- [ ] `POST /api/requests` → creates the request with a random 8-character code
- [ ] Confirmation screen showing the code
- [ ] Tracking page `/t/[code]?k=<secret>` (signed link) showing status steps and, when matched, the showroom card
- [ ] Shopper sees only "N showrooms checked", never the list of showroom names or their "No" replies
- [ ] Empty, loading and error states for every step

### Done when
On an Android phone and an iPhone (including Instagram's in-app browser), you can upload a photo, submit, and open the tracking page.

---

## Phase 3 — Admin console (weeks 3–4)

**Goal:** the admin can run the whole service from one screen.

### Tasks
- [ ] Admin login (email + password, hashed), session cookie, logout; admin accounts created by seed script
- [ ] `/admin/requests`: list with filters (status, area, type), search by code or phone, newest first, pagination (50 per page)
- [ ] `/admin/requests/[id]`: photos, shopper details (phone masked; "show" button logs to `audit_log`), budget, history
- [ ] Showroom reply panel: pick showrooms (filtered by area and category), record Has It / Similar / No with an optional note and photo
- [ ] Status logic in one function: first reply → `checking`; any Has It → admin can release a match; all No → `not_found`
- [ ] "Release match" button: creates the match and moves the request to `matched`
- [ ] "Copy WhatsApp message" button for showrooms: copies the photo link and text to paste into WhatsApp Business (manual sending in Phases 0–6)
- [ ] `/admin/showrooms`: add, edit, pause showrooms (name, area, address, phone, WhatsApp, Maps link, categories)
- [ ] `/admin/applications`: list "Join network" form submissions from `/for-showrooms` (replaces the current `alert()`)
- [ ] Simple dashboard: requests today, matches today, average time to first reply
- [ ] Every admin action written to `audit_log`

### Done when
An admin can take a request from `submitted` to `matched` or `not_found` without touching the database.

---

## Phase 4 — WhatsApp messages (weeks 4–5)

**Goal:** shoppers are informed automatically.

### Tasks
- [ ] Write and submit message templates in Meta (category **Utility**, English):
  - `request_received` — "We got your request {{code}}. Track it here: {{link}}"
  - `match_found` — showroom name, address, Maps link, phone
  - `similar_found` — "Similar designs available at {{showroom}}"
  - `not_found` — "We couldn't find this design this time…"
- [ ] `lib/whatsapp.ts`: send a template, save it to `messages`, retry on failure (3 attempts)
- [ ] Send `request_received` after a request is created
- [ ] Send `match_found` / `similar_found` / `not_found` when the admin releases the result
- [ ] Webhook `GET/POST /api/webhooks/whatsapp`: verify Meta's signature, update message status (sent, delivered, read, failed)
- [ ] Show the message log and failures in the request detail page
- [ ] Fix the "WhatsApp Owner" button to use the **showroom's** number: `https://wa.me/<showroom whatsapp>`
- [ ] "Open in Maps" uses `https://www.google.com/maps/search/?api=1&query=<address>` (free, no API key)

### Done when
A test request on your own phone receives the confirmation and the match messages, and the statuses show as delivered.

---

## Phase 5 — Hardening and launch prep (weeks 5–6)

**Goal:** safe, honest and stable enough for real shoppers.

### Fix from the HTML prototype
- [ ] Remove real brand names, the Manepally testimonial, pravatar.cc faces, the duplicate "Trusted by" row and the fixed stats (50+, 89%, 2.3 hrs, 2,400+) unless they are true
- [ ] Remove the "Simulate Found (demo)" button
- [ ] Remove the public "Admin" button from the header
- [ ] Fix grey text contrast (use `#6B6560` or darker for small text)
- [ ] Add a real `<title>`, description, share image and favicon

### Security and reliability
- [ ] Rate limits on upload, request creation and login (5 failed logins → 15-minute lockout)
- [ ] Security headers (Content-Security-Policy, HSTS, X-Content-Type-Options)
- [ ] Daily database backup to R2 (cron + `pg_dump` + `rclone`), keep 30 days; test one restore
- [ ] Retention job: delete photos 90 days after a request closes
- [ ] Sentry alerts to your email; free uptime check (e.g. UptimeRobot) on the home page

### Legal pages
- [ ] Privacy policy (what is collected, why, how long it is kept, how to ask for deletion)
- [ ] Terms of use (photo usage for search only, no guarantee of availability)
- [ ] Optional: lawyer review — ₹10,000–20,000

### Testing
- [ ] Full flow on Android Chrome, iPhone Safari, Instagram in-app browser
- [ ] Wrong inputs: bad phone, huge photo, PDF, empty fields
- [ ] Two admins editing the same request
- [ ] Slow network (Chrome DevTools "Slow 3G")

### Done when
The checklist above is ticked and one full restore from backup has worked.

---

## Phase 6 — Pilot launch (weeks 6–8)

**Goal:** prove the service works with real people before spending more.

### Tasks
- [ ] Onboard 10–20 showrooms: explain the WhatsApp flow, save their numbers, agree on response time
- [ ] Soft launch: share with friends and family, then a small Instagram audience
- [ ] Admin handles each request daily; record reply times
- [ ] Weekly review of the numbers below

### Measure
| Metric | Why it matters |
|---|---|
| Requests per day | Demand |
| % of showrooms that reply within 6 hours | Partner commitment |
| % of requests matched | Core value |
| Admin minutes per request | Operating cost; triggers Phase 7 when it is too high |
| Shoppers who visited the showroom | Value to showrooms, needed for revenue later |

### Decision gate
Go to Phase 7 only if showrooms reply reliably and the admin time per request is the main bottleneck.

---

## Phase 7 — Automation (month 3–4)

**Goal:** cut admin time per request from ~10–15 minutes to ~2–3.

### Tasks
- [ ] WhatsApp template to showrooms with the photo and three quick-reply buttons: Has It / Similar / No
- [ ] Webhook turns each button press into a `showroom_replies` row automatically
- [ ] Automatic showroom selection by area and category (and later by past reply rate)
- [ ] Send each showroom at most one message per hour (group new requests) to save message cost
- [ ] Reminder job: alert the admin if a request has no reply after 4 hours; send shopper an update at 6 hours
- [ ] Duplicate detection: same photo + same phone within 24 hours opens the existing request
- [ ] Tracking lookup by phone + WhatsApp OTP at `/t`

### Watch
Meta must classify the showroom template as **Utility**, not Marketing (Marketing costs about 6× more). Keep the wording transactional and only message opted-in showrooms.

---

## Phase 8 — Showroom portal (month 4–5)

**Goal:** showrooms answer in a mobile-friendly page and add proof (photo, price, weight).

### Tasks
- [ ] Showroom login by WhatsApp OTP
- [ ] List of requests sent to *their* showroom only (strict access check on every query)
- [ ] Reply with photo of the available piece, price range, weight, purity
- [ ] Profile: hours, categories, WhatsApp number
- [ ] Shopper's match card shows the showroom's own photo instead of the shopper's

---

## Phase 9 — Growth (month 6+)

Build only what the data asks for:

- [ ] AI photo tagging (type, metal, stones) with a vision model — about ₹0.2 per photo
- [ ] Showrooms upload stock photos; "find similar" using image embeddings (PostgreSQL + pgvector)
- [ ] Monetisation: lead fee, monthly subscription or featured placement; payments via Razorpay
- [ ] Second city: add `city` to areas and showrooms
- [ ] Telugu and Hindi versions (WhatsApp templates need approval per language)
- [ ] Move to bigger hosting (managed database, separate worker) when one VPS is no longer enough

---

## Folder structure

```
jewelfind/
├─ app/
│  ├─ (site)/                 # /, how-it-works, for-showrooms, privacy, terms
│  ├─ t/[code]/               # tracking page
│  ├─ admin/                  # requests, showrooms, applications, dashboard, login
│  └─ api/
│     ├─ uploads/presign/
│     ├─ requests/
│     ├─ admin/...
│     └─ webhooks/whatsapp/
├─ components/                # PhotoDropzone, StatusPill, ShowroomCard, ReplyButtons...
├─ lib/
│  ├─ db/                     # Drizzle schema + client
│  ├─ auth.ts
│  ├─ r2.ts
│  ├─ whatsapp.ts
│  ├─ images.ts               # sharp processing
│  ├─ status.ts               # request status rules (one place)
│  └─ validation.ts           # Zod schemas
├─ db/migrations/
├─ scripts/                   # seed.ts, backup.sh, purge-photos.ts
├─ docker-compose.yml
├─ Caddyfile
├─ .env.example
└─ IMPLEMENTATION_PLAN.md
```

---

## Budget by phase

| Phase | Time | You build it | With a freelancer |
|---|---|---|---|
| 0 Decisions and accounts | Week 1 | Domain ₹500–1,200; VPS ₹600–2,000/month starts | Same |
| 1–5 Build to launch | Weeks 1–6 | ₹0 | ₹80,000–1.5 lakh |
| 5 Lawyer review (optional) | Week 5–6 | ₹10,000–20,000 | Same |
| 6 Pilot | Weeks 6–8 | Running cost only | Running cost only |
| 7 Automation | Month 3–4 | ₹0 | ₹50,000–1 lakh |
| 8 Showroom portal | Month 4–5 | ₹0 | ₹50,000–1 lakh |
| 9 Growth | Month 6+ | Decide based on revenue | Decide based on revenue |

**Running cost at launch:** about ₹1,500–3,500 per month (VPS ₹600–2,000 + WhatsApp ₹500–1,500; everything else on free plans).

VPS and freelancer prices are typical market ranges; confirm before paying. WhatsApp, Cloudflare R2 and Google Maps prices come from their official pricing pages (October 2026).

---

## Not building yet

Native mobile apps · microservices · Kubernetes · SMS · paid search engines · multi-city · AI matching · paid hosting plans. Add each only when a real limit is hit.
