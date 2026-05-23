package config

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDatabase() error {
	cfg := GetConfig()

	if err := os.MkdirAll(filepath.Dir(cfg.Database.Path), 0755); err != nil {
		return err
	}

	db, err := sql.Open(cfg.Database.Driver, cfg.Database.Path)
	if err != nil {
		return err
	}

	if err := db.Ping(); err != nil {
		return err
	}

	DB = db

	if err := createTables(); err != nil {
		return err
	}

	return nil
}

func createTables() error {
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username VARCHAR(50) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		role VARCHAR(20) NOT NULL DEFAULT 'user',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := DB.Exec(usersTable)
	return err
}

func GetDB() *sql.DB {
	if DB == nil {
		InitDatabase()
	}
	return DB
}

func CloseDatabase() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
