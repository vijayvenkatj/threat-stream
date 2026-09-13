# ThreatStream

ThreatStream ingests subscribed threat-intelligence pulses from the AlienVault Open Threat Exchange (OTX) API and publishes them to Kafka for downstream processing.

The current implementation is a Go service. Spark and HDFS are planned components and are described in the roadmap below.

## Current architecture

```text
OTX API
   |
   v
Go poller
   |
   +--> otx.pulses     (complete pulse events as JSON)
   |
   +--> otx.indicators (normalised indicator events as JSON)
         |
         v
       Kafka
```

The poller:

- Requests subscribed OTX pulses modified since the configured timestamp.
- Publishes each pulse to the configured pulse topic.
- Extracts valid indicators from each pulse and publishes them to the configured indicator topic.
- Follows paginated OTX responses.
- Retries polling with exponential backoff when a poll fails.

## Planned architecture

Spark and HDFS are the next two components to add:

```text
                         +----------------------+
                         | Kafka                |
                         | otx.pulses           |
                         | otx.indicators       |
                         +----------+-----------+
                                    |
                 +------------------+------------------+
                 |                                     |
                 | direct Kafka ingestion              | Spark Structured Streaming
                 v                                     v
        HDFS: /threat-stream/raw/              transform, validate,
        immutable source events                enrich, and deduplicate
                                                       |
                                                       v
                                            HDFS: /threat-stream/processed/
                                            query-ready events
```

HDFS should receive data through both paths:

1. **Raw path:** consume the Kafka topics directly and write the original events to the `raw` directory. Raw data should remain immutable and provide a replay/audit source.
2. **Processed path:** have Spark consume Kafka, apply the required transformations, and write the resulting records to the `processed` directory.

The final storage format, schemas, partitioning strategy, checkpoint locations, and retention policy should be decided as part of the Spark/HDFS implementation.

## Repository layout

```text
.
├── main.go                  # Service entry point
├── pkg/otx/
│   ├── client.go            # OTX HTTP client
│   ├── config.go            # Configuration parsing and defaults
│   ├── kafka.go             # Kafka publisher and topic creation
│   ├── poller.go            # Polling and pagination loop
│   └── resources.go          # OTX response and event models
├── config.json.example      # Example local configuration
├── docker-compose.yml       # Local Kafka and Kafka UI
├── go.mod
└── go.sum
```

## Prerequisites

- Go 1.26.3 or compatible
- Docker and Docker Compose
- An OTX API key

## Getting started

1. Start Kafka and the Kafka UI:

   ```bash
   docker compose up -d
   ```

2. Create the local configuration file:

   ```bash
   cp config.json.example config.json
   ```

3. Set `api_key` in `config.json`. The remaining fields can be left at their defaults for a local run.

4. Start the poller:

   ```bash
   go run .
   ```

The Go service connects to Kafka at `localhost:9092`. On startup it creates the configured topics if they do not already exist. Kafka UI is available at <http://localhost:8081>.

## Configuration

Configuration is read from `config.json`, which is intentionally ignored by Git because it contains the OTX API key.

| Field | Description | Default |
| --- | --- | --- |
| `api_key` | OTX API key | required |
| `base_url` | OTX subscribed-pulses endpoint | OTX subscribed-pulses API |
| `modified_since` | Starting point for modified pulses | `2026-09-01T00:00:00Z` |
| `initial_backoff` | Delay after a successful poll or before retry backoff begins | `1s` |
| `max_backoff` | Maximum retry delay | `1h` |
| `pulse_topic` | Kafka topic for complete pulses | `otx.pulses` |
| `indicator_topic` | Kafka topic for indicators | `otx.indicators` |

The example configuration uses an ISO-8601/RFC 3339 timestamp for `modified_since`.

## Kafka connection details

The Compose file exposes two Kafka listeners:

- Host applications: `localhost:9092`
- Containers on the Compose network: `kafka:29092`

The default topic names are `otx.pulses` and `otx.indicators`. Topics are created with one partition and one replica for local development.

## Development

Run the test suite with:

```bash
go test ./...
```

Before committing changes, also run:

```bash
gofmt -w main.go pkg/otx/*.go
go test ./...
```

## Roadmap

### Spark

- Add a Spark Structured Streaming application that consumes `otx.pulses` and `otx.indicators`.
- Define stable input and output schemas.
- Validate, normalise, enrich, and deduplicate events.
- Write query-ready records to the HDFS `processed` directory.
- Add Spark checkpoints so processing can resume safely.

### HDFS

- Add a local HDFS service and persistent volume configuration.
- Add a direct Kafka-to-HDFS raw sink for the pulse and indicator topics.
- Add the Spark-to-HDFS processed sink.
- Use separate paths for immutable raw events and transformed processed events:

  ```text
  /threat-stream/raw/
  /threat-stream/processed/
  ```

- Partition the data by event type and ingestion date.
- Document retention, replay, schema evolution, and access permissions.

## License

No license has been declared yet.
