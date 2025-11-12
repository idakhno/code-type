package middleware

import (
	"context"
	"net/http"
)

// userIDKey is a private type used as context key to prevent collisions.
// Using a typed key instead of string ensures type safety.
type userIDKey struct{}

// ContextWithUserID stores user ID in request context for downstream handlers.
func ContextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey{}, userID)
}

// UserIDFromContext extracts user ID from request context.
// Returns false if user ID is not present in context.
func UserIDFromContext(ctx context.Context) (string, bool) {
	value, ok := ctx.Value(userIDKey{}).(string)
	return value, ok
}

// AuthHeaderMiddleware validates X-User-Id header injected by Oathkeeper.
// Oathkeeper sets this header only after successfully validating the session with Kratos.
// Requests without valid header are rejected with 401 Unauthorized.
func AuthHeaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("X-User-Id")
		if userID == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		ctx := ContextWithUserID(r.Context(), userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
