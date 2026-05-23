package config

import (
	"os"
)

type Config struct {
	ServerPort string
	JWTSecret  string
	Database   DatabaseConfig
}

type DatabaseConfig struct {
	Driver string
	Path   string
}

var AppConfig *Config

func InitConfig() {
	AppConfig = &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", "live-auction-secret-key-2024"),
		Database: DatabaseConfig{
			Driver: getEnv("DB_DRIVER", "sqlite3"),
			Path:   getEnv("DB_PATH", "./data/auction.db"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func GetConfig() *Config {
	if AppConfig == nil {
		InitConfig()
	}
	return AppConfig
}
