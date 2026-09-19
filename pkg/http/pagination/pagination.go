// Package pagination is opaque keyset pagination for list endpoints: supply a
// sorted slice of keys, get cursors, a windowed slice and the JSON envelope.
package pagination

import (
	"cmp"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"strconv"
)

const (
	DefaultLimit = 50
	MaxLimit     = 200

	limitParam  = "limit"
	cursorParam = "cursor"
)

type Cursor[K cmp.Ordered] struct {
	Key  K    `json:"k"`
	Back bool `json:"b,omitempty"` // page walks backwards from Key
}

type Page[T any] struct {
	Items []T     `json:"items"`
	Limit int     `json:"limit"`
	Next  *string `json:"next"`
	Prev  *string `json:"prev"`
}

// Parse reads ?limit= and ?cursor=. A nil cursor means start of the collection.
// Bad input is an error, never a silent clamp: this is a trust boundary.
func Parse[K cmp.Ordered](r *http.Request) (int, *Cursor[K], error) {
	query := r.URL.Query()

	limit := DefaultLimit
	if raw := query.Get(limitParam); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			return 0, nil, fmt.Errorf("invalid limit: %q", raw)
		}
		if parsed < 1 || parsed > MaxLimit {
			return 0, nil, fmt.Errorf("limit must be between 1 and %d", MaxLimit)
		}
		limit = parsed
	}

	raw := query.Get(cursorParam)
	if raw == "" {
		return limit, nil, nil
	}

	cursor, err := decode[K](raw)
	if err != nil {
		return 0, nil, fmt.Errorf("invalid cursor")
	}
	return limit, cursor, nil
}

// Slice returns the window of keys the cursor points at, plus the cursors for
// the pages either side of it. keys must be sorted ascending. A nil next or
// prev means there is no page in that direction.
func Slice[K cmp.Ordered](keys []K, c *Cursor[K], limit int) (window []K, next, prev *Cursor[K]) {
	start, end := 0, min(limit, len(keys))

	switch {
	case c == nil:
	case c.Back:
		// The `limit` keys ending just before c.Key.
		end, _ = slices.BinarySearch(keys, c.Key)
		start = max(0, end-limit)
	default:
		// The `limit` keys starting just after c.Key.
		at, found := slices.BinarySearch(keys, c.Key)
		if found {
			at++
		}
		start = min(at, len(keys))
		end = min(start+limit, len(keys))
	}

	window = keys[start:end]
	if len(window) == 0 {
		return window, nil, nil
	}

	if end < len(keys) {
		next = &Cursor[K]{Key: window[len(window)-1]}
	}
	if start > 0 {
		prev = &Cursor[K]{Key: window[0], Back: true}
	}
	return window, next, prev
}

// Write emits the page as JSON. next and prev become relative URLs derived from
// the request, so nothing here has to guess a scheme or host behind a proxy.
func Write[T any, K cmp.Ordered](w http.ResponseWriter, r *http.Request, limit int, items []T, next, prev *Cursor[K]) error {
	if items == nil {
		items = []T{}
	}

	page := Page[T]{
		Items: items,
		Limit: limit,
		Next:  link(r, limit, next),
		Prev:  link(r, limit, prev),
	}

	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(page)
}

func link[K cmp.Ordered](r *http.Request, limit int, c *Cursor[K]) *string {
	if c == nil {
		return nil
	}

	u := *r.URL
	query := u.Query()
	query.Set(limitParam, strconv.Itoa(limit))
	query.Set(cursorParam, encode(c))
	u.RawQuery = query.Encode()

	href := u.RequestURI()
	return &href
}

func encode[K cmp.Ordered](c *Cursor[K]) string {
	raw, err := json.Marshal(c)
	if err != nil { // a Cursor of an ordered type always marshals
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(raw)
}

func decode[K cmp.Ordered](s string) (*Cursor[K], error) {
	raw, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}

	var c Cursor[K]
	if err := json.Unmarshal(raw, &c); err != nil {
		return nil, err
	}
	return &c, nil
}
