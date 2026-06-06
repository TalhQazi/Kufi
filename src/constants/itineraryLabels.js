export const PROCEED_WITH_AI_LABEL = "Proceed With AI Generated Itinerary";
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
