package main

import (
	"fmt"
	"log"

	"live-auction-system/backend/src/api"
	"live-auction-system/backend/src/config"
)

func main() {
	config.InitConfig()
	cfg := config.GetConfig()

	if err := config.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer config.CloseDatabase()

	log.Println("Database initialized successfully")

	router := api.SetupRouter()

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server starting on %s", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
