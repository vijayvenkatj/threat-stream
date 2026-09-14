# ThreatStream

Ingests subscribed threat-intelligence pulses from AlienVault OTX, publishes them to Kafka, sinks raw events to HDFS, and transforms them with Spark.

## Architecture

```text
OTX API
   |
   v
Go poller
   |
   ├── otx.pulses ──► Kafka Connect HDFS Sink ──► HDFS /data/raw/
   |                                                      |
   |                                               Spark job
   |                                                      |
   |                                             HDFS /data/processed/
   |
   └── otx.indicators
```

## Repository layout

```text
.
├── main.go
├── pkg/otx/
│   ├── client.go          # OTX HTTP client
│   ├── config.go          # Configuration
│   ├── kafka.go           # Kafka publisher
│   ├── poller.go          # Polling and pagination loop
│   └── resources.go       # OTX response and event models
├── setup/
│   ├── docker-compose.yml
│   ├── startup.sh         # HDFS dir init + connector registration
│   ├── connect/
│   │   └── Dockerfile     # Kafka Connect + HDFS3 connector plugin
│   ├── connector-config/
│   │   └── hdfs-sink.json
│   └── spark/
│       ├── Dockerfile
│       ├── conf/          # core-site.xml, hdfs-site.xml
│       └── jobs/
│           └── transform_pulses.py
└── config.json.example
```

## Local dev setup

**Prerequisites:** Go 1.23+, Docker, an OTX API key.

1. Start the stack:

   ```bash
   docker compose -f setup/docker-compose.yml up -d
   ```

2. Create HDFS directories and register the Kafka connector:

   ```bash
   ./setup/startup.sh
   ```

3. Configure the poller:

   ```bash
   cp config.json.example config.json
   # edit config.json and set api_key
   ```

4. Run the poller:

   ```bash
   go run .
   ```

5. Run the Spark transform job:

   ```bash
   docker compose -f setup/docker-compose.yml exec spark \
     /opt/spark/bin/spark-submit /opt/spark/jobs/transform_pulses.py
   ```

**UIs:**
- Kafka UI: <http://localhost:8081>
- HDFS NameNode: <http://localhost:9870>
- Kafka Connect REST: <http://localhost:8083>

## Configuration

`config.json` is git-ignored (contains the API key).

| Field | Default | Description |
| --- | --- | --- |
| `api_key` | required | OTX API key |
| `base_url` | OTX subscribed-pulses API | OTX endpoint |
| `modified_since` | `2026-09-01T00:00:00Z` | Starting timestamp |
| `initial_backoff` | `1s` | Delay between polls |
| `max_backoff` | `1h` | Max retry delay |
| `pulse_topic` | `otx.pulses` | Kafka topic for pulses |
| `indicator_topic` | `otx.indicators` | Kafka topic for indicators |

## Kafka listeners

| Listener | Address |
| --- | --- |
| Host | `localhost:9092` |
| Containers | `kafka:29092` |
