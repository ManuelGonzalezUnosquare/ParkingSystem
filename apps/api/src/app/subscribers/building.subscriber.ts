import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from "typeorm";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Building, ParkingSlot } from "../database/entities";

@Injectable()
@EventSubscriber()
export class BuildingSubscriber
  implements EntitySubscriberInterface<Building>, OnModuleInit
{
  private readonly logger = new Logger(BuildingSubscriber.name);

  constructor(private readonly dataSource: DataSource) {
    // Register this subscriber into the TypeORM DataSource
    this.logger.log("========================== subscriber constryuctor");
    this.dataSource.subscribers.push(this);
  }

  onModuleInit() {
    const isRegistered = this.dataSource.subscribers.some(
      (s) => s.constructor.name === BuildingSubscriber.name
    );

    if (!isRegistered) {
      this.dataSource.subscribers.push(this);
      this.logger.log(
        "BuildingSubscriber explicitly registered in DataSource."
      );
    }
  }

  /**
   * Indicates that this subscriber only listens to Building entity events.
   */
  listenTo() {
    return Building;
  }

  /**
   * Called after a Building entity is inserted into the database.
   */
  async afterInsert(event: InsertEvent<Building>) {
    const { entity, manager } = event;

    if (entity.totalSlots && entity.totalSlots > 0) {
      const slots: Partial<ParkingSlot>[] = [];

      for (let i = 1; i <= entity.totalSlots; i++) {
        // Generate sequence: S-001, S-002, etc.
        const slotNumber = `S-${i.toString().padStart(3, "0")}`;

        slots.push({
          slotNumber,
          isAvailable: true,
          building: entity,
        });
      }

      try {
        // Use the event manager to persist slots within the same transaction
        await manager.getRepository(ParkingSlot).save(slots);

        this.logger.log(
          `Successfully generated ${entity.totalSlots} slots for building: ${entity.name}`
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate slots for building ${entity.name}`,
          error.stack
        );
      }
    }
  }
}
