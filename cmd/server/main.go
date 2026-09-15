package main

import (
	"log"
	"net/http"

	httppkg "github.com/vijayvenkatj/threat-stream/pkg/http"
	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
)

func main() {
	cfg := httppkg.LoadConfig()
	router := httppkg.NewRouter(controllers.NewHealthController())

	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
