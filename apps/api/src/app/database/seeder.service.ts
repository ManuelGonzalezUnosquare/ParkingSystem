import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Role, User } from "./entities";

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async onApplicationBootstrap() {
    this.logger.log("Running Database Seeder...");
    await this.seedRoles();
    await this.seedRootUser();
    this.logger.log("Seeding completed.");
  }

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

      const hashedPassword = await bcrypt.hash("Admin123!", 10);

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
}
