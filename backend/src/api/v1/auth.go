package api

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"live-auction-system/backend/src/models"
	"live-auction-system/backend/src/services"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: services.NewAuthService(),
	}
}

// Register 用户注册
// @Summary 用户注册
// @Description 创建新用户账号，支持普通用户和商家角色
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "注册信息"
// @Success 201 {object} models.Response{data=models.AuthResponse} "注册成功"
// @Failure 400 {object} models.Response "参数错误"
// @Failure 409 {object} models.Response "用户已存在"
// @Failure 500 {object} models.Response "服务器错误"
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "无效的请求参数: " + err.Error(),
		})
		return
	}

	resp, err := h.authService.Register(&req)
	if err != nil {
		if errors.Is(err, services.ErrUserExists) {
			c.JSON(http.StatusConflict, models.Response{
				Code:    409,
				Message: "用户名或邮箱已存在",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: "注册失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "用户注册成功",
		Data:    resp,
	})
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户使用用户名和密码登录，返回JWT Token
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "登录信息"
// @Success 200 {object} models.Response{data=models.AuthResponse} "登录成功"
// @Failure 400 {object} models.Response "参数错误"
// @Failure 401 {object} models.Response "认证失败"
// @Failure 500 {object} models.Response "服务器错误"
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "无效的请求参数: " + err.Error(),
		})
		return
	}

	resp, err := h.authService.Login(&req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, models.Response{
				Code:    401,
				Message: "无效的用户名或密码",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: "登录失败: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "登录成功",
		Data:    resp,
	})
}

// GetCurrentUser 获取当前用户信息
// @Summary 获取当前用户信息
// @Description 获取当前登录用户的详细信息
// @Tags 认证
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.Response{data=models.User} "获取成功"
// @Failure 401 {object} models.Response "未认证"
// @Failure 404 {object} models.Response "用户不存在"
// @Router /api/v1/auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.Response{
			Code:    401,
			Message: "用户未认证",
		})
		return
	}

	user, err := h.authService.GetUserByID(userID.(int64))
	if err != nil {
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: "用户不存在",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "成功",
		Data:    user,
	})
}
