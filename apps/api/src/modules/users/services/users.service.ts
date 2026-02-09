import { SearchBuildingDto } from '@common/dtos';
import {
  PaginatedResult,
  paginateQuery,
  PermissionValidator,
} from '@common/utils';
import { User, Vehicle } from '@database/entities';
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
import { RoleService } from './role.service';
import { VehiclesService } from '@modules/vehicles/vehicles.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
    private readonly vehicleService: VehiclesService,
    private readonly buildingService: BuildingsService,
    private readonly roleService: RoleService,
  ) {}

  async create(dto: CreateUserDto, creator: User): Promise<User> {
    PermissionValidator.validateBuildingAccess(creator, dto.buildingId);

    const [emailExists, building, role] = await Promise.all([
      this.userRepository.exists({ where: { email: dto.email } }),
      this.buildingService.findOneByPublicId(dto.buildingId),
      this.roleService.findByName(dto.role),
    ]);

    if (emailExists) throw new ConflictException('User already exists');
    if (!building) throw new NotFoundException('Building not found');
    if (!role) throw new NotFoundException(`Role ${dto.role} not found.`);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tempPassword = 'abc1234!'; // TODO: generator
      const hashedPassword = await this.cryptoService.hash(tempPassword);

      const newUser = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        role,
        building,
      });

      const savedUser = await queryRunner.manager.save(newUser);
      const vehicles: Vehicle[] = [];
      if (dto.description && dto.licensePlate) {
        const newVehicle = await this.vehicleService.create(
          { description: dto.description, licensePlate: dto.licensePlate },
          savedUser,
          queryRunner.manager,
        );
        if (newVehicle) {
          vehicles.push(newVehicle);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`User created with ID: ${savedUser.id}`);
      savedUser.vehicles = vehicles;
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new InternalServerErrorException('Error during user creation');
    } finally {
      await queryRunner.release();
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'building', 'vehicles'],
    });

    if (!user) {
      this.logger.warn(`User with ID: ${id} not found`);
    }

    return user;
  }
  async findOneByPublicId(publicId: string): Promise<User | null> {
    this.logger.log(`Searching for user with ID: ${publicId}`);

    const user = await this.userRepository.findOne({
      where: { publicId },
      relations: ['role', 'building', 'vehicles'],
    });

    if (!user) {
      this.logger.warn(`User with ID: ${publicId} not found`);
    }

    return user;
  }
  async findOneByEmail(email: string): Promise<User | null> {
    const result = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'building', 'vehicles'],
    });
    return result;
  }

  async update(
    publicId: string,
    dto: CreateUserDto,
    user: User,
  ): Promise<User> {
    const existingUser = await this.findOneByPublicId(publicId);
    if (!existingUser) throw new NotFoundException('User not found');

    PermissionValidator.validateBuildingAccess(
      user,
      existingUser.building.publicId,
    );

    if (dto.buildingId) {
      PermissionValidator.validateBuildingAccess(user, dto.buildingId);
    }

    const [emailExists, role, building] = await Promise.all([
      dto.email && dto.email !== existingUser.email
        ? this.userRepository.exists({ where: { email: dto.email } })
        : Promise.resolve(false),
      dto.role
        ? this.roleService.findByName(dto.role)
        : Promise.resolve(existingUser.role),
      dto.buildingId
        ? this.buildingService.findOneByPublicId(dto.buildingId)
        : Promise.resolve(existingUser.building),
    ]);

    if (emailExists) throw new ConflictException('Email already in use');
    if (!role) throw new NotFoundException(`Role ${dto.role} not found`);

    this.logger.log(`Updating user: ${publicId}`);

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatedUser = this.userRepository.merge(existingUser, {
        ...dto,
        role,
        building,
      });

      const savedUser = await queryRunner.manager.save(updatedUser);

      if (dto.description && dto.licensePlate) {
        const vehicleData = {
          description: dto.description,
          licensePlate: dto.licensePlate,
        };

        if (existingUser.vehicles && existingUser.vehicles.length > 0) {
          await this.vehicleService.update(
            existingUser.vehicles[0].id,
            vehicleData,
            queryRunner.manager,
          );
        } else {
          await this.vehicleService.create(
            vehicleData,
            savedUser,
            queryRunner.manager,
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`User ${publicId} successfully updated with transaction`);

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);

      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException('User update failed');
    } finally {
      await queryRunner.release();
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
      //delete vehicle if exists
      //if has a busy slot: make it available

      this.logger.log(`User ID: ${publicId} successfully removed`);
    } catch (error) {
      this.logger.error(
        `Failed to remove user ID: ${publicId} - ${error.message}`,
      );
      throw new InternalServerErrorException('Could not remove user');
    }
  }
}
