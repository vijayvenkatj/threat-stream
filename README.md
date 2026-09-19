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
├── cmd/
│   ├── ingestion/
│   │   └── main.go        # OTX poller entrypoint
│   └── server/
│       └── main.go        # HTTP server entrypoint
├── pkg/
│   ├── otx/
│   │   ├── client.go          # OTX HTTP client
│   │   ├── config.go          # Configuration
│   │   ├── kafka.go           # Kafka publisher
│   │   ├── poller.go          # Polling and pagination loop
│   │   └── resources.go       # OTX response and event models
│   ├── hdfs/
│   │   └── client.go          # WebHDFS reader (stdlib net/http)
│   ├── store/
│   │   ├── pulses.go          # Decodes the HDFS pulse feed into otx.Pulse
│   │   └── cache.go           # In-memory snapshot, refreshed on a timer
│   ├── query/
│   │   └── query.go           # Generic filter/sort/page helpers
│   └── http/
│       ├── config.go          # Server configuration (godotenv)
│       ├── router.go          # Router (DI'd controllers)
│       ├── pagination/        # Generic keyset (cursor) pagination
│       └── controllers/       # HTTP handlers
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

3. Configure OTX access (used by both the poller and the HTTP server's proxy routes):

   ```bash
   cp config.json.example config.json
   # edit config.json and set api_key
   ```

4. Run the poller:

   ```bash
   go run ./cmd/ingestion
   ```

   Run the HTTP server (optional, separate process):

   ```bash
   go run ./cmd/server
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

`cmd/server` reads its settings from the environment (or a `.env` file — see `.env.example`).

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | HTTP listen port |
| `HDFS_URL` | `http://localhost:9870` | NameNode WebHDFS root |
| `HDFS_USER` | `root` | `user.name` sent with WebHDFS requests |
| `HDFS_DATA_ADDR` | unset | `host:port` to rewrite DataNode redirects to. Set it to `localhost:9864` when running the server on the host; leave unset inside the compose network. |

## API

### `GET /api/raw/pulses`

Raw pulse records straight out of `/data/raw/otx.pulses`, oldest first, exactly as the
Kafka Connect sink wrote them.

| Query param | Default | Description |
| --- | --- | --- |
| `limit` | `50` | Items per page, 1–200 |
| `cursor` | — | Opaque page position; take it from a `next`/`prev` link, never build it |

```json
{
  "items": [ { "id": "…", "name": "…", "indicators": [] } ],
  "limit": 50,
  "next": "/api/raw/pulses?cursor=eyJrIjoi…&limit=50",
  "prev": null
}
```

`next`/`prev` are `null` at the ends of the collection. Errors are `{"error": "…"}`.

Pagination lives in `pkg/http/pagination` and is generic: an endpoint hands it a sorted
key slice and gets cursors, links and the JSON envelope back.

### `GET /api/pulses`

Searchable, sortable, page-numbered pulse listing, served from an in-memory cache
(`pkg/store.Cache`) that's decoded from the HDFS feed and deduped by ID (latest revision
wins) once at startup and refreshed every minute — results can lag the feed by up to that
long, and `GET /api/indicators/{id}` is a lookup into the same cache.

| Query param | Default | Description |
| --- | --- | --- |
| `page` | `1` | 1-indexed |
| `limit` | `20` | Items per page, 1–200 |
| `search` | — | Case-insensitive substring over name, description, adversary |
| `tlp` | — | Exact match: `WHITE`, `GREEN`, `AMBER`, or `RED` |
| `adversary` | — | Exact match, case-insensitive |
| `country` | — | Membership in `targeted_countries`, case-insensitive |
| `sort` | `modified` | `modified`, `created`, or `name` |
| `order` | `desc` | `asc` or `desc` |

```json
{
  "data": [ { "id": "…", "name": "…", "tlp": "GREEN", "indicators": [] } ],
  "page": 1,
  "limit": 20,
  "total": 100
}
```

`total` is the filtered count, not the whole corpus. Bad `tlp`/`sort`/`order`/`page`/`limit`
is a 400.

### `GET /api/pulses/{id}`

Proxies OTX's pulse-detail endpoint (`GET /api/v1/pulses/{id}`) and relays the response
unshaped — status code included, so a bad ID reaches the frontend as OTX's own 404.

### `GET /api/indicators`

Same shape as `/api/pulses`, over indicators flattened out of every pulse.

| Query param | Default | Description |
| --- | --- | --- |
| `page` | `1` | 1-indexed |
| `limit` | `20` | Items per page, 1–200 |
| `search` | — | Case-insensitive substring over indicator, content, title |
| `type` | — | Exact match, case-insensitive (`IPv4`, `domain`, …) |
| `status` | — | `active` (`is_active=1`) or `inactive` (`is_active=0`) |
| `pulse_id` | — | Exact match on the owning pulse's ID |
| `sort` | `created` | `created` or `type` |
| `order` | `desc` | `asc` or `desc` |

```json
{
  "data": [ { "id": 12345, "indicator": "…", "PulseID": "…", "PulseName": "…" } ],
  "page": 1,
  "limit": 20,
  "total": 100
}
```

### `GET /api/indicators/{id}`

Looks `{id}` (numeric) up in the same indicator set `/api/indicators` searches — OTX has no
public get-indicator-by-ID endpoint, so this isn't a proxy. `404` if not found, `400` if
`{id}` isn't numeric.

`pkg/query` is the generic layer behind all four: `Filter` over `iter.Seq[E]`, `SortBy` over
any `cmp.Ordered` key, and `Paginate` for the `page`/`limit`/`total` envelope.

## Kafka listeners

| Listener | Address |
| --- | --- |
| Host | `localhost:9092` |
| Containers | `kafka:29092` |
