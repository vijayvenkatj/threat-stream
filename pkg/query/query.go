// Package query is generic search/sort/page helpers for list endpoints.
package query

import (
	"cmp"
	"fmt"
	"iter"
	"net/http"
	"slices"
	"strconv"
)

const (
	DefaultLimit = 20
	MaxLimit     = 200
)

// Filter lazily yields the elements of seq that pass every pred.
func Filter[E any](seq iter.Seq[E], preds ...func(E) bool) iter.Seq[E] {
	return func(yield func(E) bool) {
		for e := range seq {
			match := true
			for _, pred := range preds {
				if !pred(e) {
					match = false
					break
				}
			}
			if match && !yield(e) {
				return
			}
		}
	}
}

// SortBy sorts items by key, ascending unless desc.
func SortBy[E any, K cmp.Ordered](items []E, key func(E) K, desc bool) {
	slices.SortFunc(items, func(a, b E) int {
		c := cmp.Compare(key(a), key(b))
		if desc {
			c = -c
		}
		return c
	})
}

// Page is the envelope every page-numbered endpoint returns.
type Page[T any] struct {
	Data  []T `json:"data"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
}

// ParsePage reads ?page= (default 1) and ?limit= (default DefaultLimit, max
// MaxLimit) from r. Bad input is an error, never a silent clamp.
func ParsePage(r *http.Request) (page, limit int, err error) {
	query := r.URL.Query()

	page = 1
	if raw := query.Get("page"); raw != "" {
		page, err = strconv.Atoi(raw)
		if err != nil || page < 1 {
			return 0, 0, fmt.Errorf("invalid page: %q", raw)
		}
	}

	limit = DefaultLimit
	if raw := query.Get("limit"); raw != "" {
		limit, err = strconv.Atoi(raw)
		if err != nil || limit < 1 || limit > MaxLimit {
			return 0, 0, fmt.Errorf("limit must be between 1 and %d", MaxLimit)
		}
	}

	return page, limit, nil
}

// Paginate windows items into one page. Total is len(items) — the filtered count.
func Paginate[T any](items []T, page, limit int) Page[T] {
	start := min((page-1)*limit, len(items))
	end := min(start+limit, len(items))

	data := items[start:end]
	if data == nil {
		data = []T{}
	}

	return Page[T]{
		Data:  data,
		Page:  page,
		Limit: limit,
		Total: len(items),
	}
}
