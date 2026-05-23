package models

import "time"

type UserRole string

const (
	RoleUser   UserRole = "user"
	RoleSeller UserRole = "seller"
	RoleAdmin  UserRole = "admin"
)

type User struct {
	ID        int64     `json:"id" example:"1"`
	Username  string    `json:"username" example:"testuser"`
	Password  string    `json:"-"`
	Email     string    `json:"email" example:"test@example.com"`
	Role      UserRole  `json:"role" example:"user"`
	CreatedAt time.Time `json:"created_at" example:"2024-01-01T00:00:00Z"`
	UpdatedAt time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50" example:"testuser"`
	Password string `json:"password" binding:"required,min=6" example:"123456"`
	Email    string `json:"email" binding:"required,email" example:"test@example.com"`
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
