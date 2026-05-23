package config

import (
	"os"
	"path/filepath"

	"live-auction-system/backend/src/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() error {
	cfg := GetConfig()

	if err := os.MkdirAll(filepath.Dir(cfg.Database.Path), 0755); err != nil {
		return err
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.Database.Path), &gorm.Config{})
	if err != nil {
		return err
	}

	if err := AutoMigrate(); err != nil {
		return err
	}

	return nil
}

func AutoMigrate() error {
	return DB.AutoMigrate(&models.User{})
}

func GetDB() *gorm.DB {
	if DB == nil {
		InitDatabase()
	}
	return DB
}

func CloseDatabase() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
