package controllers

import (
	"net/http"
	"slices"
	"strings"

	"github.com/vijayvenkatj/threat-stream/pkg/otx"
	"github.com/vijayvenkatj/threat-stream/pkg/store"
)

type StatsController struct {
	cache *store.Cache
}

func NewStatsController(cache *store.Cache) *StatsController {
	return &StatsController{cache: cache}
}

type statsOverview struct {
	TotalPulses        int `json:"total_pulses"`
	TotalIndicators    int `json:"total_indicators"`
	ActiveIndicators   int `json:"active_indicators"`
	InactiveIndicators int `json:"inactive_indicators"`
}

// Overview serves corpus-wide counts off the cached snapshot.
func (c *StatsController) Overview(w http.ResponseWriter, r *http.Request) {
	snap := c.cache.Get()

	var active int
	for _, i := range snap.Indicators {
		if i.IsActive == 1 {
			active++
		}
	}

	writeJSON(w, statsOverview{
		TotalPulses:        len(snap.Pulses),
		TotalIndicators:    len(snap.Indicators),
		ActiveIndicators:   active,
		InactiveIndicators: len(snap.Indicators) - active,
	})
}

// list is the envelope every breakdown endpoint below returns.
type list[T any] struct {
	Data []T `json:"data"`
}

type typeCount struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
}

type nameCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// IndicatorTypes serves indicator counts grouped by type.
func (c *StatsController) IndicatorTypes(w http.ResponseWriter, r *http.Request) {
	counts := make(map[string]int)
	for _, i := range c.cache.Get().Indicators {
		counts[i.Type]++
	}

	types := make([]typeCount, 0, len(counts))
	for t, n := range counts {
		types = append(types, typeCount{Type: t, Count: n})
	}
	slices.SortFunc(types, func(a, b typeCount) int { return byCountDesc(a.Count, b.Count, a.Type, b.Type) })

	writeJSON(w, list[typeCount]{Data: types})
}

func (c *StatsController) Malware(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, list[nameCount]{Data: pulseFieldCounts(c.cache.Get().Pulses, func(p otx.Pulse) []string { return p.MalwareFamilies })})
}

func (c *StatsController) Countries(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, list[nameCount]{Data: pulseFieldCounts(c.cache.Get().Pulses, func(p otx.Pulse) []string { return p.TargetedCountries })})
}

func (c *StatsController) Industries(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, list[nameCount]{Data: pulseFieldCounts(c.cache.Get().Pulses, func(p otx.Pulse) []string { return p.Industries })})
}

func (c *StatsController) Tags(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, list[nameCount]{Data: pulseFieldCounts(c.cache.Get().Pulses, func(p otx.Pulse) []string { return p.Tags })})
}

// pulseFieldCounts tallies occurrences of a multi-value pulse field (tags,
// countries, industries, malware families) across the corpus, sorted by
// count descending.
func pulseFieldCounts(pulses []otx.Pulse, values func(otx.Pulse) []string) []nameCount {
	counts := make(map[string]int)
	for _, p := range pulses {
		for _, v := range values(p) {
			counts[v]++
		}
	}

	out := make([]nameCount, 0, len(counts))
	for name, n := range counts {
		out = append(out, nameCount{Name: name, Count: n})
	}
	slices.SortFunc(out, func(a, b nameCount) int { return byCountDesc(a.Count, b.Count, a.Name, b.Name) })
	return out
}

// byCountDesc orders by count descending, breaking ties alphabetically so
// output is stable across requests.
func byCountDesc(aCount, bCount int, aName, bName string) int {
	if aCount != bCount {
		return bCount - aCount
	}
	return strings.Compare(aName, bName)
}
