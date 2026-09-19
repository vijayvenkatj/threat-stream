package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"

	"github.com/vijayvenkatj/threat-stream/pkg/otx"
	"github.com/vijayvenkatj/threat-stream/pkg/query"
	"github.com/vijayvenkatj/threat-stream/pkg/store"
)

type IndicatorsController struct {
	cache *store.Cache
}

func NewIndicatorsController(cache *store.Cache) *IndicatorsController {
	return &IndicatorsController{cache: cache}
}

// List serves a searchable, sortable, page-numbered listing of indicators,
// flattened out of every pulse.
func (c *IndicatorsController) List(w http.ResponseWriter, r *http.Request) {
	page, limit, err := query.ParsePage(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	preds, err := indicatorFilters(r.URL.Query())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	desc, err := parseOrder(r.URL.Query())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	sortField := r.URL.Query().Get("sort")
	if sortField == "" {
		sortField = "created"
	}
	if !slices.Contains([]string{"created", "type"}, sortField) {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid sort: %q", sortField))
		return
	}

	indicators := c.cache.Get().Indicators

	filtered := slices.Collect(query.Filter(slices.Values(indicators), preds...))
	sortIndicators(filtered, sortField, desc)

	writeJSON(w, query.Paginate(filtered, page, limit))
}

// Get looks an indicator up by ID in the same set List searches. OTX has no
// get-indicator-by-ID endpoint, so this is served locally rather than proxied.
func (c *IndicatorsController) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id must be numeric")
		return
	}

	indicator, ok := c.cache.Get().IndicatorByID[id]
	if !ok {
		writeError(w, http.StatusNotFound, "indicator not found")
		return
	}

	writeJSON(w, indicator)
}

func indicatorFilters(q url.Values) ([]func(otx.Indicator) bool, error) {
	var preds []func(otx.Indicator) bool

	if search := q.Get("search"); search != "" {
		preds = append(preds, func(i otx.Indicator) bool {
			return containsFold(i.Indicator, search) ||
				containsFold(i.Content, search) ||
				containsFold(i.Title, search)
		})
	}

	if t := q.Get("type"); t != "" {
		preds = append(preds, func(i otx.Indicator) bool { return strings.EqualFold(i.Type, t) })
	}

	if status := q.Get("status"); status != "" {
		var active int
		switch status {
		case "active":
			active = 1
		case "inactive":
			active = 0
		default:
			return nil, fmt.Errorf("invalid status: %q", status)
		}
		preds = append(preds, func(i otx.Indicator) bool { return i.IsActive == active })
	}

	if pulseID := q.Get("pulse_id"); pulseID != "" {
		preds = append(preds, func(i otx.Indicator) bool { return i.PulseID == pulseID })
	}

	return preds, nil
}

func sortIndicators(indicators []otx.Indicator, field string, desc bool) {
	switch field {
	case "type":
		query.SortBy(indicators, func(i otx.Indicator) string { return strings.ToLower(i.Type) }, desc)
	default: // "created"
		query.SortBy(indicators, func(i otx.Indicator) int64 { return timeKey(i.Created) }, desc)
	}
}
