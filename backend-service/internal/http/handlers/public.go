package handlers

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

// RegisterPublicRoutes registers public endpoints accessible without authentication.
func RegisterPublicRoutes(router chi.Router) {
	router.Get("/ping", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
}
