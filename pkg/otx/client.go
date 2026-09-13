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

func (c *Client) Get(ctx context.Context, endpoint string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set(apiKeyHeader, c.APIKey)

	resp, err := c.httpClient.Do(req)
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
