import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Building, Role, User } from "./entities";

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  private readonly fakePassword: string = "Admin1234!";
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>
  ) {}

  async onApplicationBootstrap() {
    this.logger.log("Running Database Seeder...");
    await this.seedRoles();
    await this.seedRootUser();

    const testBuilding = await this.seedTestingBuilding();
    if (testBuilding) {
      await this.seedAdminUser(testBuilding);
    }
    this.logger.log("Seeding completed.");
  }

  //required seeds
  private async seedRoles() {
    const roles = [
      { name: "ROOT", description: "Super Admin - Access to all buildings" },
      {
        name: "ADMIN",
        description: "Building Admin - Access to specific building",
      },
      { name: "USER", description: "Common User - Resident/Employee" },
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
    const rootEmail = "root@unosquare.com"; // Puedes sacar esto de un .env
    const rootExists = await this.userRepo.findOne({
      where: { email: rootEmail },
    });

    if (!rootExists) {
      const rootRole = await this.roleRepo.findOne({ where: { name: "ROOT" } });

      const hashedPassword = await bcrypt.hash(this.fakePassword, 10);

      const rootUser = this.userRepo.create({
        firstName: "System",
        lastName: "Root",
        email: rootEmail,
        password: hashedPassword,
        role: rootRole,
        status: "ACTIVE",
        priorityScore: 0,
        building: null, // Root no pertenece a un edificio específico
      });

      await this.userRepo.save(rootUser);
      this.logger.log(
        "Default Root User created (root@unosquare.com / Admin123!)"
      );
    }
  }

  //testing seeds
  private async seedAdminUser(building: Building) {
    const adminEmail = "admin@unosquare.com";
    const adminExists = await this.userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const adminRole = await this.roleRepo.findOne({
        where: { name: "ADMIN" },
      });
      const hashedPassword = await bcrypt.hash(this.fakePassword, 10);

      const adminUser = this.userRepo.create({
        firstName: "Building",
        lastName: "Manager",
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
        status: "ACTIVE",
        priorityScore: 0,
        building: building, // Linked to the test building
      });

      await this.userRepo.save(adminUser);
      this.logger.log(
        `Admin user created for building '${building.name}' (admin@unosquare.com).`
      );
    }
  }

  private async seedTestingBuilding() {
    const buildingName = "Central Tower";
    let building = await this.buildingRepo.findOne({
      where: { name: buildingName },
    });

    if (!building) {
      building = this.buildingRepo.create({
        name: buildingName,
        address: "123 Unosquare Blvd",
        totalSlots: 15,
      });

      building = await this.buildingRepo.save(building);
      this.logger.log(`Test building '${buildingName}' created.`);
    }
    return building;
  }
}
