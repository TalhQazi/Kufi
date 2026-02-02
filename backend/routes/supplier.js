/**
 * Supplier dashboard API routes.
 * Mount at /api (e.g. app.use('/api', supplierRoutes))
 */

const express = require('express');
const {
  getSupplierId,
  getAnalytics,
  getBookings,
  getActivities,
  getDrafts,
  updateBookingStatus,
  createActivity,
  updateActivity,
  deleteActivity,
  deleteDraft,
  getAuthMe,
  getSupplierProfile,
  updateSupplierProfile,
  getCountries,
  getCities,
  getCategories,
} = require('../data/store');

const router = express.Router();

// ——— Countries, cities, categories (for supplier add-experience destination & category) ———
// GET /api/countries
router.get('/countries', (req, res) => {
  try {
    const countries = getCountries();
    res.json(Array.isArray(countries) ? countries : []);
  } catch (err) {
    console.error('GET /countries', err);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// GET /api/cities — optional ?country=id to filter by country
router.get('/cities', (req, res) => {
  try {
    const countryId = req.query.country || undefined;
    const cities = getCities(countryId);
    res.json(Array.isArray(cities) ? cities : []);
  } catch (err) {
    console.error('GET /cities', err);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

// GET /api/categories
router.get('/categories', (req, res) => {
  try {
    const categories = getCategories();
    res.json(Array.isArray(categories) ? categories : []);
  } catch (err) {
    console.error('GET /categories', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/analytics/supplier — dashboard stats + analytics page data
router.get('/analytics/supplier', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const data = getAnalytics(supplierId);
    res.json(data);
  } catch (err) {
    console.error('GET /analytics/supplier', err);
    res.status(500).json({ error: 'Failed to fetch supplier analytics' });
  }
});

// GET /api/bookings/supplier?limit=5&status=pending
router.get('/bookings/supplier', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const status = req.query.status || undefined;
    const bookings = getBookings(supplierId, { limit, status });
    res.json({ bookings });
  } catch (err) {
    console.error('GET /bookings/supplier', err);
    res.status(500).json({ error: 'Failed to fetch supplier bookings' });
  }
});

// GET /api/activities/supplier — list experiences for supplier
router.get('/activities/supplier', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const activities = getActivities(supplierId);
    res.json(activities);
  } catch (err) {
    console.error('GET /activities/supplier', err);
    res.status(500).json({ error: 'Failed to fetch supplier activities' });
  }
});

// GET /api/activities/drafts — drafts for supplier (used by supplier-bookings page)
router.get('/activities/drafts', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const drafts = getDrafts(supplierId);
    res.json({ drafts });
  } catch (err) {
    console.error('GET /activities/drafts', err);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// PATCH /api/bookings/:id/status — update booking status (supplier requests)
router.patch('/bookings/:id/status', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const booking = updateBookingStatus(req.params.id, req.body.status, supplierId);
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (err) {
    console.error('PATCH /bookings/:id/status', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// ——— Auth & Profile (supplier panel profile page) ———
// GET /api/auth/me
router.get('/auth/me', (req, res) => {
  try {
    const user = getAuthMe();
    res.json(user);
  } catch (err) {
    console.error('GET /auth/me', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/supplier/profile
router.get('/supplier/profile', (req, res) => {
  try {
    const profile = getSupplierProfile();
    res.json(profile);
  } catch (err) {
    console.error('GET /supplier/profile', err);
    res.status(500).json({ error: 'Failed to fetch supplier profile' });
  }
});

// PUT /api/supplier/profile
router.put('/supplier/profile', (req, res) => {
  try {
    const profile = updateSupplierProfile(req.body);
    res.json(profile);
  } catch (err) {
    console.error('PUT /supplier/profile', err);
    res.status(500).json({ error: 'Failed to update supplier profile' });
  }
});

// ——— Activities CRUD (supplier experience page) ———
// POST /api/activities
router.post('/activities', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const activity = createActivity(req.body, supplierId);
    res.status(201).json(activity);
  } catch (err) {
    console.error('POST /activities', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// PUT /api/activities/:id
router.put('/activities/:id', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const activity = updateActivity(req.params.id, req.body, supplierId);
    if (activity) {
      res.json(activity);
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (err) {
    console.error('PUT /activities/:id', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// DELETE /api/activities/:id
router.delete('/activities/:id', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const deleted = deleteActivity(req.params.id, supplierId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (err) {
    console.error('DELETE /activities/:id', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// DELETE /api/activities/drafts/:id
router.delete('/activities/drafts/:id', (req, res) => {
  try {
    const supplierId = getSupplierId(req);
    const deleted = deleteDraft(req.params.id, supplierId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Draft not found' });
    }
  } catch (err) {
    console.error('DELETE /activities/drafts/:id', err);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

module.exports = router;
