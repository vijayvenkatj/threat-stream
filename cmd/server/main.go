package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/vijayvenkatj/threat-stream/pkg/hdfs"
	httppkg "github.com/vijayvenkatj/threat-stream/pkg/http"
	"github.com/vijayvenkatj/threat-stream/pkg/http/controllers"
	"github.com/vijayvenkatj/threat-stream/pkg/otx"
	"github.com/vijayvenkatj/threat-stream/pkg/store"
)

// rawPulsesDir is where the Kafka Connect HDFS sink writes otx.pulses.
const rawPulsesDir = "/data/raw/otx.pulses"

// cacheRefreshInterval bounds how stale search results can be.
const cacheRefreshInterval = time.Minute

func main() {
	cfg := httppkg.LoadConfig()

	otxCfg, err := otx.LoadConfig("config.json")
	if err != nil {
		log.Fatal(err)
	}
	otxClient := otx.NewClient(otxCfg, &http.Client{Timeout: 10 * time.Second})

	fs := hdfs.NewClient(hdfs.Config{
		BaseURL:  cfg.HDFSURL,
		User:     cfg.HDFSUser,
		DataAddr: cfg.HDFSDataAddr,
	})

	cache := store.NewCache(store.NewPulseStore(fs, rawPulsesDir))
	if err := cache.Start(context.Background(), cacheRefreshInterval); err != nil {
		log.Fatal(err)
	}

	router := httppkg.NewRouter(
		controllers.NewHealthController(),
		controllers.NewPulsesController(cache, otxClient),
		controllers.NewIndicatorsController(cache),
		controllers.NewStatsController(cache),
	)

	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
