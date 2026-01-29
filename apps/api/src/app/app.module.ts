import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = {
          host: config.get<string>("DB_HOST"),
          port: config.get<number>("DB_PORT"),
          user: config.get<string>("DB_USER"),
        };
        console.log("Tentando conexión a DB con:", dbConfig);
        return {
          type: "mysql",
          host: config.get<string>("DB_HOST"),
          port: parseInt(config.get<string>("DB_PORT", "3307"), 10),
          username: config.get<string>("DB_USER"),
          password: config.get<string>("DB_PASSWORD"),
          database: config.get<string>("DB_NAME"),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
