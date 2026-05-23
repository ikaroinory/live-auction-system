package api

import (
	"github.com/gin-gonic/gin"
	authHandler "live-auction-system/backend/src/api/v1"
	"live-auction-system/backend/src/middleware"
)

func SetupRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"code":    200,
			"message": "service is healthy",
		})
	})

	apiV1 := router.Group("/api/v1")
	{
		handler := authHandler.NewAuthHandler()

		authGroup := apiV1.Group("/auth")
		{
			authGroup.POST("/register", handler.Register)
			authGroup.POST("/login", handler.Login)
			authGroup.GET("/me", middleware.JWTAuth(), handler.GetCurrentUser)
		}

		protectedGroup := apiV1.Group("")
		protectedGroup.Use(middleware.JWTAuth())
		{
			protectedGroup.GET("/profile", handler.GetCurrentUser)
		}

		sellerGroup := apiV1.Group("/seller")
		sellerGroup.Use(middleware.JWTAuth(), middleware.RequireSeller())
		{
		}

		adminGroup := apiV1.Group("/admin")
		adminGroup.Use(middleware.JWTAuth(), middleware.RequireAdmin())
		{
		}
	}

	return router
}
