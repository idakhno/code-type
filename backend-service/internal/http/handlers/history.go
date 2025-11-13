package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"code-type/backend/internal/http/middleware"
	"code-type/backend/internal/storage"
)

const (
	defaultHistoryLimit = 50
	maxHistoryLimit     = 100
)

// HistoryHandler provides HTTP handlers for practice history operations.
type HistoryHandler struct {
	repo *storage.HistoryRepository
}

// NewHistoryHandler creates a new HistoryHandler.
func NewHistoryHandler(repo *storage.HistoryRepository) *HistoryHandler {
	return &HistoryHandler{repo: repo}
}

// RegisterRoutes mounts history routes on the provided router.
func (h *HistoryHandler) RegisterRoutes(router chi.Router) {
	router.Get("/", h.handleListHistory)
	router.Post("/", h.handleCreateHistory)
	router.Delete("/", h.handleDeleteHistory)
}

type historyEntryResponse struct {
	ID          string `json:"id"`
	Language    string `json:"language"`
	WPM         int    `json:"wpm"`
	Accuracy    int    `json:"accuracy"`
	Errors      int    `json:"errors"`
	Time        int    `json:"time"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"`
	CompletedAt string `json:"completed_at"`
}

type createHistoryRequest struct {
	Language string `json:"language"`
	WPM      int    `json:"wpm"`
	Accuracy int    `json:"accuracy"`
	Errors   int    `json:"errors"`
	Time     int    `json:"time"`
	Date     string `json:"date"`
}

func (h *HistoryHandler) handleListHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		middleware.WriteError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	limit := parseLimit(r.URL.Query().Get("limit"))
	offset := parseOffset(r.URL.Query().Get("offset"))

	entries, err := h.repo.ListByUser(r.Context(), userID, limit, offset)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to load history")
		return
	}

	response := make([]historyEntryResponse, len(entries))
	for i, entry := range entries {
		response[i] = historyEntryResponse{
			ID:          entry.ID,
			Language:    entry.Language,
			WPM:         entry.WPM,
			Accuracy:    entry.Accuracy,
			Errors:      entry.Errors,
			Time:        entry.DurationSeconds,
			Date:        entry.CompletedAt.Format(time.RFC3339),
			CreatedAt:   entry.CreatedAt.Format(time.RFC3339),
			CompletedAt: entry.CompletedAt.Format(time.RFC3339),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to encode response")
		return
	}
}

func (h *HistoryHandler) handleCreateHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		middleware.WriteError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req createHistoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := validateHistoryRequest(req); err != nil {
		middleware.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	completedAt, err := time.Parse(time.RFC3339, req.Date)
	if err != nil {
		middleware.WriteError(w, http.StatusBadRequest, "Invalid date format, expected RFC3339")
		return
	}

	entry, err := h.repo.Create(r.Context(), storage.CreateHistoryParams{
		UserID:          userID,
		Language:        req.Language,
		WPM:             req.WPM,
		Accuracy:        req.Accuracy,
		Errors:          req.Errors,
		DurationSeconds: req.Time,
		CompletedAt:     completedAt,
	})
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to save history entry")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(historyEntryResponse{
		ID:          entry.ID,
		Language:    entry.Language,
		WPM:         entry.WPM,
		Accuracy:    entry.Accuracy,
		Errors:      entry.Errors,
		Time:        entry.DurationSeconds,
		Date:        entry.CompletedAt.Format(time.RFC3339),
		CreatedAt:   entry.CreatedAt.Format(time.RFC3339),
		CompletedAt: entry.CompletedAt.Format(time.RFC3339),
	}); err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to encode response")
		return
	}
}

func (h *HistoryHandler) handleDeleteHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		middleware.WriteError(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	if err := h.repo.DeleteByUser(r.Context(), userID); err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "Failed to clear history")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func validateHistoryRequest(req createHistoryRequest) error {
	if req.Language == "" {
		return errValidation("language is required")
	}

	if !isSupportedLanguage(req.Language) {
		return errValidation("unsupported language")
	}

	if req.WPM < 0 {
		return errValidation("wpm must be non-negative")
	}

	if req.Accuracy < 0 || req.Accuracy > 100 {
		return errValidation("accuracy must be between 0 and 100")
	}

	if req.Errors < 0 {
		return errValidation("errors must be non-negative")
	}

	if req.Time < 0 {
		return errValidation("time must be non-negative")
	}

	if strings.TrimSpace(req.Date) == "" {
		return errValidation("date is required")
	}

	return nil
}

func isSupportedLanguage(language string) bool {
	switch language {
	case "javascript", "python", "go":
		return true
	default:
		return false
	}
}

func parseLimit(raw string) int {
	if raw == "" {
		return defaultHistoryLimit
	}

	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return defaultHistoryLimit
	}

	if value > maxHistoryLimit {
		return maxHistoryLimit
	}

	return value
}

func parseOffset(raw string) int {
	if raw == "" {
		return 0
	}

	value, err := strconv.Atoi(raw)
	if err != nil || value < 0 {
		return 0
	}

	return value
}

type validationError struct {
	message string
}

func (e validationError) Error() string {
	return e.message
}

func errValidation(message string) error {
	return validationError{message: message}
}
