/**
 * Kufi supplier dashboard backend.
 * Run in same IDE as frontend: npm run start (from backend folder).
 * Frontend: set VITE_API_URL=http://localhost:5000/api in .env.local
 */

const express = require('express');
const cors = require('cors');
const { authOptional } = require('./middleware/auth');
const supplierRoutes = require('./routes/supplier');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Optional auth: sets req.user from Bearer token
app.use(authOptional);

// Mount supplier dashboard API at /api
app.use('/api', supplierRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Kufi supplier API' });
});

app.listen(PORT, () => {
  console.log(`Kufi supplier backend running at http://localhost:${PORT}`);
  console.log(`  API base: http://localhost:${PORT}/api`);
  console.log(`  Endpoints: GET /api/analytics/supplier, /api/bookings/supplier, /api/activities/supplier, /api/activities/drafts`);
});
