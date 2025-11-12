package main

// This service integrates with ORY Kratos (identity management) and ORY Oathkeeper (authorization gateway).
// Oathkeeper validates sessions via Kratos and injects X-User-Id header for authenticated requests.
// See: https://www.ory.sh/docs/kratos/guides/session-handling
// See: https://www.ory.sh/docs/oathkeeper/proxy

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	appconfig "code-type/backend/internal/config"
	"code-type/backend/internal/http/handlers"
	appmiddleware "code-type/backend/internal/http/middleware"
)

func main() {
	cfg, err := appconfig.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	router := chi.NewRouter()
	router.Use(chimiddleware.RequestID)
	router.Use(chimiddleware.RealIP)
	router.Use(chimiddleware.Logger)
	router.Use(chimiddleware.Recoverer)
	router.Use(appmiddleware.ErrorHandler)

	// Public routes are accessible without authentication.
	// Private routes require X-User-Id header set by Oathkeeper after session validation.
	router.Route("/api", func(r chi.Router) {
		r.Route("/public", handlers.RegisterPublicRoutes)

		r.Group(func(private chi.Router) {
			private.Use(appmiddleware.AuthHeaderMiddleware)
			private.Route("/private", handlers.RegisterPrivateRoutes)
		})
	})

	server := &http.Server{
		Addr:              ":" + cfg.HTTPPort,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second, // Prevent DDoS attacks
	}

	// Start server in goroutine to allow graceful shutdown handling
	go func() {
		log.Printf("HTTP server listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	waitForShutdown(server)
}

// waitForShutdown handles graceful shutdown on SIGINT or SIGTERM signals.
// Allows in-flight requests to complete within 5 seconds before termination.
func waitForShutdown(server *http.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
	}
}
