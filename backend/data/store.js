/**
 * In-memory store for supplier dashboard data.
 * Replace with MongoDB/DB calls in production (e.g. connect to your existing DB).
 */

const store = {
  // Supplier id from JWT; all data is scoped to this when using auth
  defaultSupplierId: 'supplier-1',

  activities: [
    {
      _id: 'act-1',
      title: 'Mountain Trek Experience',
      description: 'Guided trek through scenic trails.',
      price: 299,
      duration: '4 hours',
      capacity: 12,
      rating: 4.8,
      image: '/assets/activity1.jpeg',
      supplierId: 'supplier-1',
    },
    {
      _id: 'act-2',
      title: 'City Food Tour',
      description: 'Taste local cuisine with a guide.',
      price: 89,
      duration: '3 hours',
      capacity: 8,
      rating: 4.6,
      image: '/assets/food-tour.jpeg',
      supplierId: 'supplier-1',
    },
  ],

  bookings: [
    {
      _id: 'book-1',
      id: 'book-1',
      experience: 'Mountain Trek Experience',
      title: 'Mountain Trek Experience',
      name: 'John Doe',
      guests: 2,
      status: 'Confirmed',
      date: '2025-02-15',
      supplierId: 'supplier-1',
    },
    {
      _id: 'book-2',
      id: 'book-2',
      experience: 'City Food Tour',
      title: 'City Food Tour',
      name: 'Jane Smith',
      guests: 4,
      status: 'Pending',
      date: '2025-02-20',
      supplierId: 'supplier-1',
    },
    {
      _id: 'book-3',
      id: 'book-3',
      experience: 'Mountain Trek Experience',
      title: 'Mountain Trek Experience',
      name: 'Alex Lee',
      guests: 1,
      status: 'Completed',
      date: '2025-01-10',
      supplierId: 'supplier-1',
    },
  ],

  drafts: [],

  // Countries, cities, categories (from DB in production)
  countries: [
    { _id: 'country-1', name: 'Pakistan', image: '' },
    { _id: 'country-2', name: 'UAE', image: '' },
    { _id: 'country-3', name: 'Turkey', image: '' },
  ],
  cities: [
    { _id: 'city-1', name: 'Islamabad', country: 'country-1' },
    { _id: 'city-2', name: 'Lahore', country: 'country-1' },
    { _id: 'city-3', name: 'Karachi', country: 'country-1' },
    { _id: 'city-4', name: 'Dubai', country: 'country-2' },
    { _id: 'city-5', name: 'Abu Dhabi', country: 'country-2' },
    { _id: 'city-6', name: 'Istanbul', country: 'country-3' },
  ],
  categories: [
    { _id: 'cat-1', name: 'Culture' },
    { _id: 'cat-2', name: 'Sightseeing' },
    { _id: 'cat-3', name: 'Adventure' },
    { _id: 'cat-4', name: 'Food and Drink' },
    { _id: 'cat-5', name: 'Families' },
    { _id: 'cat-6', name: 'Nature' },
    { _id: 'cat-7', name: 'Religious' },
    { _id: 'cat-8', name: 'Luxury' },
  ],

  // Supplier profile (in-memory; replace with DB)
  supplierProfile: {
    businessName: '',
    contactEmail: '',
    phoneNumber: '',
    businessAddress: '',
    aboutBusiness: '',
    image: '',
    documents: [],
  },
};

function getSupplierId(req) {
  return req.user?.supplierId || req.user?.id || store.defaultSupplierId;
}

function getActivities(supplierId) {
  return store.activities.filter((a) => (a.supplierId || store.defaultSupplierId) === supplierId);
}

function getBookings(supplierId, { limit, status } = {}) {
  let list = store.bookings.filter((b) => (b.supplierId || store.defaultSupplierId) === supplierId);
  if (status) {
    list = list.filter((b) => (b.status || '').toLowerCase() === (status || '').toLowerCase());
  }
  if (limit) {
    list = list.slice(0, Number(limit));
  }
  return list;
}

function getDrafts(supplierId) {
  return (store.drafts || []).filter((d) => (d.supplierId || store.defaultSupplierId) === supplierId);
}

function updateBookingStatus(bookingId, status, supplierId) {
  const b = store.bookings.find(
    (x) => (x._id === bookingId || x.id === bookingId) && (x.supplierId || store.defaultSupplierId) === supplierId
  );
  if (b) {
    b.status = status;
    return b;
  }
  return null;
}

function createActivity(body, supplierId) {
  const id = 'act-' + Date.now();
  const activity = {
    _id: id,
    id,
    title: body.title || '',
    location: body.location || '',
    days: body.days || 1,
    nights: body.nights || 0,
    capacity: body.capacity || 12,
    category: body.category || '',
    description: body.description || '',
    price: body.price || '',
    image: body.image || body.imageUrl || '',
    supplierId: supplierId || store.defaultSupplierId,
  };
  store.activities.push(activity);
  return activity;
}

function updateActivity(activityId, body, supplierId) {
  const a = store.activities.find(
    (x) => (x._id === activityId || x.id === activityId) && (x.supplierId || store.defaultSupplierId) === supplierId
  );
  if (a) {
    Object.assign(a, body, { _id: a._id, id: a.id || a._id, supplierId: a.supplierId });
    return a;
  }
  return null;
}

function deleteActivity(activityId, supplierId) {
  const idx = store.activities.findIndex(
    (x) => (x._id === activityId || x.id === activityId) && (x.supplierId || store.defaultSupplierId) === supplierId
  );
  if (idx !== -1) {
    store.activities.splice(idx, 1);
    return true;
  }
  return false;
}

function deleteDraft(draftId, supplierId) {
  const idx = (store.drafts || []).findIndex(
    (x) => (x._id === draftId || x.id === draftId) && (x.supplierId || store.defaultSupplierId) === supplierId
  );
  if (idx !== -1) {
    store.drafts.splice(idx, 1);
    return true;
  }
  return false;
}

// Auth/me: from database – current user (name, email, phone, address, about, image)
function getAuthMe() {
  return {
    id: store.defaultSupplierId,
    name: 'Supplier User',
    email: 'supplier@example.com',
    phone: '',
    address: '',
    about: '',
    image: '',
  };
}

// Supplier profile: from database – name, contact email, phone, address, about, image, documents
function getSupplierProfile() {
  return { ...store.supplierProfile };
}

function updateSupplierProfile(body) {
  Object.assign(store.supplierProfile, body);
  return store.supplierProfile;
}

function getCountries() {
  return store.countries || [];
}

function getCities(countryId) {
  const list = store.cities || [];
  if (countryId) {
    return list.filter((c) => (c.country && c.country.toString()) === (countryId && countryId.toString()));
  }
  return list;
}

function getCategories() {
  return store.categories || [];
}

function getAnalytics(supplierId) {
  const activities = getActivities(supplierId);
  const bookings = getBookings(supplierId);
  const pending = bookings.filter((b) => (b.status || '').toLowerCase() === 'pending');
  const accepted = bookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed');
  const rejected = bookings.filter((b) => (b.status || '').toLowerCase() === 'cancelled');

  const totalRevenue = bookings
    .filter((b) => (b.status || '').toLowerCase() === 'completed' || (b.status || '').toLowerCase() === 'confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);

  const byExperience = {};
  bookings.forEach((b) => {
    const key = b.experience || b.title || 'Other';
    byExperience[key] = (byExperience[key] || 0) + 1;
  });

  return {
    totalRevenue,
    revenueTrend: '+12%',
    activeBookings: bookings.filter((b) => (b.status || '').toLowerCase() === 'confirmed').length,
    bookingsTrend: String(bookings.length),
    avgRating: '4.7',
    ratingTrend: '0.2',
    totalExperiences: activities.length,
    pendingRequests: pending.length,
    acceptedRequests: accepted.length,
    rejectedRequests: rejected.length,
    overview: [
      { label: 'Total Revenue', value: `$${totalRevenue}`, delta: '+12%', icon: 'DollarSign' },
      { label: 'Active Bookings', value: String(bookings.length), delta: String(bookings.length), icon: 'CalendarDays' },
      { label: 'Average Rating', value: '4.7', delta: '0.2', icon: 'Star' },
      { label: 'Experiences', value: String(activities.length), delta: 'New', icon: 'Briefcase' },
    ],
    travelerStats: [
      { label: 'Total Pending Requests', value: pending.length, icon: 'Clock3' },
      { label: 'Accepted Requests', value: accepted.length, icon: 'Check' },
      { label: 'Rejected Requests', value: rejected.length, icon: 'XIcon' },
    ],
    revenueTrend: [
      { month: 'Jan', value: 1200 },
      { month: 'Feb', value: 1900 },
      { month: 'Mar', value: 1500 },
      { month: 'Apr', value: 2200 },
      { month: 'May', value: 1800 },
      { month: 'Jun', value: 2500 },
    ],
    bookingsByExperience: Object.entries(byExperience).map(([label, value]) => ({ label, value, title: label, count: value })),
  };
}

module.exports = {
  store,
  getSupplierId,
  getActivities,
  getBookings,
  getDrafts,
  getAnalytics,
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
};
