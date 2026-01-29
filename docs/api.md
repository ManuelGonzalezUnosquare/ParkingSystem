# API Architectural Design & Directory Structure

## 1. Architectural Approach

The API is built using **NestJS** following a **Modular Domain-Driven Design (DDD)**. This approach ensures a high separation of concerns, making the system maintainable, testable, and scalable. Although this is a Proof of Concept (PoC), the structure reflects a production-ready environment suitable for professional handovers.

## 2. Monorepo Integration (Nx)

We leverage the Nx Workspace to maintain a **Single Source of Truth**:

- **`libs/shared-models`**: Contains interfaces, enums, and DTO types shared between the Angular Frontend and the NestJS Backend.
- **`apps/api`**: Full implementation of business logic, database persistence, and REST endpoints.

---

## 3. Directory Hierarchy

The internal structure of the API is organized as follows to ensure scalability:

```text
apps/api/src/app/
├── auth/                 # Authentication, JWT strategy, and Password Recovery
├── buildings/            # Building management and Parking Slot logic
├── users/                # User profiles and Priority Scoring management
├── raffles/              # Core Raffle Engine and randomization logic
├── database/             # Persistence layer
│   └── entities/         # TypeORM Entities (Centralized to avoid circular refs)
├── common/               # Global shared resources
│   ├── decorators/       # Custom TS Decorators (e.g., @CurrentUser)
│   ├── filters/          # Global Exception Filters (HTTP Error handling)
│   └── guards/           # Security Guards (Roles, Permissions)
└── shared/               # Cross-cutting services (Emailer, Logger, Storage)
```

## 4. Module Internal Anatomy

Each domain module (e.g., `users/`) follows a strict pattern to isolate responsibilities and simplify unit testing:

| Component            | Responsibility                                                                               |
| :------------------- | :------------------------------------------------------------------------------------------- |
| **`.controller.ts`** | Entry point for HTTP requests. Handles routing, request parameters, and status codes.        |
| **`.service.ts`**    | The "Brain". Contains core business logic, calculations, and interactions with repositories. |
| **`.module.ts`**     | The orchestrator that wires up controllers, providers, and TypeORM entities.                 |
| **`dto/`**           | Data Transfer Objects for input validation (class-validator) and API contract definition.    |
| **`interfaces/`**    | Domain-specific TypeScript types and local contracts.                                        |

---

## 5. Design Principles Applied

- **SoC (Separation of Concerns):** Controllers focus on communication; Services focus on logic. Databases are never accessed directly from the controller.
- **Encapsulation:** Entities are centralized within the `database/entities/` folder. This is a strategic decision for this project to prevent **Circular Dependency** issues during complex relationship mapping (e.g., User ↔ Building ↔ Slot).
- **D.R.Y (Don't Repeat Yourself):** All entities inherit common auditing fields (id, publicId, createdAt, etc.) from a common `BaseEntity`.
- **Future-Proofing:** This modular setup allows for an easy transition to a Microservices architecture if a specific domain (like the Raffle Engine) requires independent scaling in the future.
