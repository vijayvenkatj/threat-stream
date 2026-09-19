package store

import (
	"context"
	"log"
	"sync/atomic"
	"time"

	"github.com/vijayvenkatj/threat-stream/pkg/otx"
)

// Snapshot is the decoded corpus at one point in time.
type Snapshot struct {
	Pulses        []otx.Pulse
	Indicators    []otx.Indicator
	IndicatorByID map[int64]otx.Indicator
}

// Cache keeps a Snapshot in memory, refreshed on a timer, so request handlers
// never wait on an HDFS round trip. Embeds *PulseStore so callers that still
// need live reads (the raw cursor-paginated feed) can use the same value.
type Cache struct {
	*PulseStore
	snap atomic.Pointer[Snapshot]
}

func NewCache(store *PulseStore) *Cache {
	return &Cache{PulseStore: store}
}

// Start populates the cache and refreshes it every interval until ctx is
// done. It returns once the first load succeeds, so a caller can fail fast
// if HDFS is unreachable at boot.
func (c *Cache) Start(ctx context.Context, interval time.Duration) error {
	if err := c.Refresh(ctx); err != nil {
		return err
	}

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := c.Refresh(ctx); err != nil {
					log.Printf("cache: refresh: %v", err)
				}
			}
		}
	}()

	return nil
}

// Refresh decodes the current corpus from HDFS and swaps it in atomically.
func (c *Cache) Refresh(ctx context.Context) error {
	pulses, err := c.Pulses(ctx)
	if err != nil {
		return err
	}

	var indicators []otx.Indicator
	byID := make(map[int64]otx.Indicator)
	for _, pulse := range pulses {
		for _, indicator := range pulse.GetIndicators() {
			indicators = append(indicators, indicator)
			byID[indicator.ID] = indicator
		}
	}

	c.snap.Store(&Snapshot{Pulses: pulses, Indicators: indicators, IndicatorByID: byID})
	return nil
}

// Get returns the current snapshot. Nil until the first Refresh completes.
func (c *Cache) Get() *Snapshot {
	return c.snap.Load()
}
