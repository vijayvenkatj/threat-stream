package controllers

import (
	"fmt"
	"log"
	"net/http"
	"slices"
	"strings"

	"github.com/vijayvenkatj/threat-stream/pkg/query"
	"github.com/vijayvenkatj/threat-stream/pkg/store"
)

type CorrelationsController struct {
	store *store.CorrelationStore
}

func NewCorrelationsController(store *store.CorrelationStore) *CorrelationsController {
	return &CorrelationsController{store: store}
}

// List serves a searchable, sortable, page-numbered listing of the Spark
// correlation output. Spark runs by hand, so missing output is a normal
// state: available=false with an empty page, never an error.
func (c *CorrelationsController) List(w http.ResponseWriter, r *http.Request) {
	page, limit, err := query.ParsePage(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	q := r.URL.Query()
	desc, err := parseOrder(q)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	sortField := q.Get("sort")
	if sortField == "" {
		sortField = "indicator_count"
	}
	if !slices.Contains([]string{"indicator_count", "created", "name"}, sortField) {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid sort: %q", sortField))
		return
	}

	snap, err := c.store.Get(r.Context())
	if err != nil {
		log.Printf("correlations: %v", err)
		writeError(w, http.StatusBadGateway, "cannot read correlation data")
		return
	}

	var preds []func(store.Correlation) bool
	if s := q.Get("search"); s != "" {
		preds = append(preds, func(c store.Correlation) bool {
			return containsFold(c.PulseName, s) || containsFold(c.Adversary, s)
		})
	}
	if v := q.Get("category"); v != "" {
		preds = append(preds, func(c store.Correlation) bool { return hasFold(c.Categories, v) })
	}
	if v := q.Get("country"); v != "" {
		preds = append(preds, func(c store.Correlation) bool { return hasFold(c.Countries, v) })
	}
	if v := q.Get("adversary"); v != "" {
		preds = append(preds, func(c store.Correlation) bool { return strings.EqualFold(c.Adversary, v) })
	}

	rows := slices.Collect(query.Filter(slices.Values(snap.Rows), preds...))
	switch sortField {
	case "name":
		query.SortBy(rows, func(c store.Correlation) string { return strings.ToLower(c.PulseName) }, desc)
	case "created":
		query.SortBy(rows, func(c store.Correlation) string { return c.Created }, desc)
	default:
		query.SortBy(rows, func(c store.Correlation) int { return c.IndicatorCount }, desc)
	}

	writeJSON(w, struct {
		Available bool `json:"available"`
		query.Page[store.Correlation]
	}{len(snap.Rows) > 0, query.Paginate(rows, page, limit)})
}

// Stats serves the aggregates the insight charts are drawn from.
func (c *CorrelationsController) Stats(w http.ResponseWriter, r *http.Request) {
	snap, err := c.store.Get(r.Context())
	if err != nil {
		log.Printf("correlations: stats: %v", err)
		writeError(w, http.StatusBadGateway, "cannot read correlation data")
		return
	}

	writeJSON(w, struct {
		Available bool `json:"available"`
		store.CorrelationStats
	}{len(snap.Rows) > 0, snap.Stats})
}

func hasFold(list []string, v string) bool {
	return slices.ContainsFunc(list, func(s string) bool { return strings.EqualFold(s, v) })
}
