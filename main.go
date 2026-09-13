package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/vijayvenkatj/threat-stream/pkg/otx"
)

func main() {

	cfg, err := otx.ParseConfig(json.RawMessage(`{"api_key": "hehehe","modified_since": "2026-09-10T00:00:00Z"}`))
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
