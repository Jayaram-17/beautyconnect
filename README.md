# Beauty Connect Pro

Makeup Artist Marketplace — System Design

Companion to schema.prisma. Covers API architecture, mobile navigation, roles & permissions, booking flow, subscription logic, notification architecture, and project folder structure.

1. Roles & Permissions

Three roles, enforced server-side on every request via JWT claims — never trust role/subscription flags sent from the client.

Capability Customer Artist Admin Browse/search artists ✅ ✅ ✅ Create booking ✅ ❌ ❌ Accept/reject booking ❌ own only ✅ (override) Manage own services/gallery/availability ❌ own only ✅ Leave review ✅ (own completed bookings) ❌ ❌ View any user's phone number ❌ own ✅ Verify artist ❌ ❌ ✅ Suspend user ❌ ❌ ✅ Manage subscriptions/payments ❌ own (read) ✅ (full)

Middleware stack (Express): authenticate (verify Firebase JWT → attach req.user) → requireRole(['ARTIST']) → requireOwnership (e.g. artist can only edit their own ArtistProfile.id) → route handler. Admin routes live under a separate /api/admin/* prefix, gated by requireRole(['ADMIN']).

2. API Architecture

REST, versioned under /api/v1. JSON in/out. Auth via Authorization: Bearer <firebase-jwt>.

Auth

POST   /auth/otp/send            { phone }
POST   /auth/otp/verify          { phone, code } -> { token, user }
POST   /auth/google               { idToken } -> { token, user }
POST   /auth/register             { role, name, ...profileFields }
POST   /auth/logout
GET    /auth/me


Customers

GET    /customers/me
PATCH  /customers/me
GET    /customers/me/favorites
POST   /customers/me/favorites/:artistId
DELETE /customers/me/favorites/:artistId
GET    /customers/me/bookings?status=upcoming|completed|cancelled


Artists (discovery — public)

GET    /artists                       ?city=&service=&priceMin=&priceMax=&rating=&distance=&sort=
GET    /artists/:id
GET    /artists/:id/services
GET    /artists/:id/packages
GET    /artists/:id/gallery
GET    /artists/:id/reviews
GET    /artists/:id/availability?date=


Artists (self-management — requires ARTIST role)

GET    /artists/me
PATCH  /artists/me
POST   /artists/me/gallery
DELETE /artists/me/gallery/:imageId
POST   /artists/me/services
PATCH  /artists/me/services/:id
DELETE /artists/me/services/:id
POST   /artists/me/packages
PATCH  /artists/me/packages/:id
GET    /artists/me/availability
POST   /artists/me/availability/block      { date, startTime, endTime }
DELETE /artists/me/availability/:slotId
GET    /artists/me/dashboard               // aggregated stats
GET    /artists/me/bookings?status=
PATCH  /artists/me/bookings/:id/accept
PATCH  /artists/me/bookings/:id/reject     { reason }


Bookings

POST   /bookings                { artistId, serviceIds[], packageId?, date, startTime, eventLocation, notes }
GET    /bookings/:id
PATCH  /bookings/:id/cancel     { reason }
POST   /bookings/:id/pay        -> creates Razorpay order
POST   /bookings/:id/pay/verify { razorpayOrderId, razorpayPaymentId, razorpaySignature }


Double-booking prevention: creating a booking wraps the availability-slot check + insert in a DB transaction with a unique constraint on (artistId, date, startTime) on AvailabilitySlot — a second concurrent request fails at the DB level, not just in app logic.

Reviews

POST   /bookings/:id/review     { rating, comment, photos[] }   // only if booking.status = COMPLETED and no existing review


Subscriptions (Artist)

GET    /subscriptions/me
POST   /subscriptions/upgrade   -> creates Razorpay order for premium plan
POST   /subscriptions/upgrade/verify
POST   /subscriptions/cancel


Chat

GET    /conversations
GET    /conversations/:id/messages
POST   /conversations/:id/messages   { text?, imageUrl? }
PATCH  /conversations/:id/read


Notifications

GET    /notifications
PATCH  /notifications/:id/read


Admin

GET    /admin/artists?verification=pending
PATCH  /admin/artists/:id/verify        { status, rejectionReason? }
GET    /admin/users
PATCH  /admin/users/:id/suspend
GET    /admin/bookings
GET    /admin/subscriptions
GET    /admin/reports
PATCH  /admin/reports/:id               { status, resolutionNote }
DELETE /admin/gallery/:imageId
GET    /admin/analytics


Response shape convention:

{ "success": true, "data": { ... }, "meta": { "page": 1, "totalPages": 4 } }
{ "success": false, "error": { "code": "BOOKING_SLOT_TAKEN", "message": "..." } }


3. Booking Flow

1. Customer selects artist → GET /artists/:id/availability?date=
2. Customer selects service(s)/package → client computes totalPrice, advanceAmount (e.g. 20%)
3. POST /bookings (status: PENDING)
     └─ server locks the requested AvailabilitySlot row (status → BOOKED, tentative)
     └─ Notification → artist: "New booking request received"
4. Artist: PATCH /bookings/:id/accept  or  /reject
     ├─ accept → status: ACCEPTED → Notification → customer: prompts payment
     └─ reject → status: REJECTED → slot released (status → AVAILABLE) → Notification → customer
5. Customer: POST /bookings/:id/pay → Razorpay order → POST /pay/verify
     └─ on verified signature → Booking.status: CONFIRMED, Payment.status: PAID
     └─ Notification → both: booking confirmed
6. Scheduled jobs (see §5) send 1-day and 2-hour reminders
7. After appointment time passes → status: COMPLETED (cron or artist marks complete)
     └─ Customer prompted to leave a review
8. Cancellation (either party, before COMPLETED) → PATCH /bookings/:id/cancel
     └─ slot released, Notification → other party


State machine: PENDING → (ACCEPTED | REJECTED); ACCEPTED → CONFIRMED (on payment); CONFIRMED → COMPLETED; any of PENDING/ACCEPTED/CONFIRMED → CANCELLED. No other transitions are valid — enforce with a lookup table in the service layer, not scattered if/else.

4. Subscription Logic

Subscription is 1:1 with ArtistProfile, defaults to FREE on artist registration (created in the same transaction as ArtistProfile).

Upgrade: client hits /subscriptions/upgrade → server creates a Razorpay order → client completes payment → /subscriptions/upgrade/verify validates the Razorpay signature server-side → sets plan: PREMIUM, expiresAt: now + 30 days, status: ACTIVE.

A daily cron job (checkExpiredSubscriptions) flips any Subscription where expiresAt < now to status: EXPIRED, plan: FREE.

Gating pattern: every endpoint/serializer that exposes a premium feature (phone number, WhatsApp button, featured placement, analytics) checks subscription.plan === 'PREMIUM' && subscription.status === 'ACTIVE' on the server before including that field in the response. The mobile app never decides this — it just renders what the API sends. This directly satisfies the "never trust client-sent subscription status" requirement.

Search ranking boost: GET /artists sort adds +N to relevance score where subscription.plan === 'PREMIUM', computed server-side in the query/ranking function.

5. Notification Architecture

Two channels, both driven from a single internal NotificationService.send(userId, type, title, body, data):

Writes a row to Notification (in-app history).

Pushes via FCM (or Expo Notifications) if the user has a registered push token.

Trigger points (event-driven, in the request handler that changes state):

Booking created → notify artist

Booking accepted/rejected → notify customer

Booking cancelled → notify the other party

New chat message → notify recipient (if not actively viewing conversation)

Subscription expiring in 3 days / expired → notify artist

Scheduled (cron, e.g. node-cron or a queue like BullMQ on Redis):

Every 15 min: query bookings where status = CONFIRMED and appointment is ~24h away and reminder not yet sent → send "tomorrow at X" reminder, flag sent.

Every 15 min: same for ~2h-away window.

Daily: expire subscriptions (§4).

Daily: auto-mark bookings COMPLETED once date + endTime has passed and status was CONFIRMED.

A remindersSent string array (or two boolean columns) on Booking prevents duplicate reminders — add this field if not already covered by revisiting the schema.

6. Mobile Navigation (Expo Router)

app/
├─ (auth)/
│   ├─ login.tsx
│   ├─ otp-verify.tsx
│   └─ register.tsx
├─ (customer)/
│   ├─ _layout.tsx                 # bottom tab navigator
│   ├─ home/
│   │   └─ index.tsx
│   ├─ search/
│   │   ├─ index.tsx
│   │   └─ filters.tsx
│   ├─ bookings/
│   │   ├─ index.tsx
│   │   └─ [bookingId].tsx
│   ├─ favorites/
│   │   └─ index.tsx
│   └─ profile/
│       ├─ index.tsx
│       └─ edit.tsx
├─ (artist)/
│   ├─ _layout.tsx                 # bottom tab navigator (different tab set)
│   ├─ dashboard/
│   │   └─ index.tsx
│   ├─ bookings/
│   │   ├─ index.tsx
│   │   └─ [bookingId].tsx
│   ├─ calendar/
│   │   └─ index.tsx
│   ├─ services/
│   │   ├─ index.tsx
│   │   └─ [serviceId].tsx
│   ├─ gallery/
│   │   └─ index.tsx
│   ├─ subscription/
│   │   └─ index.tsx
│   └─ profile/
│       ├─ index.tsx
│       └─ edit.tsx
├─ artist/
│   └─ [artistId].tsx               # public artist profile (shared route, customer-facing)
├─ chat/
│   └─ [conversationId].tsx
├─ booking/
│   └─ new.tsx                      # booking creation flow (multi-step)
├─ notifications/
│   └─ index.tsx
└─ _layout.tsx                      # root: auth gate, decides (auth) vs (customer) vs (artist) stack


Root _layout.tsx reads the authenticated user's role from the JWT/session and routes into the (customer) or (artist) group; unauthenticated users land in (auth). Admin is a separate web dashboard (Next.js), not part of this Expo app.

7. Backend Folder Structure

backend/
├─ src/
│   ├─ config/                # env loading, firebase-admin init, cloudinary init, razorpay init
│   ├─ middleware/             # authenticate, requireRole, requireOwnership, rateLimiter, validate
│   ├─ modules/
│   │   ├─ auth/               # controller, service, routes, dto/validation schemas
│   │   ├─ customers/
│   │   ├─ artists/
│   │   ├─ services/
│   │   ├─ packages/
│   │   ├─ gallery/
│   │   ├─ availability/
│   │   ├─ bookings/
│   │   ├─ payments/
│   │   ├─ subscriptions/
│   │   ├─ reviews/
│   │   ├─ favorites/
│   │   ├─ notifications/
│   │   ├─ chat/
│   │   └─ admin/
│   ├─ jobs/                   # cron/queue definitions (reminders, expirations, auto-complete)
│   ├─ lib/                    # prisma client singleton, fcm client, razorpay client, cloudinary uploader
│   ├─ utils/
│   ├─ app.ts                  # express app assembly
│   └─ server.ts               # entrypoint
├─ prisma/
│   ├─ schema.prisma
│   └─ migrations/
├─ .env.example
└─ package.json


Each modules/<name>/ follows: <name>.routes.ts, <name>.controller.ts, <name>.service.ts (business logic + Prisma calls), <name>.validation.ts (zod schemas). Controllers stay thin; services own logic and are unit-testable without an HTTP layer.

8. Mobile App Folder Structure

mobile/
├─ app/                        # Expo Router routes (see §6)
├─ components/
│   ├─ ui/                     # buttons, cards, inputs — design system primitives
│   ├─ artist/                 # ArtistCard, ArtistProfileHeader, GalleryGrid
│   ├─ booking/                # BookingCard, BookingStepper
│   └─ chat/
├─ hooks/                      # useAuth, useArtist, useBookings, etc. (react-query wrappers)
├─ services/api/                # typed API client, one file per backend module
├─ store/                      # lightweight global state (auth/session) — Zustand or Context
├─ types/                      # shared TS types (mirrors backend DTOs)
├─ theme/                      # colors, typography, spacing tokens
├─ utils/
└─ app.config.ts


9. Next Step

This design is the reference point for Phase 1 MVP implementation: Auth → Customer/Artist profiles → Gallery/Services → Search → Availability → Booking → Booking management → Push notifications → Reviews (per the phased plan in the prompt). Ready to start scaffolding the backend (modules/auth first, since everything else depends on it) whenever you want to proceed.

## Booking reminders

The booking page saves the customer-selected `appointment_date` and
`appointment_time`. Vercel calls `GET /api/reminders/run` every 15 minutes from
the `vercel.json` configuration. Set `CRON_SECRET` in Vercel; it is passed as
an authorization bearer token automatically. The `sendBookingReminders()`
function sends in-app reminders in 15-minute windows around 24 hours and 2
hours before the selected booking time; `reminder_logs` makes each reminder
idempotent.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9ae6130c-4ccd-4059-a91d-3299a9fb9472).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
