/**
 * API base URL — works when served from Express or opened as file://
 */
const API_BASE =
  window.location.protocol === "file:" ? "http://localhost:5001" : "";
