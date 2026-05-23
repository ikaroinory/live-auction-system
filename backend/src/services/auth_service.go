package services

import (
	"errors"

	"live-auction-system/backend/src/models"
	"live-auction-system/backend/src/repositories"
	"live-auction-system/backend/src/utils"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists         = errors.New("user already exists")
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService() *AuthService {
	return &AuthService{
		userRepo: repositories.NewUserRepository(),
	}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	existingUser, _ := s.userRepo.FindByUsername(req.Username)
	if existingUser != nil {
		return nil, ErrUserExists
	}

	existingEmail, _ := s.userRepo.FindByEmail(req.Email)
	if existingEmail != nil {
		return nil, ErrUserExists
	}

	role := models.RoleUser
	if req.Role == "seller" {
		role = models.RoleSeller
	}

	user := &models.User{
		Username: req.Username,
		Password: req.Password,
		Email:    req.Email,
		Role:     role,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !s.userRepo.CheckPassword(user, req.Password) {
		return nil, ErrInvalidCredentials
	}

	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) GetUserByID(id int64) (*models.User, error) {
	return s.userRepo.FindByID(id)
}
