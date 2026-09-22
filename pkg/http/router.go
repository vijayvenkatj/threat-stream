package http

import (
	"net/http"

	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
)

func NewRouter(health *controllers.HealthController, pulses *controllers.PulsesController, indicators *controllers.IndicatorsController, stats *controllers.StatsController) http.Handler {
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

	return withCORS(mux)
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
