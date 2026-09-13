package otx

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"time"
)

const otxTimeLayout = "2006-01-02T15:04:05.999999"

type Poller struct {
	Cfg    Config
	Client *Client

	OutputChan chan Pulse
}

func NewPoller(cfg Config, client *Client, outputChan chan Pulse) *Poller {
	return &Poller{
		Cfg:        cfg,
		Client:     client,
		OutputChan: outputChan,
	}
}

func (p *Poller) Run(ctx context.Context) {
	delay := p.Cfg.InitialBackoff

	for {
		err := p.Poll(ctx)
		if err == nil {
			delay = p.Cfg.InitialBackoff
		}

		timer := time.NewTimer(delay)
		select {
		case <-ctx.Done():
			fmt.Println("context done:", ctx.Err())
			return
		case <-timer.C:
		}

		if err != nil {
			delay *= 2
			delay = min(delay, p.Cfg.MaxBackoff)
		}
	}
}

func (p *Poller) Poll(ctx context.Context) error {
	u, err := url.Parse(p.Cfg.BaseURL)
	if err != nil {
		return err
	}

	query := u.Query()
	query.Set("modified_since", p.Cfg.ModifiedSince.UTC().Format("2006-01-02T15:04:05"))
	query.Set("limit", "10")
	query.Set("page", "1")
	u.RawQuery = query.Encode()

	for {
		resp, err := p.Client.Get(ctx, u.String())
		if err != nil {
			return err
		}

		var response OTXResponse
		if err := json.Unmarshal(resp, &response); err != nil {
			return err
		}

		for _, result := range response.Results {
			modified, err := time.ParseInLocation(otxTimeLayout, result.Modified, time.UTC)
			if err != nil {
				return err
			}

			if modified.After(p.Cfg.ModifiedSince) {
				p.Cfg.ModifiedSince = modified
			}

			p.OutputChan <- result
		}

		if response.Next == nil || *response.Next == "" {
			return errors.New("end of stream")
		}

		u, err = url.Parse(*response.Next)
		if err != nil {
			return err
		}
	}
}
