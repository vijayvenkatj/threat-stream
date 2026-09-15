package http

import (
	"net/http"

	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
)

func NewRouter(health *controllers.HealthController) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", health.Health)
	return mux
}
