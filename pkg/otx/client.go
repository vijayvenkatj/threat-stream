package otx

import (
	"context"
	"fmt"
	"io"
	"net/http"
)

const apiKeyHeader = "X-OTX-API-KEY"

type Client struct {
	Config
	httpClient *http.Client
}

func NewClient(cfg Config, httpClient *http.Client) *Client {
	return &Client{
		Config:     cfg,
		httpClient: httpClient,
	}
}

// Do performs an authenticated GET and returns the raw response for the
// caller to relay — status included, body unread. The caller closes it.
func (c *Client) Do(ctx context.Context, endpoint string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(apiKeyHeader, c.APIKey)

	return c.httpClient.Do(req)
}

func (c *Client) Get(ctx context.Context, endpoint string) ([]byte, error) {
	resp, err := c.Do(ctx, endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("otx failed: status=%d body=%s", resp.StatusCode, string(body))
	}
	return body, nil
}
