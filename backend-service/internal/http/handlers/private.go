package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"code-type/backend/internal/http/middleware"
)

// RegisterPrivateRoutes registers protected endpoints that require authentication.
// These routes are wrapped with AuthHeaderMiddleware which validates X-User-Id header.
func RegisterPrivateRoutes(router chi.Router) {
	router.Get("/me", handleMe)
}

// handleMe returns the authenticated user's ID from request context.
// User ID is injected by AuthHeaderMiddleware after Oathkeeper validates the session.
func handleMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		middleware.WriteError(w, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	type response struct {
		UserID string `json:"user_id"`
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response{UserID: userID}); err != nil {
		log.Printf("Failed to encode response: %v", err)
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to encode response")
		return
	}
}
