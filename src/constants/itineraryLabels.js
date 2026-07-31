export const PROCEED_WITH_AI_LABEL = "Build Itinerary with AI";

/**
 * Fired whenever an itinerary changes workflow stage (draft saved, sent to traveler).
 * Supplier panels listen for it so New Requests / Drafts / Booking History re-sync
 * immediately instead of waiting for a manual refresh.
 */
export const ITINERARY_WORKFLOW_EVENT = "kufi_itinerary_drafts_updated";

export function notifyItineraryWorkflowChanged() {
  try {
    window.dispatchEvent(new Event(ITINERARY_WORKFLOW_EVENT));
  } catch {
    // no-op outside the browser
  }
}
export const PENDING_ITINERARY_REQUEST_KEY = "kufiPendingItineraryRequestId";
export const PENDING_ITINERARY_VIEW_KEY = "kufiPendingItineraryView";

export function queueItineraryAiGeneration(requestId, view = "generate") {
  if (!requestId) return;
  sessionStorage.setItem(PENDING_ITINERARY_REQUEST_KEY, String(requestId));
  sessionStorage.setItem(PENDING_ITINERARY_VIEW_KEY, view);
}

export function consumeQueuedItineraryAiGeneration() {
  const requestId = sessionStorage.getItem(PENDING_ITINERARY_REQUEST_KEY);
  const view = sessionStorage.getItem(PENDING_ITINERARY_VIEW_KEY) || "generate";
  sessionStorage.removeItem(PENDING_ITINERARY_REQUEST_KEY);
  sessionStorage.removeItem(PENDING_ITINERARY_VIEW_KEY);
  if (!requestId) return null;
  return { requestId, view };
}
