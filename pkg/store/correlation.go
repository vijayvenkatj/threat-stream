package store

import (
	"context"
	"encoding/json"
	"errors"
	"path"
	"slices"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/vijayvenkatj/threat-stream/pkg/hdfs"
)

// correlationTTL bounds how stale the Spark output served to clients can be.
const correlationTTL = 30 * time.Second

// Correlation is one correlated pulse from the Spark otx.threats output.
type Correlation struct {
	PulseID        string   `json:"pulse_id"`
	PulseName      string   `json:"pulse_name"`
	Created        string   `json:"created"`
	Adversary      string   `json:"adversary"`
	Categories     []string `json:"categories"`
	Countries      []string `json:"countries"`
	IndicatorTypes []string `json:"indicator_types"`
	Malware        []string `json:"malware_families"`
	Tags           []string `json:"tags"`
	Industries     []string `json:"industries"`
	IndicatorCount int      `json:"indicator_count"`
}

type NameCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type CorrelationStats struct {
	Pulses      int         `json:"pulses"`
	Indicators  int         `json:"indicators"`
	Categories  []NameCount `json:"categories"`
	Adversaries []NameCount `json:"adversaries"`
	Countries   []NameCount `json:"countries"`
	Pairs       []NameCount `json:"pairs"`    // categories that co-occur in a pulse
	Timeline    []NameCount `json:"timeline"` // pulses per YYYY-MM
}

type CorrelationSnapshot struct {
	Rows  []Correlation
	Stats CorrelationStats
	at    time.Time
}

// CorrelationStore serves the Spark correlation output from a short-lived
// in-memory snapshot, so requests never wait on HDFS and Spark's flat part
// files are read at most once per TTL.
type CorrelationStore struct {
	*PulseStore
	mu   sync.Mutex
	snap atomic.Pointer[CorrelationSnapshot]
}

func NewCorrelationStore(fs *hdfs.Client, root string) *CorrelationStore {
	return &CorrelationStore{PulseStore: NewPulseStore(fs, root)}
}

// Get returns a fresh-enough snapshot. A failed refresh keeps serving the last
// good one; only a failure with nothing cached is an error. Output Spark
// hasn't written yet is an empty snapshot, not an error.
func (s *CorrelationStore) Get(ctx context.Context) (*CorrelationSnapshot, error) {
	if snap := s.snap.Load(); snap != nil && time.Since(snap.at) < correlationTTL {
		return snap, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	prev := s.snap.Load()
	if prev != nil && time.Since(prev.at) < correlationTTL {
		return prev, nil
	}

	rows, err := s.read(ctx, "otx.threats")
	if err != nil {
		if prev == nil {
			return nil, err
		}
		prev.at = time.Now() // back off instead of retrying HDFS every request
		return prev, nil
	}

	snap := &CorrelationSnapshot{Rows: rows, Stats: statsOf(rows), at: time.Now()}
	s.snap.Store(snap)
	return snap, nil
}

func (s *CorrelationStore) read(ctx context.Context, name string) ([]Correlation, error) {
	dir := path.Join(s.root, name)
	entries, err := s.fs.List(ctx, dir)
	if errors.Is(err, hdfs.ErrNotFound) {
		return []Correlation{}, nil
	}
	if err != nil {
		return nil, err
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasPrefix(e.PathSuffix, "part-") {
			files = append(files, path.Join(dir, e.PathSuffix))
		}
	}

	rows := []Correlation{}
	err = s.scan(ctx, files, func(line []byte) error {
		var raw map[string]any
		if err := json.Unmarshal(line, &raw); err != nil {
			return err
		}
		rows = append(rows, fromRow(raw))
		return nil
	})
	return rows, err
}

// fromRow tolerates Spark's omitted nulls and comma-joined list columns.
func fromRow(m map[string]any) Correlation {
	str := func(k string) string { s, _ := m[k].(string); return s }
	list := func(k string) []string {
		out := []string{}
		for _, v := range strings.Split(str(k), ",") {
			if v = strings.TrimSpace(v); v != "" {
				out = append(out, v)
			}
		}
		return out
	}
	return Correlation{
		PulseID:        str("pulse_id"),
		PulseName:      str("pulse_name"),
		Created:        str("created"),
		Adversary:      str("adversary"),
		Categories:     list("correlated_categories"),
		Countries:      list("targeted_countries"),
		IndicatorTypes: list("indicator_types"),
		Malware:        list("malware_families"),
		Tags:           list("tags"),
		Industries:     list("industries"),
		IndicatorCount: len(list("indicators")),
	}
}

func statsOf(rows []Correlation) CorrelationStats {
	cats, advs, ctrs, pairs, months := map[string]int{}, map[string]int{}, map[string]int{}, map[string]int{}, map[string]int{}
	st := CorrelationStats{Pulses: len(rows)}

	for _, r := range rows {
		st.Indicators += r.IndicatorCount
		for _, c := range r.Categories {
			cats[c]++
		}
		for _, c := range r.Countries {
			ctrs[c]++
		}
		if r.Adversary != "" {
			advs[r.Adversary]++
		}
		if len(r.Created) >= 7 {
			months[r.Created[:7]]++
		}

		named := slices.DeleteFunc(slices.Clone(r.Categories), func(c string) bool { return c == "Other" })
		slices.Sort(named)
		for i := range named {
			for j := i + 1; j < len(named); j++ {
				pairs[named[i]+" + "+named[j]]++
			}
		}
	}

	st.Categories = top(cats, 0)
	st.Adversaries = top(advs, 5)
	st.Countries = top(ctrs, 5)
	st.Pairs = top(pairs, 6)
	st.Timeline = top(months, 0)
	sort.Slice(st.Timeline, func(i, j int) bool { return st.Timeline[i].Name < st.Timeline[j].Name })
	return st
}

// top returns counts descending (name breaks ties), cut to n unless n is 0.
func top(m map[string]int, n int) []NameCount {
	out := make([]NameCount, 0, len(m))
	for k, v := range m {
		out = append(out, NameCount{k, v})
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Count != out[j].Count {
			return out[i].Count > out[j].Count
		}
		return out[i].Name < out[j].Name
	})
	if n > 0 && len(out) > n {
		out = out[:n]
	}
	return out
}
