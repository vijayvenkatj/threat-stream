package main

import (
	"context"
	"fmt"
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

	httpClient := &http.Client{Timeout: 5 * time.Minute}
	client := otx.NewClient(cfg, httpClient)

	outputChan := make(chan otx.Pulse)
	poller := otx.NewPoller(cfg, client, outputChan)

	go func() {
		for result := range outputChan {
			fmt.Println(result.Name)
		}
	}()

	poller.Run(context.Background())
}
