import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/prisma.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    name: 'Test User',
    password: 'hashedpassword',
    role: 'cashier',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if credentials are valid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        name: 'Test User',
        role: 'cashier',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens with user data for valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.login({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: 1,
          username: 'testuser',
          name: 'Test User',
          role: 'cashier',
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should return new access token for valid refresh token', async () => {
      const mockPayload = { sub: 1, username: 'testuser', role: 'cashier' };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new_access_token');

      const result = await service.refreshTokens('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.refreshTokens('invalid_refresh_token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockPayload = { sub: 999, username: 'nonexistent', role: 'cashier' };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshTokens('valid_refresh_token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.hashPassword('password');

      expect(result).toBe('hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });
});
