package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"slices"
	"strings"

	"github.com/vijayvenkatj/threat-stream/pkg/http/pagination"
	"github.com/vijayvenkatj/threat-stream/pkg/otx"
	"github.com/vijayvenkatj/threat-stream/pkg/query"
	"github.com/vijayvenkatj/threat-stream/pkg/store"
)

var validTLP = map[string]bool{"WHITE": true, "GREEN": true, "AMBER": true, "RED": true}

type PulsesController struct {
	cache *store.Cache
	otx   *otx.Client
}

func NewPulsesController(cache *store.Cache, otx *otx.Client) *PulsesController {
	return &PulsesController{cache: cache, otx: otx}
}

// ListRaw serves a cursor-paginated page of raw pulse records, unparsed,
// read live from HDFS — the cache holds decoded pulses, not raw bytes.
func (c *PulsesController) ListRaw(w http.ResponseWriter, r *http.Request) {
	limit, cursor, err := pagination.Parse[string](r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	files, err := c.cache.Files(r.Context())
	if err != nil {
		log.Printf("pulses: list: %v", err)
		writeError(w, http.StatusBadGateway, "cannot reach storage")
		return
	}
	window, next, prev := pagination.Slice(files, cursor, limit)

	items, err := c.cache.Raw(r.Context(), window)
	if err != nil {
		log.Printf("pulses: read: %v", err)
		writeError(w, http.StatusBadGateway, "cannot read storage")
		return
	}

	if err := pagination.Write(w, r, limit, items, next, prev); err != nil {
		log.Printf("pulses: write: %v", err)
	}
}

// List serves a searchable, sortable, page-numbered listing of pulses.
func (c *PulsesController) List(w http.ResponseWriter, r *http.Request) {
	page, limit, err := query.ParsePage(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	preds, err := pulseFilters(r.URL.Query())
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
		sortField = "modified"
	}
	if !slices.Contains([]string{"modified", "created", "name"}, sortField) {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("invalid sort: %q", sortField))
		return
	}

	pulses := c.cache.Get().Pulses

	filtered := slices.Collect(query.Filter(slices.Values(pulses), preds...))
	sortPulses(filtered, sortField, desc)

	writeJSON(w, query.Paginate(filtered, page, limit))
}

// Get proxies OTX's pulse-detail endpoint, unshaped.
func (c *PulsesController) Get(w http.ResponseWriter, r *http.Request) {
	resp, err := c.otx.Do(r.Context(), otx.PulseURL(r.PathValue("id")))
	if err != nil {
		log.Printf("pulses: get: %v", err)
		writeError(w, http.StatusBadGateway, "cannot reach otx")
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func pulseFilters(q url.Values) ([]func(otx.Pulse) bool, error) {
	var preds []func(otx.Pulse) bool

	if search := q.Get("search"); search != "" {
		preds = append(preds, func(p otx.Pulse) bool {
			return containsFold(p.Name, search) ||
				containsFold(p.Description, search) ||
				containsFold(p.Adversary, search)
		})
	}

	if tlp := q.Get("tlp"); tlp != "" {
		tlp = strings.ToUpper(tlp)
		if !validTLP[tlp] {
			return nil, fmt.Errorf("invalid tlp: %q", tlp)
		}
		preds = append(preds, func(p otx.Pulse) bool { return strings.EqualFold(p.TLP, tlp) })
	}

	if adversary := q.Get("adversary"); adversary != "" {
		preds = append(preds, func(p otx.Pulse) bool { return strings.EqualFold(p.Adversary, adversary) })
	}

	if country := q.Get("country"); country != "" {
		preds = append(preds, func(p otx.Pulse) bool {
			return slices.ContainsFunc(p.TargetedCountries, func(c string) bool { return strings.EqualFold(c, country) })
		})
	}

	return preds, nil
}

func sortPulses(pulses []otx.Pulse, field string, desc bool) {
	switch field {
	case "name":
		query.SortBy(pulses, func(p otx.Pulse) string { return strings.ToLower(p.Name) }, desc)
	case "created":
		query.SortBy(pulses, func(p otx.Pulse) int64 { return timeKey(p.Created) }, desc)
	default: // "modified"
		query.SortBy(pulses, func(p otx.Pulse) int64 { return timeKey(p.Modified) }, desc)
	}
}

// timeKey parses an OTX timestamp for sorting. A parse failure sorts as the
// oldest possible time rather than crashing the request.
func timeKey(s string) int64 {
	t, err := otx.ParseTime(s)
	if err != nil {
		return 0
	}
	return t.UnixNano()
}

func parseOrder(q url.Values) (desc bool, err error) {
	switch order := q.Get("order"); order {
	case "", "desc":
		return true, nil
	case "asc":
		return false, nil
	default:
		return false, fmt.Errorf("invalid order: %q", order)
	}
}

func containsFold(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
