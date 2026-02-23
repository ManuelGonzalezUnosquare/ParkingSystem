import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RaffleService } from './raffle.service';
import { DataSource } from 'typeorm';
import { User } from '@database/entities';
import { RoleEnum } from '@parking-system/libs';

@Injectable()
export class RaffleCron {
  private readonly logger = new Logger(RaffleCron.name);

  constructor(
    private readonly raffleService: RaffleService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Ejecución automática: Todos los lunes a las 00:00
   * Puedes cambiarlo a EVERY_MINUTE para probarlo localmente.
   */
  @Cron(process.env.RAFFLE_CRON_SCHEDULE || '0 0 1 */3 *')
  async handleAutomatedRaffle() {
    this.logger.log('--- Automated Raffle Process Started ---');

    try {
      // 1. Buscamos un usuario con rol ROOT o ADMIN para que actúe como responsable técnico
      // en la auditoría del sorteo automático.
      const technicalUser = await this.dataSource.manager.findOne(User, {
        where: { role: { name: RoleEnum.ROOT } },
      });

      if (!technicalUser) {
        this.logger.error(
          'System User (ROOT) not found. Cannot execute automated raffle.',
        );
        return;
      }

      const today = new Date();
      const nextRaffleArray =
        await this.raffleService.findRafflesToExecuteToday();

      if (nextRaffleArray.length === 0) {
        this.logger.log(
          `No raffles pending to execute on ${today.toDateString()}.`,
        );
        return;
      }

      const promises = nextRaffleArray.map((r) =>
        this.raffleService.executeRaffleAutomatically(technicalUser, r.id),
      );

      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        const raffleId = nextRaffleArray[index].id;
        const buildingName = nextRaffleArray[index].building?.name || 'Unknown';

        if (result.status === 'fulfilled') {
          this.logger.log(
            `✅ Raffle [ID: ${raffleId}] for Building [${buildingName}] executed successfully.`,
          );
        } else {
          // Si falló, 'result.reason' contiene el error
          this.logger.error(
            `❌ Raffle [ID: ${raffleId}] for Building [${buildingName}] failed: ${result.reason}`,
          );
        }
      });
    } catch (error) {
      this.logger.error(`Automated Raffle failed: ${error.message}`);
    } finally {
      this.logger.log('--- Automated Raffle Process Finished ---');
    }
  }
}
