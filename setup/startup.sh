#!/bin/sh
set -e

NAMENODE="http://localhost:9870"
CONNECT="http://localhost:8083"
CONNECTOR_CONFIG="$(dirname "$0")/connector-config/hdfs-sink.json"

# ── HDFS directories ──────────────────────────────────────────────────────────

echo "Waiting for HDFS NameNode..."
until curl -sf "$NAMENODE/webhdfs/v1/?op=LISTSTATUS&user.name=root" > /dev/null; do
  sleep 3
done

echo "Creating HDFS directories..."
curl -sf -X PUT "$NAMENODE/webhdfs/v1/data?op=MKDIRS&permission=777&user.name=root"
curl -sf -X PUT "$NAMENODE/webhdfs/v1/data/raw?op=MKDIRS&permission=777&user.name=root"
curl -sf -X PUT "$NAMENODE/webhdfs/v1/data/processed?op=MKDIRS&permission=777&user.name=root"

# ── Kafka Connect connector ───────────────────────────────────────────────────

echo "Waiting for Kafka Connect..."
until curl -sf "$CONNECT/connectors" > /dev/null; do
  sleep 5
done

echo "Registering HDFS connector..."
curl -f -sS -X PUT \
  -H "Content-Type: application/json" \
  --data @"$CONNECTOR_CONFIG" \
  "$CONNECT/connectors/hdfs-raw-sink/config"

echo
echo "Done."
