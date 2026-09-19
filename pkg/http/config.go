package http

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string

	HDFSURL  string
	HDFSUser string
	// HDFSDataAddr is the host:port to rewrite WebHDFS DataNode redirects to.
	// Leave unset when the server runs inside the compose network.
	HDFSDataAddr string
}

func LoadConfig() Config {
	godotenv.Load()

	return Config{
		Port:         env("PORT", "8080"),
		HDFSURL:      env("HDFS_URL", "http://localhost:9870"),
		HDFSUser:     env("HDFS_USER", "root"),
		HDFSDataAddr: env("HDFS_DATA_ADDR", ""),
	}
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
