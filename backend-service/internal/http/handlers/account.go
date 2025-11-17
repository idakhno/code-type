package handlers

import (
	"log"
	"net/http"

	"github.com/google/uuid"

	"code-type/backend/internal/http/middleware"
	"code-type/backend/internal/services/account"
)

// AccountHandler exposes account-related endpoints (e.g., self-service deletion).
type AccountHandler struct {
	service *account.Service
}

// NewAccountHandler creates an AccountHandler instance.
func NewAccountHandler(service *account.Service) *AccountHandler {
	return &AccountHandler{service: service}
}

// DeleteAccount removes the authenticated user's account and related data.
func (h *AccountHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		middleware.WriteError(w, http.StatusUnauthorized, "User ID not found in request context")
		return
	}

	if _, err := uuid.Parse(userID); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "Invalid user ID format")
		return
	}

	if err := h.service.DeleteAccount(r.Context(), userID); err != nil {
		log.Printf("delete account failed for user %s: %v", userID, err)
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to delete account")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
