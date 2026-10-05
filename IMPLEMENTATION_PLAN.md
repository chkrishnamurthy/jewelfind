# JewelFind — Phase-wise Implementation Plan

**Goal:** turn the JewelFind HTML prototype into a working product for Hyderabad, starting small and cheap, then adding automation only when volume needs it.

> **Current implementation stage:** build and approve the complete frontend experience with mock data before starting backend work. Follow [FRONTEND_IMPLEMENTATION_PLAN.md](./FRONTEND_IMPLEMENTATION_PLAN.md). Do not start the database, real authentication, storage, WhatsApp or other API integrations until the frontend milestone is approved.

**Timeline:** launchable in about 6 weeks (Phases 0–5) and live with pilot showrooms by about week 8 (Phase 6). Phases 7–9 come later, only when the numbers justify them.

**Budget:** launch through the pilot (Phases 0–6) plus the first year of running costs is about ₹25,000–60,000 if you build it yourself or ₹1.0–2.1 lakh with one freelance developer. If a freelancer also builds Phases 7–8 in the first year, plan for roughly ₹2.0–4.1 lakh in total (details in [Budget by phase](#budget-by-phase)).

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
| Website + admin panel | Next.js (React, TypeScript) + Tailwind CSS | Shopper and admin interfaces in one codebase |
| Backend | Next.js route handlers and service modules | One codebase and one web deployment |
| Background jobs | Worker process using a PostgreSQL-backed job table | Image processing, message retries and cleanup must survive web restarts |
| Database | PostgreSQL 16 (Docker, on the VPS) | Free, reliable, handles years of growth |
| ORM / migrations | Drizzle ORM | Typed queries and versioned schema changes; choose one ORM before coding |
| Validation | Zod | Same rules on the form and the server |
| Photo storage | Cloudflare R2 (private bucket) | 10 GB free, no download charges |
| Image processing | `sharp` with verified HEIC-capable `libvips`, or a separate HEIC decoder | Resize, convert supported images to JPEG and remove metadata |
| Admin login | Better Auth with Drizzle, email/password and library-managed secure hashing | One defined authentication approach rather than two alternatives |
| Shopper messages | Meta WhatsApp Cloud API (direct) | Pay Meta's rate only, no middleman |
| Showroom messages | WhatsApp Business app, by hand (Phases 0–6) | Free until automation is worth it |
| Hosting | One VPS (2 CPU, 4 GB RAM, Ubuntu) + Docker Compose + Caddy | Cheapest; Caddy gives automatic HTTPS |
| DNS, SSL, spam protection | Cloudflare free plan + Turnstile | Free CDN, HTTPS, bot check on the upload form |
| Error alerts | Sentry free plan | Know when something breaks |
| Backups | Encrypted daily `pg_dump` uploaded to a separate R2 backup prefix/bucket | Recover the database from server loss; photo recovery is covered separately |

---

## Application structure

JewelFind starts as one codebase, not three separate applications:

```
Browser interfaces
├─ Shopper website      /, /how-it-works, /t/...
├─ Admin console       /admin/...
└─ Showroom portal     /showroom/...        # Phase 8
            ↓
Next.js web process
├─ Pages and route handlers
├─ Authentication and authorization
└─ Business services and status rules
            ↓
PostgreSQL + private R2 + WhatsApp/Turnstile/Sentry

Separate worker process (same repository)
└─ Image processing, message retries, retention and scheduled jobs
```

The VPS runs `caddy`, `app`, `worker` and `postgres` containers. Admin is a protected interface inside the same Next.js application, not a separate server.

---

## Phase 0 — Decisions and accounts (week 1)

**Goal:** remove blockers before writing code. WhatsApp approval can take days, so start it first.

### Decisions to make
- [ ] Revenue direction (free at launch is fine; note the likely model: per-lead fee, subscription or featured listing)
- [ ] Whether a showroom ever receives the shopper's phone number (recommended: no; the shopper contacts the showroom)
- [ ] List of 10–20 pilot showrooms willing to reply on WhatsApp
- [ ] Areas and jewellery types for the form (start with the 8 areas and 7 types in the HTML)
- [ ] How long to keep photos and phone numbers (suggested: photos 90 days after closing, numbers 12 months)
- [ ] Exact meaning of a released result: whether one or multiple showrooms may be released to a shopper
- [ ] Shopper consent wording for WhatsApp messages and for sharing the uploaded photo with selected showrooms
- [ ] Phone-verification approach: WhatsApp OTP before production submission; use a development-only OTP while the Meta integration is unfinished
- [ ] Showroom response deadline and the rule for declaring a request not found

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
- [ ] R2 helper: create narrowly scoped presigned upload URLs and short-lived signed view URLs
- [ ] PostgreSQL-backed job runner with retry, lease/timeout and dead-letter states
- [ ] `docker-compose.yml` with `app`, `worker`, `postgres`, `caddy`; add health checks, restart policies, an internal network and a persistent PostgreSQL volume. Publish only Caddy ports 80/443; never publish PostgreSQL publicly
- [ ] Server setup: Docker, firewall (only ports 22, 80, 443), SSH key login only, automatic security updates, Cloudflare SSL mode Full (strict)
- [ ] Deploy script with migration, health-check and rollback steps (GitHub Actions over SSH or a documented manual deployment); pin and verify the SSH host key
- [ ] `.env.example` documenting every variable (list below)
- [ ] Sentry installed

### Database tables (first version)

```sql
auth tables      (user, session, account, verification) -- generated by Better Auth
admin_profiles   (user_id unique, role, active, created_at, updated_at)
showrooms        (id, name, area, address, phone, whatsapp, maps_url,
                  categories text[], active, whatsapp_opt_in_at,
                  created_at, updated_at)
requests         (id uuid, code unique, tracking_token_version,
                  name, phone_e164, phone_verification_id, phone_verified_at,
                  area, category,
                  budget_min, budget_max, status, version,
                  consent_at, consent_version, whatsapp_consent_at,
                  photo_share_consent_at, created_at, updated_at, closed_at)
phone_verifications
                 (id uuid, phone_e164, purpose, otp_hash, status, attempts,
                  expires_at, verified_at, created_at)
upload_sessions  (id uuid, owner_token_hash, temp_r2_key unique,
                  declared_mime, declared_bytes, actual_mime, actual_bytes,
                  checksum, status, error, expires_at, created_at, updated_at)
request_photos   (id, request_id, upload_session_id unique, r2_key unique,
                  width, height, bytes, mime, checksum, created_at)
showroom_assignments
                 (id uuid, request_id, showroom_id, status,
                  assigned_by_admin_id, assigned_at, sent_at, opened_at,
                  reply_due_at, channel,
                  unique (request_id, showroom_id))
showroom_replies (id, assignment_id, reply,        -- has | similar | no
                  note, photo_r2_key, supersedes_reply_id,
                  recorded_by_admin_id, source, created_at)
matches          (id, request_id, showroom_id, reply_id, kind,
                  released_by_admin_id, released_at, sent_to_shopper_at,
                  unique (request_id, showroom_id))
messages         (id, request_id nullable, assignment_id nullable,
                  phone_verification_id nullable, to_phone, template,
                  idempotency_key unique, wa_message_id unique,
                  status, attempt_count, next_attempt_at, error,
                  created_at, updated_at)
jobs             (id, kind, payload jsonb, status, attempt_count,
                  run_after, locked_at, last_error, created_at, updated_at)
applications     (id, business_name, contact_name, phone_e164, area,
                  categories text[], status, created_at, updated_at)
events           (id, request_id, actor_type, event, details jsonb, created_at)
audit_log        (id, admin_id, action, entity, entity_id, details jsonb, created_at)
```

Use foreign keys, timestamps with time zone, check constraints for enums and budgets, and indexes for every list/filter/join path. Replies are append-only: a changed answer points to the prior row through `supersedes_reply_id`, and business logic uses the latest reply for each assignment.

### Request status flow

```
submitted → checking                 # when the first showroom assignment is sent
checking → similar_offered           # when an admin releases a similar result
checking/similar_offered → matched   # when an admin releases an exact result
checking → not_found                 # after all active assignments say No,
                                      # or the response deadline passes and an admin confirms
matched/similar_offered/not_found → closed
any open status → cancelled
```

Every transition runs through one transactional service. It locks or version-checks the request, writes the state change and audit/event row, and enqueues notifications in the same transaction. Transitions into `closed` or `cancelled` set `closed_at`.

### Upload state flow

```
presign creates upload session → browser uploads to a temporary R2 key
browser calls complete → worker validates bytes and decodes image
→ ready: processed JPEG can be attached to a request
→ failed: object is quarantined/deleted and the shopper can retry
```

- Require Turnstile and IP/session rate limits before issuing a presigned URL.
- Bind the upload to an unguessable owner token; `POST /api/requests` accepts only a `ready` upload belonging to that token.
- Sign the exact key and content type with a short expiry. After upload, verify actual size, magic bytes, checksum and decoded dimensions; never trust the extension or browser MIME type.
- Limit pixel count and processing time to prevent decompression bombs.
- Delete expired or unattached temporary objects automatically.
- The Docker image must prove HEIC decoding with a real iPhone fixture. If the selected `sharp`/`libvips` build cannot decode HEIC, use a dedicated decoder or remove HEIC from the launch promise.

### Environment variables

```
DATABASE_URL
AUTH_SECRET
UPLOAD_TOKEN_SECRET
TRACKING_TOKEN_SECRET
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN
TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
SENTRY_DSN
APP_URL
```

### Done when
`https://jewelfind.in` shows a placeholder page over HTTPS, migrations run successfully, the worker completes a test job, and JPEG plus real iPhone HEIC fixtures pass the image-processing helper/job.

---

## Phase 2 — Shopper flow (weeks 2–3)

**Goal:** a shopper can submit a real request from a phone and track it.

### Tasks
- [ ] Port pages from the HTML as separate routes: `/` (hero + form), `/how-it-works`, `/for-showrooms`
- [ ] Photo upload component: keyboard accessible, drag and drop, preview, remove, progress bar, max 10 MB, JPEG/PNG/WebP/HEIC
- [ ] Compress supported formats in the browser before upload (target under 2 MB), but do not depend on browser-side HEIC decoding
- [ ] Upload to a temporary R2 key through an upload session (`POST /api/uploads/presign` then `POST /api/uploads/[id]/complete`)
- [ ] Worker validates the real file, converts it to JPEG, resizes it, strips metadata including GPS, records dimensions/checksum and marks the upload `ready`
- [ ] Request form with Zod validation: name 2–60 chars, Indian mobile number normalised to `+91XXXXXXXXXX`, area, type, budget as ranges (e.g. under 50k, 50k–1L, 1–2L, 2–5L, 5L+)
- [ ] Separate required consent for the privacy terms, WhatsApp updates and sharing the photo with selected showrooms; store timestamp and text version
- [ ] Cloudflare Turnstile on upload/request endpoints; rate-limit by IP, browser session and verified phone rather than phone alone
- [ ] Phone verification flow: development OTP in Phase 2, replaced by an approved WhatsApp authentication template in Phase 4; no production outreach until verified
- [ ] `POST /api/requests` accepts a verified phone session and owned `ready` upload, then creates the request; retry unique-code collisions
- [ ] Generate a short-lived stateless tracking token signed with at least a 128-bit MAC; include request ID, expiry and `tracking_token_version` so it can be regenerated for messages and revoked by incrementing the version
- [ ] Tracking page `/t/[token]` showing status steps and, when released, the showroom card; use `Referrer-Policy: no-referrer`, redact tokens from logs/Sentry, and offer OTP-based link recovery after expiry
- [ ] Shopper sees only "N showrooms contacted" and "N replied", never showroom identities or their No replies before a result is released
- [ ] Empty, loading and error states for every step

### Done when
On an Android phone and an iPhone (including Instagram's in-app browser), you can upload a photo, submit, and open the tracking page.

---

## Phase 3 — Admin console (weeks 3–4)

**Goal:** the admin can run the whole service from one screen.

### Tasks
- [ ] Admin login through Better Auth (library-managed password hashing, secure session cookie, logout); create the first admin with a one-time CLI command, never a committed/default seed password
- [ ] `/admin/requests`: list with filters (status, area, type), search by code or phone, newest first, pagination (50 per page)
- [ ] `/admin/requests/[id]`: photos, shopper details (phone masked; "show" button logs to `audit_log`), budget, history
- [ ] Assignment panel: select showrooms (filtered by area and category), create `showroom_assignments`, and record exactly when each manual WhatsApp message is sent
- [ ] Reply panel records Has It / Similar / No against an assignment, with optional note/photo; corrections append a reply linked through `supersedes_reply_id`
- [ ] Status logic uses current replies only: first assignment sent → `checking`; a releasable result enables an explicit release action; all active assignments No or an expired deadline enables admin-reviewed `not_found`
- [ ] Separate "Release exact" and "Release similar" actions with transactional locking/version checks and idempotency
- [ ] Manual showroom contact: copy the text and download/attach the processed image in WhatsApp Business. Do not paste a short-lived R2 URL that may expire before it is opened
- [ ] `/admin/showrooms`: add, edit, pause showrooms (name, area, address, phone, WhatsApp, Maps link, categories)
- [ ] `/admin/applications`: list "Join network" form submissions from `/for-showrooms` (replaces the current `alert()`)
- [ ] Simple dashboard: requests today, matches today, average time from assignment `sent_at` to its first current reply
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
- [ ] Integrate the approved WhatsApp authentication template and require verified phone ownership before production request submission
- [ ] `lib/whatsapp.ts`: enqueue a message with a unique idempotency key; the worker sends it and retries transient failures with backoff (maximum 3 attempts)
- [ ] Insert request state/result and its notification job in one database transaction so a crash cannot lose or duplicate the notification
- [ ] Send `request_received` after a verified request is committed
- [ ] Send `match_found` / `similar_found` when that result is released; send `not_found` only after the not-found decision is confirmed
- [ ] Webhook `GET/POST /api/webhooks/whatsapp`: verify the challenge and the POST signature against the raw body, acknowledge quickly, then process asynchronously
- [ ] Make webhook handling idempotent and tolerate duplicate/out-of-order sent, delivered, read and failed events
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
- [ ] Rate limits on presign, upload completion, OTP, request creation, tracking and login; combine IP/account/session keys and apply a 15-minute login lockout after 5 failures
- [ ] Security headers (Content-Security-Policy, HSTS, X-Content-Type-Options)
- [ ] CSRF protection for admin mutations, secure/HttpOnly/SameSite cookies, proxy-aware client IP handling, and authorization checks in every admin service/API
- [ ] Daily encrypted database backup to a separate R2 backup location (cron + `pg_dump` + `rclone`), keep 30 days; document that this alone does not back up photos
- [ ] Define photo recovery: enable an appropriate R2 object recovery/versioning or separate-copy policy, or explicitly accept that deleted R2 photos are not recoverable
- [ ] Retention jobs: delete temporary uploads after expiry, delete request photos 90 days after closure, anonymise shopper name/phone and message destinations after 12 months, expire verification records, and ensure cancelled/stale requests receive `closed_at`
- [ ] Redact phone numbers, tracking/assignment tokens and presigned URLs from application logs and Sentry
- [ ] Sentry alerts to your email; free uptime check (e.g. UptimeRobot) on the home page

### Legal pages
- [ ] Privacy policy (what is collected, why, how long it is kept, how to ask for deletion)
- [ ] Terms of use (photo usage for search only, no guarantee of availability)
- [ ] Optional: lawyer review — ₹10,000–20,000

### Testing
- [ ] Full flow on Android Chrome, iPhone Safari, Instagram in-app browser
- [ ] Wrong inputs: bad phone, huge photo, PDF, empty fields
- [ ] Two admins editing the same request
- [ ] Duplicate API submissions, worker restart during image processing/message sending, and duplicate/out-of-order WhatsApp webhooks
- [ ] Malicious files: fake MIME type, decompression bomb, corrupted HEIC and a reused/expired presigned URL
- [ ] Slow network (Chrome DevTools "Slow 3G")

### Done when
The checklist above is ticked, one database restore has worked, the documented photo-recovery policy has been tested or explicitly accepted, and concurrent/idempotency tests pass.

---

## Phase 6 — Pilot launch (weeks 6–8)

**Goal:** prove the service works with real people before spending more.

### Tasks
- [ ] Onboard 10–20 showrooms: explain the WhatsApp flow, save their numbers, agree on response time
- [ ] Soft launch: share with friends and family, then a small Instagram audience
- [ ] Admin handles each request daily; assignments record `sent_at` and replies record `created_at` automatically
- [ ] Record admin effort with a small start/finish timer or a sampled manual field; do not substitute total request age for admin minutes
- [ ] Ask the shopper for outcome feedback after a released match (visited / contacted / not interested); record it as an event
- [ ] Weekly review of the numbers below

### Measure
| Metric | Why it matters |
|---|---|
| Requests per day | Demand |
| % of sent assignments with a current reply within 6 hours of `sent_at` | Partner commitment |
| % of requests receiving an exact result; % receiving only a similar result | Core value without mixing two outcomes |
| Recorded active admin minutes per request | Operating cost; triggers Phase 7 when it is too high |
| % of matched shoppers who self-report contacting or visiting the showroom | Value to showrooms, needed for revenue later |

### Decision gate
Go to Phase 7 only if showrooms reply reliably and the admin time per request is the main bottleneck.

---

## Phase 7 — Automation (month 3–4)

**Goal:** cut admin time per request from ~10–15 minutes to ~2–3.

### Tasks
- [ ] Send one WhatsApp template per assignment with the request photo and three quick-reply buttons: Has It / Similar / No; each button payload identifies the assignment
- [ ] Webhook turns each button press idempotently into a `showroom_replies` row tied to that assignment
- [ ] Automatic showroom selection by area and category (and later by past reply rate)
- [ ] Throttle per showroom and queue excess assignments. If volume later requires an hourly digest, the digest must link to a reply page; do not combine multiple requests behind one ambiguous three-button set
- [ ] Reminder job: alert the admin if a request has no reply after 4 hours; send shopper an update at 6 hours
- [ ] Duplicate detection: same photo + same phone within 24 hours opens the existing request
- [ ] Tracking-link recovery/lookup by verified phone + WhatsApp OTP at `/t`

### Watch
Keep the wording transactional and message only opted-in showrooms. Template category and current pricing must be confirmed in Meta before implementation and reflected in the operating-cost model; do not assume approval or a fixed price multiple.

---

## Phase 8 — Showroom portal (month 4–5)

**Goal:** showrooms answer in a mobile-friendly page and add proof (photo, price, weight).

### Tasks
- [ ] Showroom login by WhatsApp OTP
- [ ] List only requests with a `showroom_assignments` row for the authenticated showroom (strict server-side access check on every query)
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
- [ ] Move to bigger hosting (managed database or a dedicated worker host) when one VPS is no longer enough

---

## Folder structure

```
jewelfind/
├─ app/
│  ├─ (site)/                 # /, how-it-works, for-showrooms, privacy, terms
│  ├─ t/[token]/              # private tracking page
│  ├─ admin/                  # requests, showrooms, applications, dashboard, login
│  ├─ showroom/               # Phase 8 portal
│  └─ api/
│     ├─ uploads/presign/
│     ├─ uploads/[id]/complete/
│     ├─ requests/
│     ├─ admin/...
│     └─ webhooks/whatsapp/
├─ components/
│  ├─ shopper/
│  ├─ admin/
│  └─ shared/
├─ lib/
│  ├─ db/                     # Drizzle schema + client
│  ├─ auth/
│  ├─ services/               # assignments, requests, matches, messages
│  ├─ r2.ts
│  ├─ whatsapp.ts
│  ├─ images.ts
│  ├─ status.ts               # transactional status rules
│  └─ validation.ts           # Zod schemas
├─ worker/                    # jobs, image processing, retries, retention
├─ db/migrations/
├─ scripts/                   # seed-reference-data.ts, create-admin.ts, backup.sh
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

**Totals:** a freelancer-built launch through Phase 6 is approximately ₹1.0–2.1 lakh including one year of running costs and optional legal review. Building both Phase 7 and Phase 8 in the same year raises that to approximately ₹2.0–4.1 lakh.

VPS and freelancer prices are typical market ranges; confirm before paying. WhatsApp, Cloudflare R2 and Google Maps prices come from their official pricing pages (October 2026).

---

## Not building yet

Native mobile apps · microservices · Kubernetes · SMS · paid search engines · multi-city · AI matching · paid hosting plans. Add each only when a real limit is hit.
