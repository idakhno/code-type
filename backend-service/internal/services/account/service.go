package account

import (
	"context"
	"fmt"

	"code-type/backend/internal/kratos"
)

// HistoryCleaner removes practice history (and other per-user records) from the application DB.
type HistoryCleaner interface {
	DeleteByUser(ctx context.Context, userID string) error
}

// Service coordinates account deletion across Kratos and application-specific data.
type Service struct {
	adminClient *kratos.AdminClient
	historyRepo HistoryCleaner
}

// NewService creates a new account service.
func NewService(adminClient *kratos.AdminClient, historyRepo HistoryCleaner) *Service {
	return &Service{
		adminClient: adminClient,
		historyRepo: historyRepo,
	}
}

// DeleteAccount removes the identity in Kratos and purges application data related to that identity.
func (s *Service) DeleteAccount(ctx context.Context, userID string) error {
	if userID == "" {
		return fmt.Errorf("user id is required")
	}

	if err := s.adminClient.DeleteIdentity(ctx, userID); err != nil {
		return fmt.Errorf("delete identity: %w", err)
	}

	if err := s.historyRepo.DeleteByUser(ctx, userID); err != nil {
		return fmt.Errorf("delete practice history: %w", err)
	}

	return nil
}
