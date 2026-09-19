package hdfs

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type FileStatus struct {
	PathSuffix string `json:"pathSuffix"`
	Type       string `json:"type"` // FILE | DIRECTORY
	Length     int64  `json:"length"`
}

func (f FileStatus) IsDir() bool { return f.Type == "DIRECTORY" }

type Config struct {
	BaseURL string // NameNode WebHDFS root, e.g. http://localhost:9870
	User    string // user.name sent with every request
	// DataAddr rewrites the DataNode redirect from Open, whose in-cluster
	// hostname doesn't resolve from the host. Empty follows it untouched.
	DataAddr string
}

type Client struct {
	cfg  Config
	http *http.Client
}

func NewClient(cfg Config) *Client {
	return &Client{
		cfg: cfg,
		http: &http.Client{
			CheckRedirect: func(req *http.Request, _ []*http.Request) error {
				if cfg.DataAddr != "" {
					req.URL.Host = cfg.DataAddr
				}
				return nil
			},
		},
	}
}

func (c *Client) List(ctx context.Context, dir string) ([]FileStatus, error) {
	body, err := c.get(ctx, dir, "LISTSTATUS")
	if err != nil {
		return nil, err
	}
	defer body.Close()

	var payload struct {
		FileStatuses struct {
			FileStatus []FileStatus `json:"FileStatus"`
		} `json:"FileStatuses"`
	}
	if err := json.NewDecoder(body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("hdfs: decode listing of %s: %w", dir, err)
	}
	return payload.FileStatuses.FileStatus, nil
}

func (c *Client) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	return c.get(ctx, path, "OPEN")
}

func (c *Client) get(ctx context.Context, path, op string) (io.ReadCloser, error) {
	endpoint, err := url.Parse(strings.TrimRight(c.cfg.BaseURL, "/"))
	if err != nil {
		return nil, fmt.Errorf("hdfs: bad base url %q: %w", c.cfg.BaseURL, err)
	}
	// Set Path, not RawQuery — url escapes the segments, and pulse filenames
	// contain characters ("+", "=") that must survive verbatim.
	endpoint.Path = "/webhdfs/v1/" + strings.TrimLeft(path, "/")
	endpoint.RawQuery = url.Values{
		"op":        {op},
		"user.name": {c.cfg.User},
	}.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("hdfs: %s %s: %w", op, path, err)
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer resp.Body.Close()
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return nil, fmt.Errorf("hdfs: %s %s failed: status=%d body=%s", op, path, resp.StatusCode, body)
	}
	return resp.Body, nil
}
