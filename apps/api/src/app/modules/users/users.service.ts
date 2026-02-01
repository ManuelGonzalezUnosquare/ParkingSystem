import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "@org/shared-models";
import { Repository } from "typeorm";
import { User } from "../../database/entities";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${dto.email}`);

    try {
      const newUser = this.userRepository.create(dto);
      const savedUser = await this.userRepository.save(newUser);

      this.logger.log(`User successfully created with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      throw new InternalServerErrorException(
        "An unexpected error occurred during user creation"
      );
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log("Fetching all active users");
    return await this.userRepository.find();
  }

  async findOneById(id: number): Promise<User | null> {
    this.logger.log(`Searching for user with ID: ${id}`);
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      this.logger.warn(`User with ID: ${id} not found`);
    }

    return user;
  }
  async findOneByPublicId(publicId: string): Promise<User | null> {
    this.logger.log(`Searching for user with ID: ${publicId}`);
    const user = await this.userRepository.findOneBy({ publicId });

    if (!user) {
      this.logger.warn(`User with ID: ${publicId} not found`);
    }

    return user;
  }

  async update(
    publicId: string,
    updateData: Partial<CreateUserDto>
  ): Promise<User> {
    this.logger.log(`Attempting to update user ID: ${publicId}`);

    const user = await this.findOneByPublicId(publicId);

    if (!user) {
      this.logger.warn(`User with ID: ${publicId} not found`);
      throw new NotFoundException(`User with ID "${publicId}" not found`);
    }

    const updatedUser = Object.assign(user, updateData);

    try {
      const saved = await this.userRepository.save(updatedUser);
      this.logger.log(`User ID: ${publicId} successfully updated`);
      return saved;
    } catch (error) {
      this.logger.error(
        `Error updating user ID: ${publicId} - ${error.message}`
      );
      throw new InternalServerErrorException("Error updating user record");
    }
  }

  async remove(publicId: string): Promise<void> {
    this.logger.log(`Initiating removal for user ID: ${publicId}`);
    const user = await this.findOneByPublicId(publicId);

    if (!user) {
      this.logger.warn(`User with ID: ${publicId} not found`);
      throw new NotFoundException(`User with ID "${publicId}" not found`);
    }

    try {
      await this.userRepository.remove(user);
      this.logger.log(`User ID: ${publicId} successfully removed`);
    } catch (error) {
      this.logger.error(
        `Failed to remove user ID: ${publicId} - ${error.message}`
      );
      throw new InternalServerErrorException("Could not remove user");
    }
  }
}
