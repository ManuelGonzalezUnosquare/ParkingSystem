import { User } from '@database/entities';
import { CreateUserDto } from '@modules/auth/dtos';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from '@utils/services';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${dto.email}`);
    if (await this.userRepository.exists({ where: { email: dto.email } })) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const hashedPassword = await this.cryptoService.hash(dto.password);
      const newUser = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(newUser);

      this.logger.log(`User successfully created with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      throw new InternalServerErrorException(
        'An unexpected error occurred during user creation',
      );
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all active users');
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

    const user = await this.userRepository.findOne({
      where: { publicId },
      relations: ['role'],
    });

    if (!user) {
      this.logger.warn(`User with ID: ${publicId} not found`);
    }

    return user;
  }
  async findOneByEmail(email: string): Promise<User | null> {
    const result = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    return result;
  }

  async update(
    publicId: string,
    updateData: Partial<CreateUserDto>,
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
        `Error updating user ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Error updating user record');
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
      await this.userRepository.softDelete(user.id);
      this.logger.log(`User ID: ${publicId} successfully removed`);
    } catch (error) {
      this.logger.error(
        `Failed to remove user ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Could not remove user');
    }
  }
}
