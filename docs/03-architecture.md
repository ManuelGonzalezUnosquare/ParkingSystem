# System Architecture

## Monorepo Structure (Nx)

- **apps/api:** The NestJS entry point. Handles HTTP requests and AppModule configuration.
- **apps/web:** The Angular frontend application.
- **libs/shared/models:** Common interfaces, Enums (e.g., `UserStatusEnum`), and DTOs shared between Backend and Frontend.
- **libs/api/data-access:** TypeORM Entities and Repositories.

## Data Flow

1. Client makes a request to the API.
2. ThrottlerGuard validates Rate Limiting.
3. Controller delegates to Service.
4. Service interacts with MySQL via TypeORM Entities.
