package middleware

import (
	"encoding/json"
	"log"
	"net/http"
)

// ErrorResponse represents a standardized error response.
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    string `json:"code,omitempty"`
}

// ErrorHandler middleware catches panics and converts them to JSON error responses.
func ErrorHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				writeErrorResponse(w, http.StatusInternalServerError, "Internal server error", "INTERNAL_ERROR")
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// writeErrorResponse writes a JSON error response.
func writeErrorResponse(w http.ResponseWriter, statusCode int, message, code string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := ErrorResponse{
		Error:   http.StatusText(statusCode),
		Message: message,
		Code:    code,
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode error response: %v", err)
	}
}

// WriteError is a helper for writing JSON error responses from handlers.
func WriteError(w http.ResponseWriter, statusCode int, message string) {
	code := getErrorCode(statusCode)
	writeErrorResponse(w, statusCode, message, code)
}

// getErrorCode returns a standardized error code based on HTTP status.
func getErrorCode(statusCode int) string {
	switch {
	case statusCode >= 500:
		return "SERVER_ERROR"
	case statusCode == 401:
		return "UNAUTHORIZED"
	case statusCode == 403:
		return "FORBIDDEN"
	case statusCode == 404:
		return "NOT_FOUND"
	case statusCode == 400:
		return "BAD_REQUEST"
	case statusCode == 422:
		return "VALIDATION_ERROR"
	default:
		return "UNKNOWN_ERROR"
	}
}

