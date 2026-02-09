import { jest } from '@jest/globals';
import { AuthService } from '@modules/auth/auth.service';

export type MockAuthService = {
  [P in keyof AuthService]: jest.Mock<any>;
};

export const createMockAuthService = (): MockAuthService => ({
  validateUser: jest.fn(),
  login: jest.fn(),
  validateResetCode: jest.fn(),
});
