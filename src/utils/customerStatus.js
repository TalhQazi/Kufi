/**
 * Map internal booking/itinerary statuses to customer-facing vocabulary.
 */
export function mapCustomerStatus(rawStatus, { hasItinerary = false, paymentStatus } = {}) {
    const s = String(rawStatus || '').trim().toLowerCase()
    const pay = String(paymentStatus || '').trim().toLowerCase()

    if (pay === 'paid' || s === 'payment completed' || s === 'completed') return 'Completed'
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
    if (s === 'rejected') return 'Rejected'
    if (s === 'accepted') return 'Accepted'
    if (s === 'confirmed') return 'Accepted'
    if (s === 'ready' || s === 'approved') return 'Approved'
    if (s === 'supplier replied back' || s === 'itinerary generated') return 'Itinerary Generated'
    if (s === 'pending review' || s === 'under review' || s === 'under_review') return 'Under Review'
    if (hasItinerary && (s === 'pending' || !s)) return 'Itinerary Generated'
    if (s === 'pending' || !s) return 'Pending'
    return rawStatus || 'Pending'
}

export function customerStatusColor(label) {
    switch (String(label || '')) {
        case 'Completed':
        case 'Accepted':
        case 'Approved':
            return 'bg-green-100 text-green-700'
        case 'Itinerary Generated':
            return 'bg-blue-100 text-blue-700'
        case 'Under Review':
            return 'bg-amber-100 text-amber-700'
        case 'Pending':
            return 'bg-orange-100 text-orange-700'
        case 'Rejected':
        case 'Cancelled':
            return 'bg-red-100 text-red-700'
        default:
            return 'bg-slate-100 text-slate-700'
    }
}
