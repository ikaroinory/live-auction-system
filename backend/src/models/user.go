package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser   UserRole = "user"
	RoleSeller UserRole = "seller"
	RoleAdmin  UserRole = "admin"
)

type User struct {
	ID        int64          `json:"id" gorm:"primaryKey;autoIncrement" example:"1"`
	Username  string         `json:"username" gorm:"size:50;uniqueIndex;not null" example:"testuser"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Email     string         `json:"email" gorm:"size:100;uniqueIndex;not null" example:"test@example.com"`
	Nickname  string         `json:"nickname" gorm:"size:50" example:"竞拍达人"`
	Avatar    string         `json:"avatar" gorm:"size:255" example:"https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"`
	Phone     string         `json:"phone" gorm:"size:20" example:"13888888888"`
	Role      UserRole       `json:"role" gorm:"size:20;not null;default:'user'" example:"user"`
	CreatedAt time.Time      `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time      `json:"updated_at" example:"2024-01-01T00:00:00Z"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50" example:"testuser"`
	Password string `json:"password" binding:"required,min=6" example:"123456"`
	Email    string `json:"email" binding:"required,email" example:"test@example.com"`
	Nickname string `json:"nickname" binding:"omitempty,max=50" example:"竞拍达人"`
	Avatar   string `json:"avatar" binding:"omitempty,url" example:"https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"`
	Phone    string `json:"phone" binding:"omitempty,max=20" example:"13888888888"`
	Role     string `json:"role" binding:"omitempty,oneof=user seller" example:"user"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"testuser"`
	Password string `json:"password" binding:"required" example:"123456"`
}

type AuthResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User  User   `json:"user"`
}
