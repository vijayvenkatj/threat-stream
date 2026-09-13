package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/vijayvenkatj/threat-stream/pkg/otx"
)

func main() {

	cfg, err := otx.LoadConfig("config.json")
	if err != nil {
		log.Print(err)
		return
	}

	ctx := context.Background()

	httpClient := &http.Client{Timeout: 5 * time.Minute}
	client := otx.NewClient(cfg, httpClient)

	publisher := otx.NewPublisher(ctx, "localhost:9092", []string{cfg.PulseTopic, cfg.IndicatorTopic})
	poller := otx.NewPoller(cfg, client, publisher)

	poller.Run(ctx)
}
