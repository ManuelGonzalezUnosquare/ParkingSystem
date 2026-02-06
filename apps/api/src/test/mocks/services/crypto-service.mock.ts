import { jest } from '@jest/globals';
import { CryptoService } from '@utils/services';

export type MockCryptoService = {
  [P in keyof CryptoService]: jest.Mock<any>;
};

export const createMockCryptoService = (): MockCryptoService => ({
  hash: jest.fn(),
  compare: jest.fn(),
});
