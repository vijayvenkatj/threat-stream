package http

import (
	"net/http"

	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
)

func NewRouter(health *controllers.HealthController, pulses *controllers.PulsesController, indicators *controllers.IndicatorsController) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", health.Health)

	mux.HandleFunc("GET /api/raw/pulses", pulses.ListRaw)
	mux.HandleFunc("GET /api/pulses", pulses.List)
	mux.HandleFunc("GET /api/pulses/{id}", pulses.Get)

	mux.HandleFunc("GET /api/indicators", indicators.List)
	mux.HandleFunc("GET /api/indicators/{id}", indicators.Get)

	return mux
}
