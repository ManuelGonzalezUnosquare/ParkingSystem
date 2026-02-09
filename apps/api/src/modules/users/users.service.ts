import { SearchBuildingDto } from '@common/dtos';
import {
  PaginatedResult,
  paginateQuery,
  PermissionValidator,
} from '@common/utils';
import { Role, User } from '@database/entities';
import { CreateUserDto } from '@modules/auth/dtos';
import { BuildingsService } from '@modules/buildings/buildings.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from '@utils/services';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly cryptoService: CryptoService,
    private readonly buildingService: BuildingsService,
  ) {}

  async create(dto: CreateUserDto, user: User): Promise<User> {
    PermissionValidator.validateBuildingAccess(user, dto.buildingId);

    this.logger.log(`Attempting to create user with email: ${dto.email}`);

    const [emailExists, building, role] = await Promise.all([
      this.userRepository.exists({ where: { email: dto.email } }),
      this.buildingService.findOneByPublicId(dto.buildingId),
      this.roleRepository.findOneBy({ name: dto.role }),
    ]);

    if (emailExists)
      throw new ConflictException('User with this email already exists');
    if (!building) throw new NotFoundException('Building not found');
    if (!role) throw new NotFoundException(`Role ${dto.role} not found.`);

    const vehicles =
      dto.description && dto.licensePlate
        ? [{ description: dto.description, licensePlate: dto.licensePlate }]
        : [];

    const tempPassword = 'abc1234!'; //TODO: change this to a random string generator

    try {
      const hashedPassword = await this.cryptoService.hash(tempPassword);
      const newUser = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role,
        building,
        vehicles: vehicles,
      });
      const savedUser = await this.userRepository.save(newUser);

      // TODO: Enviar email con tempPassword aquí

      this.logger.log(`User successfully created with ID: ${savedUser.id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      throw new InternalServerErrorException(
        'An unexpected error occurred during user creation',
      );
    }
  }

  async findAll(
    filters: SearchBuildingDto,
    user: User,
  ): Promise<PaginatedResult<User>> {
    PermissionValidator.validateBuildingAccess(user, filters.buildingId);
    const publicId = filters.buildingId;

    const { globalFilter } = filters;

    if (!publicId) {
      throw new BadRequestException('Target not found');
    }

    const query = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .leftJoin('users.building', 'building')
      .leftJoinAndSelect('users.vehicles', 'vehicles')
      .where('building.publicId = :publicId', { publicId });

    if (globalFilter) {
      const queryOptions: any = [
        { firstName: Like(`%${globalFilter}%`) },
        { lastName: Like(`%${globalFilter}%`) },
        { email: Like(`%${globalFilter}%`) },
      ];
      console.log(query, query.getQueryAndParameters());

      query.andWhere(queryOptions);
    }

    return await paginateQuery(query, filters);
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
      relations: ['role', 'building'],
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
    dto: CreateUserDto,
    user: User,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { publicId },
      relations: ['building', 'role', 'vehicles'],
    });

    if (!existingUser) throw new NotFoundException('User not found');

    PermissionValidator.validateBuildingAccess(
      user,
      existingUser.building.publicId,
    );
    if (dto.buildingId) {
      PermissionValidator.validateBuildingAccess(user, dto.buildingId);
    }

    this.logger.log(`Updating user: ${publicId}`);

    const validations = [];
    if (dto.email && dto.email !== existingUser.email) {
      validations.push(
        this.userRepository.exists({ where: { email: dto.email } }),
      );
    } else {
      validations.push(Promise.resolve(false));
    }

    if (dto.role) {
      validations.push(this.roleRepository.findOneBy({ name: dto.role }));
    } else {
      validations.push(Promise.resolve(existingUser.role));
    }

    const [emailExists, role] = await Promise.all(validations);

    if (emailExists) throw new ConflictException('Email already in use');
    if (!role) throw new NotFoundException(`Role ${dto.role} not found`);

    if (dto.description && dto.licensePlate) {
      const vehicleData = {
        description: dto.description,
        licensePlate: dto.licensePlate,
      };
      if (existingUser.vehicles.length > 0) {
        Object.assign(existingUser.vehicles[0], vehicleData);
      } else {
        existingUser.vehicles = [vehicleData as any];
      }
    }

    try {
      const updatedUser = this.userRepository.merge(existingUser, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        role,
      });

      const savedUser = await this.userRepository.save(updatedUser);
      this.logger.log(`User ${publicId} successfully updated`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      throw new InternalServerErrorException('User update failed');
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
