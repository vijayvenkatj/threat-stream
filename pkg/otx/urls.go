package otx

import (
	"net/url"
	"time"
)

const apiRoot = "https://otx.alienvault.com/api/v1"

// PulseURL is OTX's pulse-detail endpoint.
func PulseURL(id string) string {
	return apiRoot + "/pulses/" + url.PathEscape(id)
}

// ParseTime parses an OTX created/modified timestamp.
func ParseTime(s string) (time.Time, error) {
	return time.ParseInLocation(otxTimeLayout, s, time.UTC)
}
