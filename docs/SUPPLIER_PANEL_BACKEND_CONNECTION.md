# Supplier Panel – Backend Connection Status

This document lists every API call made by the supplier panel and whether it is implemented in the **local backend** (`backend/`) and expected from the **Vercel backend** (live view).

## Summary

| Area | Endpoints | Local backend | Vercel (live) |
|------|-----------|---------------|---------------|
| Dashboard | 4 | ✅ All | Must implement same |
| Analytics | 1 | ✅ | Must implement |
| Bookings | 2 | ✅ All | Must implement |
| Experience | 4 | ✅ All | Must implement |
| Requests | 2 | ✅ All | Must implement |
| Profile | 3 | ✅ All | Must implement |

**Result:** The supplier panel is **fully connected** to the local backend. For live view (Vercel), the deployed backend must expose the same endpoints and response shapes below.

---

## Endpoint List

### Dashboard (`supplier-dashboard.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/analytics/supplier` | `{ overview?, totalRevenue?, travelerStats?, ... }` | ✅ | |
| GET | `/bookings/supplier?limit=5` | `{ bookings: [...] }` | ✅ | |
| GET | `/activities/supplier` | Array or `{ activities }` | ✅ | |
| GET | `/bookings/supplier?status=pending` | `{ bookings: [...] }` | ✅ | |
| DELETE | `/activities/drafts/:id` | 204 or success | ✅ | Remove draft |

### Analytics (`supplier-analytics.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/analytics/supplier` | `{ revenueTrend[], bookingsByExperience[] }` | ✅ | Same as dashboard |

### Bookings (`supplier-bookings.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/bookings/supplier` | `{ bookings: [...] }` | ✅ | |
| GET | `/activities/drafts` | `{ drafts: [...] }` | ✅ | |

### Experience (`supplier-experience.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/activities/supplier` | Array of activities | ✅ | |
| POST | `/activities` | Created activity object | ✅ | Body: title, location, days, nights, capacity, category, description, price, image |
| PUT | `/activities/:id` | Updated activity | ✅ | |
| DELETE | `/activities/:id` | 204 or success | ✅ | |

### Requests (`supplier-requests.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/bookings/supplier?status=pending` | `{ bookings: [...] }` | ✅ | |
| PATCH | `/bookings/:id/status` | Updated booking | ✅ | Body: `{ status: "Confirmed" \| "Rejected" }` |

### Profile (`supplier-profile.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| GET | `/auth/me` | `{ name, email, phone, address, about, image }` | ✅ | |
| GET | `/supplier/profile` | `{ businessName?, contactEmail?, ... documents? }` | ✅ | Optional merge with auth/me |
| PUT | `/supplier/profile` | Updated profile | ✅ | Body: form fields |

### Generate Itinerary (`supplier-generate-itinerary.jsx`)

| Method | Endpoint | Response expected | Local | Notes |
|--------|----------|-------------------|-------|-------|
| (none) | — | — | — | No API calls in this file |

---

## Response Shapes (for Vercel backend)

- **GET /api/analytics/supplier**  
  `totalRevenue`, `revenueTrend` (array of `{ month, value }`), `bookingsByExperience` (array of `{ label, value }`), `overview`, `travelerStats`, `pendingRequests`, `acceptedRequests`, `rejectedRequests`, etc.

- **GET /api/bookings/supplier**  
  `{ bookings: [{ id or _id, experience, title, name, guests, status, date, ... }] }`

- **GET /api/activities/supplier**  
  Array of `{ _id, id, title, description, price, duration, capacity, image, ... }`

- **GET /api/activities/drafts**  
  `{ drafts: [...] }`

- **GET /api/auth/me**  
  `{ id, name, email, phone, address, about, image }`

- **GET /api/supplier/profile**  
  `{ businessName, contactEmail, phoneNumber, businessAddress, aboutBusiness, image, documents? }`

- **PUT /api/supplier/profile**  
  Same shape as GET; returns updated profile.

- **POST /api/activities**  
  Request body: `title, location, days, nights, capacity, category, description, price, image`.  
  Response: created activity with `_id` / `id`.

- **PUT /api/activities/:id**  
  Same body as POST. Response: updated activity.

- **DELETE /api/activities/:id**  
  Response: 204 or success.

- **DELETE /api/activities/drafts/:id**  
  Response: 204 or success.

- **PATCH /api/bookings/:id/status**  
  Body: `{ status }`. Response: updated booking.

---

## Frontend fix applied

- **Supplier Profile:** Added missing `isEditing` state (`useState(false)`) so Edit / Save works correctly.

---

## How to verify

1. **Local backend:** From project root, run `cd backend && npm start`, then in frontend set `VITE_API_URL=http://localhost:5000/api` in `.env.local` and run the app. Exercise Dashboard, Analytics, Bookings, Experience, Requests, and Profile.
2. **Vercel (live):** Do not set `VITE_API_URL` so the app uses `https://kufi-backend-new1.vercel.app/api`. Ensure the Vercel backend implements every endpoint above with the same paths and response shapes.
