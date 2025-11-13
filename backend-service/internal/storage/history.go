package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// HistoryEntry represents a persisted practice session result.
type HistoryEntry struct {
	ID              string
	UserID          string
	Language        string
	WPM             int
	Accuracy        int
	Errors          int
	DurationSeconds int
	CompletedAt     time.Time
	CreatedAt       time.Time
}

// CreateHistoryParams contains parameters to insert a new history entry.
type CreateHistoryParams struct {
	UserID          string
	Language        string
	WPM             int
	Accuracy        int
	Errors          int
	DurationSeconds int
	CompletedAt     time.Time
}

// HistoryRepository handles persistence of practice history entries.
type HistoryRepository struct {
	db *sql.DB
}

// NewHistoryRepository creates a new HistoryRepository.
func NewHistoryRepository(db *sql.DB) *HistoryRepository {
	return &HistoryRepository{db: db}
}

// Create inserts a new history entry and returns the stored record.
func (r *HistoryRepository) Create(ctx context.Context, params CreateHistoryParams) (HistoryEntry, error) {
	const query = `
		INSERT INTO practice_history (user_id, language, wpm, accuracy, errors, duration_seconds, completed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, language, wpm, accuracy, errors, duration_seconds, completed_at, created_at;
	`

	row := r.db.QueryRowContext(ctx, query,
		params.UserID,
		params.Language,
		params.WPM,
		params.Accuracy,
		params.Errors,
		params.DurationSeconds,
		params.CompletedAt,
	)

	var entry HistoryEntry
	if err := row.Scan(
		&entry.ID,
		&entry.UserID,
		&entry.Language,
		&entry.WPM,
		&entry.Accuracy,
		&entry.Errors,
		&entry.DurationSeconds,
		&entry.CompletedAt,
		&entry.CreatedAt,
	); err != nil {
		return HistoryEntry{}, fmt.Errorf("scan inserted history entry: %w", err)
	}

	return entry, nil
}

// ListByUser returns practice history entries for the specified user ordered by completion date desc.
func (r *HistoryRepository) ListByUser(ctx context.Context, userID string, limit, offset int) ([]HistoryEntry, error) {
	const query = `
		SELECT id, user_id, language, wpm, accuracy, errors, duration_seconds, completed_at, created_at
		FROM practice_history
		WHERE user_id = $1
		ORDER BY completed_at DESC
		LIMIT $2 OFFSET $3;
	`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("query history entries: %w", err)
	}
	defer rows.Close()

	entries := make([]HistoryEntry, 0)
	for rows.Next() {
		var entry HistoryEntry
		if err := rows.Scan(
			&entry.ID,
			&entry.UserID,
			&entry.Language,
			&entry.WPM,
			&entry.Accuracy,
			&entry.Errors,
			&entry.DurationSeconds,
			&entry.CompletedAt,
			&entry.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan history entry: %w", err)
		}

		entries = append(entries, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate history entries: %w", err)
	}

	return entries, nil
}

// DeleteByUser removes all history entries for the specified user.
func (r *HistoryRepository) DeleteByUser(ctx context.Context, userID string) error {
	const query = `
		DELETE FROM practice_history
		WHERE user_id = $1;
	`

	if _, err := r.db.ExecContext(ctx, query, userID); err != nil {
		return fmt.Errorf("delete history entries: %w", err)
	}

	return nil
}
