# JewelFind — Frontend-first Implementation Plan

## Purpose

Build a complete, responsive and production-quality frontend prototype using deterministic mock data and simulated asynchronous services. The prototype must support the shopper, admin and showroom experiences end-to-end without a backend, database, real authentication, object storage or external APIs.

The frontend will be designed around stable domain models and repository/service contracts. Screens consume those contracts through query and mutation hooks; they do not know whether the active implementation uses mock data or a future HTTP API.

## Scope rule

### Build now

- All public, shopper, admin and showroom screens described below.
- Responsive layouts, navigation, forms, validation and accessibility behavior.
- Realistic deterministic fixtures and a versioned browser-local mock store.
- Mock asynchronous services with latency, errors and mutations.
- Loading, empty, error, success, disabled and permission-denied presentations.
- A development-only scenario controller for exercising edge cases.
- Component, interaction and critical-flow tests that run without a backend.

### Do not build now

- A real database or migrations.
- Next.js API route handlers for product data.
- Real authentication, sessions, OTP delivery or authorization enforcement.
- Cloudflare R2 uploads, image processing or signed URLs.
- WhatsApp, Maps, Sentry, Turnstile or any other live integration.
- Docker/VPS deployment infrastructure or background workers.
- Real analytics, billing, AI matching or notification delivery.

Frontend controls that represent these capabilities must be functional simulations and visibly identified as demo behavior where a user could otherwise mistake them for real actions.

---

## 1. Application architecture

Use one Next.js App Router application with three interface areas:

```text
JewelFind frontend
├─ Public/shopper experience
│  ├─ Discovery and request submission
│  ├─ Mock phone verification
│  └─ Request tracking and released results
├─ Admin experience
│  ├─ Dashboard and operations
│  ├─ Requests, assignments and replies
│  ├─ Showrooms and applications
│  └─ Message/activity history
└─ Showroom experience
   ├─ Mock sign-in
   ├─ Assigned requests
   └─ Reply and profile flows
```

Use these architectural boundaries:

```text
Pages/components
      ↓
Feature hooks and query keys
      ↓
Repository/service interfaces
      ↓
Mock adapters now ────────────── HTTP/API adapters later
      ↓                              ↓
Versioned local mock store       Real backend
```

Rules:

- Components never import fixture files or access `localStorage` directly.
- Pages never call `fetch` directly.
- Feature hooks depend on repository interfaces, not mock implementations.
- Mock and future API adapters return the same domain results and normalized errors.
- Entity identifiers are opaque strings; the UI must not derive meaning from them.
- Store dates as ISO strings at the data boundary and format them only in presentation utilities.
- Filters and pagination are expressed as typed query objects so the future API can accept equivalent parameters.

### Recommended frontend libraries

- Next.js App Router, React and TypeScript with strict mode.
- Tailwind CSS for layout and design tokens.
- Accessible headless primitives for dialogs, menus, tabs, selects and toasts.
- TanStack Query for asynchronous queries, mutations, caching and retry behavior.
- React Hook Form plus Zod for forms and validation.
- `next/image` for fixture imagery and local object URLs for upload previews.
- Vitest and Testing Library for units/components; Playwright for critical flows.

Do not add a general global-state library initially. Use:

- URL search parameters for filter, search, pagination and selected-tab state.
- TanStack Query for server-like mock data.
- React Hook Form for form state.
- Local component state for dialogs, drawers and temporary UI state.
- A small context only for the active repository bundle and development scenario configuration.

---

## 2. Routes and screens

### Public and shopper routes

| Route | Screen | Required experience |
|---|---|---|
| `/` | Home and request entry | Hero, trust-safe content, how it works summary, request CTA, featured areas/categories, FAQ |
| `/request` | Request wizard | Photo, details, contact/consent, review and submit steps |
| `/request/verify` | Mock phone verification | Six-digit OTP, resend timer, wrong/expired code states |
| `/request/success/[code]` | Submission success | Request code, next steps, tracking CTA and simulated WhatsApp confirmation |
| `/track` | Tracking lookup | Phone/code entry and mock verification/recovery flow |
| `/t/[token]` | Private tracking | Timeline, showroom progress, result card, feedback and closed/cancelled states |
| `/how-it-works` | Process explanation | Shopper process, privacy explanation and FAQ |
| `/for-showrooms` | Partner landing | Benefits, operating flow, expectations and application form |
| `/for-showrooms/success` | Application success | Confirmation and expected follow-up |
| `/privacy` | Privacy policy UI | Structured readable policy placeholder clearly marked for legal review |
| `/terms` | Terms UI | Structured terms placeholder clearly marked for legal review |
| `/demo` | Demo guide | Demo credentials, scenario links and reset control; development/preview only |
| `not-found` | 404 | Recovery navigation and tracking/home shortcuts |
| global error | Unexpected error | Friendly error boundary with retry/home actions |

### Admin routes

| Route | Screen | Required experience |
|---|---|---|
| `/admin/login` | Mock admin login | Validation, incorrect credentials, loading and locked-demo states |
| `/admin` | Dashboard | Request metrics, SLA cards, activity feed and actionable queues |
| `/admin/requests` | Request list | Search, filters, sort, pagination, responsive table/cards, empty/error states |
| `/admin/requests/[id]` | Request workspace | Shopper/request summary, photo viewer, assignments, replies, matches, messages and audit timeline |
| `/admin/showrooms` | Showroom list | Search, area/category/status filters and add action |
| `/admin/showrooms/new` | Add showroom | Complete validated form with unsaved-change warning |
| `/admin/showrooms/[id]` | Showroom details | Profile, contact info, performance summary and recent assignments |
| `/admin/showrooms/[id]/edit` | Edit showroom | Validated editing, pause/reactivate confirmation and success state |
| `/admin/applications` | Application list | Status filters, review queue and empty/error states |
| `/admin/applications/[id]` | Application review | Applicant detail, approve/reject/request-info simulations and history |
| `/admin/activity` | Operational activity | Audit-style timeline with entity and actor filters |
| `/admin/messages` | Message center | Simulated queued/sent/delivered/read/failed records and retry action |
| `/admin/profile` | Demo admin profile | Profile presentation, notification preferences and mock logout |

### Showroom routes

| Route | Screen | Required experience |
|---|---|---|
| `/showroom/login` | Mock phone login | Phone, OTP, resend and error states |
| `/showroom` | Assignment inbox | New, replied and expired tabs with responsive request cards |
| `/showroom/requests/[id]` | Assignment detail | Shopper image, non-sensitive requirements, deadline and reply form |
| `/showroom/profile` | Profile | Hours, areas, categories and WhatsApp number editing simulation |

### Route behavior

- Public routes use the marketing shell.
- Admin routes use a protected-looking admin shell with mock session guards.
- Showroom routes use a separate mobile-first shell with mock session guards.
- Mock guards improve the demo flow but must never be described as real security.
- Unauthorized mock sessions redirect to the corresponding login page and preserve a safe return URL.
- Unknown, deleted or inaccessible entity IDs show a proper not-found/permission state rather than crashing.

---

## 3. Navigation and end-to-end flows

### Shopper request flow

1. Home CTA opens `/request`.
2. Shopper selects or drops an image.
3. Frontend validates type/size and simulates processing/upload progress.
4. Shopper enters jewellery requirements, budget, area, name and phone.
5. Shopper separately acknowledges privacy, WhatsApp updates and photo sharing.
6. Review step summarizes all entered information and allows editing each section.
7. Submit calls the mock request service and navigates to mock OTP verification.
8. Successful mock OTP creates the request in the browser-local store.
9. Success screen displays its code and private tracking link.
10. Tracking reflects the stored mock request and changes caused through admin/showroom simulations.

Preserve incomplete wizard state in session storage through a form-draft adapter. Clear it only after successful creation or an explicit discard action.

### Tracking flow

1. Shopper opens a seeded/private tracking URL or uses `/track` recovery.
2. Screen shows one of: submitted, checking, similar offered, matched, not found, closed or cancelled.
3. For open requests, show counts and progress without revealing unreleased showroom identities.
4. Released results show showroom information, map/WhatsApp simulation and available-piece imagery.
5. Feedback actions update the shared mock store and appear in the admin activity timeline.

### Admin operations flow

1. Mock login opens the dashboard.
2. Admin filters the queue and opens a request workspace.
3. Admin selects eligible showrooms and simulates sending assignments.
4. Admin records a reply manually or observes a reply entered through the showroom interface.
5. Admin previews and releases an exact/similar result or confirms not found.
6. The tracking page immediately reflects the change from the shared mock store.
7. Mock notification records appear in the message center with simulated delivery states.

### Showroom flow

1. Mock OTP login selects a seeded showroom identity.
2. Inbox lists only assignments for that showroom.
3. Showroom opens an assignment and responds Has It, Similar or No.
4. Has It/Similar reveals optional note, price, weight, purity and photo controls.
5. Submitted reply updates the admin request workspace through the same mock store.

### Partner application flow

1. Showroom completes the application on `/for-showrooms`.
2. Mock service stores it and shows confirmation.
3. Admin reviews it, changes status and optionally creates a showroom from the application.

---

## 4. Reusable component system

### Foundations

- Typography, spacing, radius, shadow, breakpoint and motion tokens.
- Existing palette: cream `#FFFBF2`, ink `#11100F`, gold `#E7C78E`, border `#E9DDC8`; use `#6B6560` or darker for small secondary text.
- Semantic colors for success, warning, danger and information with WCAG AA contrast.
- Shared icons with consistent size and accessible labels.

### Primitives

- Button, IconButton, LinkButton.
- Input, Textarea, Select, Combobox, Checkbox, RadioGroup and OTP input.
- FormField, FieldError, HelpText and required indicator.
- Card, Badge, StatusPill, Avatar/Logo mark, Separator and Tooltip.
- Dialog, AlertDialog, Drawer, DropdownMenu, Tabs and Popover.
- Toast, InlineAlert and Banner.
- Skeleton, Spinner, Progress, EmptyState and ErrorState.
- Table, Pagination, SearchInput and FilterBar.

### Domain components

- PhotoDropzone, PhotoPreview, PhotoGallery and MockUploadProgress.
- RequestCard, RequestSummary, RequestStatusTimeline and RequestCode.
- BudgetDisplay, AreaBadge and CategoryBadge.
- ShowroomCard, ShowroomPicker and ShowroomPerformanceCard.
- AssignmentList, AssignmentStatus and ReplyComposer.
- MatchCard and ReleaseResultDialog.
- MessageStatus, MessageTimeline and RetryMessageDialog.
- ConsentFields and PrivacySummary.
- MetricCard, ChartCard and ActivityTimeline.
- FeedbackPrompt and OutcomeBadge.

### Layout components

- MarketingHeader, MarketingFooter and MobileNavigation.
- AdminSidebar, AdminTopbar and AdminMobileDrawer.
- ShowroomHeader and ShowroomBottomNavigation.
- PageHeader, Breadcrumbs, DetailAside and StickyActionBar.

Every shared component must define keyboard behavior, focus behavior, disabled behavior, loading behavior and long-content handling before being considered complete.

---

## 5. Domain models and typed contracts

Keep domain models in a framework-independent folder. Initial entities:

- `AdminUser`
- `Showroom`
- `ShowroomApplication`
- `JewelleryRequest`
- `RequestPhoto`
- `ShowroomAssignment`
- `ShowroomReply`
- `Match`
- `MessageRecord`
- `ActivityEvent`
- `PhoneVerification`
- `ShopperFeedback`
- `DashboardMetrics`

Use explicit union types for state machines:

- Request: `submitted | checking | similar_offered | matched | not_found | closed | cancelled`
- Assignment: `draft | sent | viewed | replied | expired | cancelled`
- Reply: `has | similar | no`
- Message: `queued | sending | sent | delivered | read | failed`
- Application: `new | reviewing | approved | rejected | needs_info`

Shared query models:

- `PageRequest`, `PageResult<T>`
- `RequestFilters`, `ShowroomFilters`, `ApplicationFilters`
- `SortDirection`, typed sort fields
- `DateRange`

Service results use a normalized `AppError` shape with a stable code, user-safe message, optional field errors, retryability and optional cause for development logging.

Repository contracts should cover:

- `AuthRepository`
- `RequestRepository`
- `ShowroomRepository`
- `ApplicationRepository`
- `AssignmentRepository`
- `MessageRepository`
- `ActivityRepository`
- `DashboardRepository`
- `UploadRepository`

Mutation inputs must be separate types from stored entities. Do not pass UI form objects directly into repositories; map them through feature-level input mappers.

---

## 6. Mock data design

Create deterministic, normalized fixtures rather than embedding objects in components.

Minimum seed set:

- 2 admin identities.
- 15–20 showrooms across the supported Hyderabad areas and categories.
- 35–50 requests covering every request state, different budgets and creation times.
- Assignments covering sent, viewed, replied and expired conditions.
- Reply histories including corrected replies.
- Exact and similar released matches.
- 12–20 showroom applications across all review states.
- Message records covering every delivery status.
- Activity and shopper-feedback records.

Fixture rules:

- Use stable IDs and timestamps relative to a fixed seed clock so tests do not become flaky.
- Keep fixture image assets local to the repository and licensed/original; do not use remote avatar services or real jewellery brand assets.
- Include long names, missing optional values and edge cases for layout testing.
- Keep phone numbers visibly fictional and never use real personal data.
- Normalize relations by ID; repository selectors assemble view results.
- Store fixture schema version and reset browser data when incompatible changes occur.

The mock store may persist mutations in `localStorage` for demo continuity, but only the mock adapter may access it. Provide `resetDemoData()` and automatic recovery from malformed stored data.

---

## 7. Mock service/API layer

Implement repository interfaces with a `MockRepositoryBundle` selected by an application provider.

Mock behavior must include:

- Configurable latency with a realistic default range.
- Abort-signal support where practical.
- Typed filtering, sorting and pagination.
- Mutations that update the normalized store and invalidate relevant queries.
- Referential integrity checks, such as refusing a reply for an unknown assignment.
- Predictable normalized errors rather than arbitrary thrown strings.
- Idempotent request creation and result release simulations.
- Simulated upload progress, cancellation and validation failure.
- Simulated message-status progression without timers that make tests flaky.

Development-only scenarios:

- Normal data.
- Empty workspace.
- Slow connection.
- Offline/network failure.
- One failed request.
- Expired tracking token.
- Failed OTP/expired OTP.
- Failed upload.
- Failed message delivery.
- Concurrent-update/version-conflict simulation.
- Permission denied and missing entity.

The scenario controller must be excluded or inaccessible in the production build unless explicitly enabled by an environment flag.

Optional MSW handlers may be added for tests that benefit from an HTTP boundary, but UI code must still depend on repository contracts. Do not make mock HTTP endpoints the only source of truth.

---

## 8. State management and synchronization

- Create one query-key factory per feature.
- Query hooks own cache configuration and map repository results to UI-ready view data.
- Mutation hooks own invalidation and success/error notifications.
- Use conservative optimistic updates only where rollback is straightforward, such as pausing a showroom; use confirmed updates for result release and state transitions.
- Derive dashboard values in `MockDashboardRepository`, not separately inside dashboard components.
- Use URL parameters for admin filters so views are shareable and browser navigation works.
- Keep modal state out of URLs unless it represents a navigable detail.
- Prevent duplicate submissions while a mutation is pending.
- Show an unsaved-change confirmation when leaving dirty forms.
- Cross-interface changes use one browser-local store and a subscription mechanism so admin, shopper and showroom tabs remain consistent.

---

## 9. UI state coverage

Every data-backed screen must specify and implement:

- Initial loading skeleton that resembles the final layout.
- Background refreshing without replacing useful content with a blank spinner.
- First-use empty state with a relevant next action.
- Filtered-empty state with a clear-filters action.
- Recoverable error with retry.
- Permission-denied state.
- Missing/deleted entity state.
- Mutation-pending state with duplicate actions disabled.
- Mutation success feedback.
- Mutation failure that preserves entered form data.
- Offline state and reconnection action in the mock scenario.

Forms additionally cover pristine, dirty, submitting, submitted, invalid, server-field-error and unsaved-navigation states.

Use skeletons for page loading, small spinners only inside local actions, inline errors near affected content, and toasts for non-blocking confirmations.

---

## 10. Forms and validation

Create Zod schemas independent from page components and reuse them for form resolvers and future API-bound input parsing.

### Shopper request

- Image: JPEG/PNG/WebP/HEIC, maximum 10 MB; simulate processing and compression.
- Name: trimmed, 2–60 characters.
- Indian phone number normalized for display/service input.
- Area and category selected from typed reference data.
- Budget band mapped to optional numeric minimum/maximum values.
- Required explicit privacy, WhatsApp and photo-sharing acknowledgements.
- Review step before submission.

### OTP

- Six digits, paste support, auto-advance and accessible single-field fallback.
- Resend countdown, attempt limit, expired code and incorrect code states.
- Demo code displayed only on demo/preview builds.

### Showroom application/profile

- Business/contact name, phone, area, address, categories, opening hours, Maps URL and WhatsApp number.
- At least one category and valid contact channel.

### Assignment reply

- Reply choice required.
- Has It/Similar may include photo, price range, weight, purity and note.
- No reply hides those fields and asks for optional context.

### Admin actions

- Destructive or externally visible simulations require confirmation dialogs.
- Result-release dialog previews exactly what the shopper would see.
- Version-conflict scenario provides reload/review instead of silently overwriting.

---

## 11. Responsive design and accessibility

Design mobile-first, then enhance for tablet and desktop.

- Marketing pages: single-column mobile content with restrained maximum widths on desktop.
- Request wizard: full-page steps on mobile, centered card with progress rail on desktop.
- Admin: persistent sidebar on large screens, drawer on small screens.
- Admin tables: convert to prioritized cards below the tablet breakpoint; do not require horizontal scrolling for primary tasks.
- Request workspace: stacked sections on mobile, main/detail-aside layout on desktop.
- Showroom experience: optimized for one-handed mobile use with a bottom action area.
- Dialogs become bottom sheets/full-screen panels on narrow devices when appropriate.
- Sticky actions account for safe-area insets.
- Minimum interactive target of approximately 44×44 CSS pixels.
- Visible keyboard focus, logical heading order, labelled inputs and screen-reader announcements for async results.
- Respect reduced-motion preferences and do not use animation as the only status signal.
- Test at 320 px width, common phone widths, tablet portrait/landscape and desktop widths.
- Test long names, enlarged text and 200% browser zoom.

---

## 12. Future backend integration strategy

The replacement boundary is the repository bundle:

```text
Development/demo: RepositoryProvider(MockRepositoryBundle)
Future production: RepositoryProvider(HttpRepositoryBundle)
```

Backend integration should require:

1. Implementing the same repository interfaces using an HTTP client.
2. Adding DTO schemas and DTO-to-domain mappers.
3. Replacing the repository provider configuration.
4. Connecting real session/auth state to the existing auth interface.
5. Removing or disabling demo routes and mock credentials.

It should not require rewriting pages, forms or presentational components.

Integration rules:

- Centralize base URL, headers, request IDs, timeouts and error normalization in one HTTP client.
- Validate external responses at the boundary before mapping them to domain types.
- Never expose backend DTO naming directly to components.
- Preserve pagination/filter contracts where possible.
- Use signed upload orchestration behind `UploadRepository`; the dropzone interface remains unchanged.
- Put WhatsApp/message behavior behind `MessageRepository`; screens continue to display `MessageRecord`.
- Replace mock session guards with real server authorization before treating admin/showroom routes as secure.
- Keep mocks available for Storybook/tests/preview after the backend exists.

---

## 13. Recommended project structure

```text
jewelfind/
├─ app/
│  ├─ (marketing)/
│  │  ├─ page.tsx
│  │  ├─ how-it-works/
│  │  ├─ for-showrooms/
│  │  ├─ privacy/
│  │  └─ terms/
│  ├─ request/
│  │  ├─ page.tsx
│  │  ├─ verify/
│  │  └─ success/[code]/
│  ├─ track/
│  ├─ t/[token]/
│  ├─ admin/
│  │  ├─ login/
│  │  ├─ requests/
│  │  ├─ showrooms/
│  │  ├─ applications/
│  │  ├─ activity/
│  │  ├─ messages/
│  │  └─ profile/
│  ├─ showroom/
│  │  ├─ login/
│  │  ├─ requests/[id]/
│  │  └─ profile/
│  ├─ demo/
│  ├─ error.tsx
│  └─ not-found.tsx
├─ src/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layouts/
│  │  └─ domain/
│  ├─ domain/
│  │  ├─ models/
│  │  ├─ repositories/
│  │  ├─ errors/
│  │  └─ reference-data/
│  ├─ features/
│  │  ├─ requests/
│  │  ├─ tracking/
│  │  ├─ showrooms/
│  │  ├─ applications/
│  │  ├─ assignments/
│  │  ├─ messages/
│  │  ├─ dashboard/
│  │  └─ auth/
│  ├─ data/
│  │  ├─ mock/
│  │  │  ├─ fixtures/
│  │  │  ├─ repositories/
│  │  │  ├─ scenarios/
│  │  │  └─ store/
│  │  └─ http/                 # interfaces/placeholders only until backend phase
│  ├─ providers/
│  ├─ validation/
│  ├─ styles/
│  ├─ test/
│  └─ utils/
├─ public/
│  └─ mock-images/
├─ e2e/
└─ FRONTEND_IMPLEMENTATION_PLAN.md
```

Feature folders may contain hooks, query keys, form mappers and feature-specific components. Generic primitives stay in `components/ui`; repository implementations stay in `data`.

---

## 14. Implementation sequence

### Stage F0 — Confirm experience and visual direction

- [ ] Confirm routes, supported areas/categories, result-release policy and demo identities.
- [ ] Inventory reusable content from the existing HTML prototype.
- [ ] Approve mobile and desktop navigation structure.
- [ ] Approve palette, typography and component styling direction.
- [ ] Define frontend acceptance criteria and target browsers.

### Stage F1 — Frontend foundation

- [ ] Scaffold Next.js, TypeScript strict mode, Tailwind, linting and tests.
- [ ] Add fonts, design tokens, global styles and application providers.
- [ ] Build primitives and marketing/admin/showroom shells.
- [ ] Add global error, not-found, toast and responsive navigation behavior.
- [ ] Establish accessibility and visual-regression checks.

### Stage F2 — Domain and mock platform

- [ ] Implement domain models, state unions, query types and normalized errors.
- [ ] Define repository interfaces and provider injection.
- [ ] Build deterministic fixtures, versioned store and reset behavior.
- [ ] Build mock repositories with latency, pagination, filtering and mutations.
- [ ] Add scenario controller and shared query/mutation conventions.

### Stage F3 — Public and request experience

- [ ] Home, how-it-works, partner, privacy and terms pages.
- [ ] Multi-step request wizard and mock upload.
- [ ] Mock OTP, submission success and draft recovery.
- [ ] Partner application and success flow.
- [ ] Mobile, validation and accessibility testing.

### Stage F4 — Tracking experience

- [ ] Tracking lookup/recovery.
- [ ] Every request-state presentation.
- [ ] Released exact/similar result cards.
- [ ] Shopper feedback and closed/cancelled states.
- [ ] Expired, invalid and permission-error scenarios.

### Stage F5 — Admin experience

- [ ] Mock admin login and session presentation.
- [ ] Dashboard and activity feed.
- [ ] Request list and complete request workspace.
- [ ] Assignment, reply and result-release simulations.
- [ ] Showroom CRUD UI and pause/reactivate behavior.
- [ ] Application review, message center and profile.

### Stage F6 — Showroom experience

- [ ] Mock showroom login/OTP.
- [ ] Assignment inbox and detail.
- [ ] Has It/Similar/No reply flows.
- [ ] Profile editing and responsive mobile polish.
- [ ] Verify that replies appear correctly in admin and tracking flows.

### Stage F7 — State completeness and quality

- [ ] Exercise every loading, empty, error, success and conflict scenario.
- [ ] Keyboard and screen-reader pass.
- [ ] Responsive pass at defined breakpoints and zoom levels.
- [ ] Cross-browser pass on Chrome, Safari and Firefox plus mobile devices.
- [ ] Performance pass for images, route bundles and layout stability.
- [ ] Remove false claims, real brands and misleading production behavior.
- [ ] Complete unit/component tests and Playwright critical flows.

### Stage F8 — Frontend sign-off

- [ ] Demonstrate shopper request-to-tracking flow.
- [ ] Demonstrate admin assignment-to-result flow.
- [ ] Demonstrate showroom reply-to-admin synchronization.
- [ ] Reset demo and reproduce all flows from clean data.
- [ ] Record deferred backend integration tasks and API contract questions.
- [ ] Obtain explicit approval before starting backend implementation.

---

## Critical automated flows

At minimum, Playwright should cover:

1. Shopper completes a request, verifies mock OTP and opens tracking.
2. Admin assigns showrooms, records an exact reply and releases it.
3. Shopper tracking displays the released showroom result.
4. Showroom submits a Similar reply and admin sees it.
5. Partner application appears in the admin review queue.
6. Request list filters and pagination survive refresh through URL state.
7. Failed upload, expired OTP, failed mutation and retry paths preserve user input.
8. Mock data reset returns the application to its deterministic seed state.

---

## Frontend completion criteria

The frontend-only milestone is complete when:

- Every route and end-to-end flow above is implemented with mock data.
- No screen imports fixtures, calls `localStorage` or performs data fetching directly.
- Mock mutations remain consistent across shopper, admin and showroom interfaces.
- Every data-backed screen has loading, empty, error and populated states.
- Forms have client validation, pending behavior, failure recovery and success feedback.
- Mobile, keyboard and accessibility reviews pass.
- Critical automated flows pass without network access or a backend.
- The demo can be reset to a deterministic initial state.
- Switching to a future `HttpRepositoryBundle` will not require screen/component rewrites.
- No backend, database or real external integration has been introduced.
