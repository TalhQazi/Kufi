# Kufi Supplier Dashboard Backend

Runs in the same IDE as the frontend. Provides API used by the supplier dashboard. **Supplier panel is fully connected** to this backend; see `docs/SUPPLIER_PANEL_BACKEND_CONNECTION.md` for the full list and response shapes.

## Endpoints (base: `/api`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/supplier` | Dashboard stats + analytics (overview, travelerStats, revenueTrend, bookingsByExperience) |
| GET | `/bookings/supplier` | Supplier bookings. Query: `?limit=5`, `?status=pending` |
| GET | `/activities/supplier` | Supplier experiences (array) |
| GET | `/activities/drafts` | Draft activities. Response: `{ drafts: [] }` |
| DELETE | `/activities/drafts/:id` | Delete a draft |
| POST | `/activities` | Create experience. Body: title, location, days, capacity, description, price, image, etc. |
| PUT | `/activities/:id` | Update experience |
| DELETE | `/activities/:id` | Delete experience |
| PATCH | `/bookings/:id/status` | Update booking status. Body: `{ status: "Confirmed" \| "Rejected" }` |
| GET | `/auth/me` | Current user. Response: `{ name, email, phone, address, about, image }` |
| GET | `/supplier/profile` | Supplier profile |
| PUT | `/supplier/profile` | Update supplier profile |

## Run locally (same IDE as frontend)

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:5000`. Then in the frontend repo create `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

Restart the frontend dev server so the supplier dashboard uses this backend.

## Data

- **In-memory store** is in `data/store.js` (sample activities and bookings). Replace with your MongoDB/DB calls for production.
- **Auth**: `middleware/auth.js` reads `Authorization: Bearer <token>` and sets `req.user`. For production, verify JWT with your secret and set `req.user.supplierId` from the token.

## Wiring to your real backend

If you already have a backend (e.g. on Vercel), copy the logic from:

- `routes/supplier.js` — route handlers
- `data/store.js` — replace `getActivities`, `getBookings`, `getAnalytics`, `getDrafts`, `updateBookingStatus` with your DB queries (e.g. Mongoose, Prisma).

Response shapes expected by the frontend:

- **GET /api/analytics/supplier**: `{ totalRevenue?, overview?, travelerStats?, revenueTrend?, bookingsByExperience?, ... }`
- **GET /api/bookings/supplier**: `{ bookings: [{ id/_id, experience, name, guests, status, date, ... }] }`
- **GET /api/activities/supplier**: array of activities or `{ activities: [] }`
- **GET /api/activities/drafts**: `{ drafts: [] }`
- **PATCH /api/bookings/:id/status**: updated booking object or `{ status }`
