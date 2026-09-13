package otx

import (
	"encoding/json"
	"time"
)

const defaultBaseURL = "https://otx.alienvault.com/api/v1/pulses/subscribed"

var defaultModifiedSince = time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC)

type Config struct {
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url"`

	ModifiedSince time.Time `json:"modified_since"`

	InitialBackoff time.Duration `json:"initial_backoff"`
	MaxBackoff     time.Duration `json:"max_backoff"`
}

func ParseConfig(raw json.RawMessage) (Config, error) {
	var cfg Config
	if raw == nil {
		raw = json.RawMessage("{}")
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return Config{}, err
	}

	if cfg.BaseURL == "" {
		cfg.BaseURL = defaultBaseURL
	}
	if cfg.ModifiedSince.IsZero() {
		cfg.ModifiedSince = defaultModifiedSince
	}

	if cfg.InitialBackoff == 0 {
		cfg.InitialBackoff = 1 * time.Second
	}
	if cfg.MaxBackoff == 0 {
		cfg.MaxBackoff = 1 * time.Hour
	}

	return cfg, nil
}
