import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import {
  createMockUserService,
  MockUserService,
} from "../../test/mocks/services/user-service.mock";
import { JwtService } from "@nestjs/jwt";
import { createMockCryptoService } from "../../test/mocks/services/crypto-service.mock";
import { CryptoService } from "../utils/services";

describe("AuthService", () => {
  let service: AuthService;
  let userService: MockUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMockUserService(),
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: createMockCryptoService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<MockUserService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
