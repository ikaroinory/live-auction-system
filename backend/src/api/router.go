package api

import (
	"github.com/gin-gonic/gin"
	authHandler "live-auction-system/backend/src/api/v1"
	"live-auction-system/backend/src/middleware"
	"live-auction-system/backend/src/models"
)

// SetupRouter 设置API路由
func SetupRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS())

	// Health Check
	router.GET("/health", healthCheck)

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

// healthCheck 健康检查接口
// @Summary 健康检查
// @Description 检查服务是否正常运行
// @Tags 系统
// @Accept json
// @Produce json
// @Success 200 {object} models.Response
// @Router /health [get]
func healthCheck(c *gin.Context) {
	c.JSON(200, models.Response{
		Code:    200,
		Message: "service is healthy",
	})
}
