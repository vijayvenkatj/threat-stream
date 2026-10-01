package http

import (
	"compress/gzip"
	"io"
	"net/http"
	"strings"

	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
)

func NewRouter(health *controllers.HealthController, pulses *controllers.PulsesController, indicators *controllers.IndicatorsController, stats *controllers.StatsController, correlations *controllers.CorrelationsController) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", health.Health)

	mux.HandleFunc("GET /api/raw/pulses", pulses.ListRaw)
	mux.HandleFunc("GET /api/pulses", pulses.List)
	mux.HandleFunc("GET /api/pulses/{id}", pulses.Get)

	mux.HandleFunc("GET /api/indicators", indicators.List)
	mux.HandleFunc("GET /api/indicators/{id}", indicators.Get)

	mux.HandleFunc("GET /api/stats/overview", stats.Overview)
	mux.HandleFunc("GET /api/stats/indicator-types", stats.IndicatorTypes)
	mux.HandleFunc("GET /api/stats/malware", stats.Malware)
	mux.HandleFunc("GET /api/stats/countries", stats.Countries)
	mux.HandleFunc("GET /api/stats/industries", stats.Industries)
	mux.HandleFunc("GET /api/stats/tags", stats.Tags)

	mux.HandleFunc("GET /api/correlations", correlations.List)
	mux.HandleFunc("GET /api/correlations/stats", correlations.Stats)

	return withCORS(withGzip(mux))
}

// ponytail: allow-all CORS, tighten to specific origins if this API stops being public-read
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// withGzip compresses responses for clients that accept it; list payloads are
// repetitive JSON and shrink ~10x.
func withGzip(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Add("Vary", "Accept-Encoding")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		next.ServeHTTP(gzipWriter{w, gz}, r)
	})
}

type gzipWriter struct {
	http.ResponseWriter
	io.Writer
}

func (g gzipWriter) Write(b []byte) (int, error) { return g.Writer.Write(b) }
