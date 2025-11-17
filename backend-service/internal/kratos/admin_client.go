package kratos

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// AdminClient wraps calls to the Kratos Admin API.
// Only the endpoints needed by this service are implemented.
type AdminClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewAdminClient creates a new client for the Kratos Admin API.
// baseURL must point to the admin endpoint, e.g. http://kratos:4434 or http://localhost:4434.
func NewAdminClient(baseURL string) *AdminClient {
	return &AdminClient{
		baseURL: strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// DeleteIdentity removes the specified identity via the Admin API.
// 204 indicates success, 404 is treated as success to keep the operation idempotent.
func (c *AdminClient) DeleteIdentity(ctx context.Context, identityID string) error {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodDelete,
		fmt.Sprintf("%s/identities/%s", c.baseURL, identityID),
		nil,
	)
	if err != nil {
		return fmt.Errorf("build delete identity request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("call kratos admin api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent || resp.StatusCode == http.StatusNotFound {
		return nil
	}

	return fmt.Errorf("kratos admin api returned %s", resp.Status)
}
