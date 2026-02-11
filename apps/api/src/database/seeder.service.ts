import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../utils/services';
import { Building, Role, User } from './entities';
import { RoleEnum } from '@parking-system/libs';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  private readonly rootUserInfo = {
    email: 'root@user.com',
    password: '1234!',
  };
  private readonly adminUserInfo = {
    email: 'admin@user.com',
    password: 'abcd!',
  };
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    this.rootUserInfo = {
      email:
        configService.get<string>('ROOT_USER_EMAIL') ?? this.rootUserInfo.email,
      password:
        configService.get<string>('ROOT_USER_PWD') ??
        this.rootUserInfo.password,
    };
    this.adminUserInfo = {
      email:
        configService.get<string>('ADMIN_USER_EMAIL') ??
        this.adminUserInfo.email,
      password:
        configService.get<string>('ADMIN_USER_PWD') ??
        this.adminUserInfo.password,
    };
  }

  async onApplicationBootstrap() {
    this.logger.log('Running Database Seeder...');
    await this.seedRoles();
    await this.seedRootUser();

    const testBuilding = await this.seedTestingBuilding();
    if (testBuilding) {
      await this.seedAdminUser(testBuilding);
    }
    this.logger.log('Seeding completed.');
  }

  //required seeds
  private async seedRoles() {
    const roles = [
      {
        name: RoleEnum.ROOT,
        description: 'Super Admin - Access to all buildings',
      },
      {
        name: RoleEnum.ADMIN,
        description: 'Building Admin - Access to specific building',
      },
      { name: RoleEnum.USER, description: 'Common User - Resident/Employee' },
    ];

    for (const roleData of roles) {
      const exists = await this.roleRepo.findOne({
        where: { name: roleData.name },
      });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create(roleData));
        this.logger.log(`Role ${roleData.name} created.`);
      }
    }
  }

  private async seedRootUser() {
    const rootExists = await this.userRepo.findOne({
      where: { email: this.rootUserInfo.email },
    });

    if (!rootExists) {
      const rootRole = await this.roleRepo.findOne({
        where: { name: RoleEnum.ROOT },
      });

      const hashedPassword = await this.cryptoService.hash(
        this.rootUserInfo.password,
      );

      const rootUser = this.userRepo.create({
        firstName: 'System',
        lastName: 'Root',
        email: this.rootUserInfo.email,
        password: hashedPassword,
        role: rootRole,
        status: 'ACTIVE',
        priorityScore: 0,
        building: null, // Not building for root
      });

      await this.userRepo.save(rootUser);
      this.logger.log(`Default Root User created (${this.rootUserInfo.email})`);
    }
  }

  //testing seeds
  private async seedAdminUser(building: Building) {
    const adminExists = await this.userRepo.findOne({
      where: { email: this.adminUserInfo.email },
    });

    if (!adminExists) {
      const adminRole = await this.roleRepo.findOne({
        where: { name: RoleEnum.ADMIN },
      });
      const hashedPassword = await this.cryptoService.hash(
        this.adminUserInfo.password,
      );

      const adminUser = this.userRepo.create({
        firstName: 'Building',
        lastName: 'Manager',
        email: this.adminUserInfo.email,
        password: hashedPassword,
        role: adminRole,
        status: 'ACTIVE',
        priorityScore: 0,
        building: building, // Linked to the test building
      });

      await this.userRepo.save(adminUser);
      this.logger.log(
        `Admin user created for building '${building.name}' (${this.adminUserInfo.email}).`,
      );
    }
  }

  private async seedTestingBuilding() {
    const buildingName = 'Central Tower';
    let building = await this.buildingRepo.findOne({
      where: { name: buildingName },
    });

    if (!building) {
      building = this.buildingRepo.create({
        name: buildingName,
        address: '123 Unosquare Blvd',
        totalSlots: 3,
      });

      building = await this.buildingRepo.save(building);
      this.logger.log(`Test building '${buildingName}' created.`);
    }
    return building;
  }
}
