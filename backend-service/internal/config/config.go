package config

// Configuration is loaded from environment variables to avoid hardcoding secrets.
// Oathkeeper injects trusted headers (like X-User-Id) after validating sessions with Kratos.
// See: https://www.ory.sh/docs/oathkeeper/proxy#protect-your-services

import (
	"fmt"
	"os"
)

// Config holds application configuration loaded from environment variables.
type Config struct {
	HTTPPort        string // Server listening port
	KratosPublicURL string // Kratos public API endpoint (via Oathkeeper proxy)
	KratosAdminURL  string // Kratos admin API endpoint (direct)
	DatabaseDSN     string // PostgreSQL connection string
}

// Load reads environment variables and validates required configuration.
// Returns error if required variables (KRATOS_PUBLIC_URL, DATABASE_DSN) are missing.
func Load() (Config, error) {
	cfg := Config{
		HTTPPort:        getEnvOrDefault("HTTP_PORT", "8080"),
		KratosPublicURL: os.Getenv("KRATOS_PUBLIC_URL"),
		KratosAdminURL:  os.Getenv("KRATOS_ADMIN_URL"),
		DatabaseDSN:     os.Getenv("DATABASE_DSN"),
	}

	if cfg.KratosPublicURL == "" {
		return Config{}, fmt.Errorf("KRATOS_PUBLIC_URL is required")
	}

	if cfg.KratosAdminURL == "" {
		return Config{}, fmt.Errorf("KRATOS_ADMIN_URL is required")
	}

	if cfg.DatabaseDSN == "" {
		return Config{}, fmt.Errorf("DATABASE_DSN is required")
	}

	return cfg, nil
}

// getEnvOrDefault returns environment variable value or default if not set or empty.
func getEnvOrDefault(key, def string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}

	return def
}
