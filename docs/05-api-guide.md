# 🛠 API Architectural Design & Development Guide

## 1. Architectural Approach

The API is built using **NestJS** following a **Modular Domain-Driven Design (DDD)**. This approach ensures a high separation of concerns, making the system maintainable and scalable. Although this is a Proof of Concept (PoC), the structure reflects a production-ready environment.

## 2. Monorepo Integration (Nx)

We leverage the **Nx Workspace** to maintain a **Single Source of Truth**:

- **`libs/shared-models`**: Interfaces, enums, and DTO types shared between Angular and NestJS.
- **`apps/api`**: Implementation of business logic, database persistence, and REST endpoints.

---

## 3. Directory Hierarchy & Anatomy

### Directory Structure

```text
apps/api/src/app/
├── auth/                # JWT Strategy, Password Recovery & RBAC
├── buildings/           # Building management & Parking Slot logic
├── users/               # Profiles & Priority Scoring management
├── raffles/             # Core Raffle Engine & Weighted Randomization
├── database/            # Persistence layer & TypeORM Entities
├── common/              # Global Decorators, Filters, and Guards
└── shared/              # Cross-cutting services (Emailer, Logger)
```

### Module Internal Anatomy

| Component            | Responsibility                                                             |
| :------------------- | :------------------------------------------------------------------------- |
| **`.controller.ts`** | Entry point for HTTP requests. Handles routing and status codes.           |
| **`.service.ts`**    | The \"Brain\". Contains business logic and interactions with repositories. |
| **`.module.ts`**     | The orchestrator that wires up controllers, providers, and entities.       |
| **`dto/`**           | Data Transfer Objects for validation (class-validator).                    |

---

## 4. Development Standards

- **RESTful Design**: Use proper HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
- **Global Prefix**: All routes are prefixed with `/api`.
- **Security**:
  - Protected by `ThrottlerGuard` (Rate Limiting).
  - Auth implemented via **JWT (JSON Web Tokens)**.
  - **RBAC**: Access controlled by Roles (`ROOT`, `ADMIN`, `USER`).

## 5. Design Principles Applied

- **SoC (Separation of Concerns)**: Services handle logic; Controllers handle communication.
- **Encapsulation**: Entities are centralized in `database/entities/` to prevent **Circular Dependencies**.
- **Auditability**: All primary tables implement `BaseEntity` with `id`, `publicId`, `createdAt`, and `deletedAt` (Soft Delete).
- **Raffle Transparency**: The system logs every participant (`WINNER`, `LOSER`, `EXCLUDED_NO_VEHICLE`) to ensure auditability and priority score fairness.

---

## 6. Key Commands

| Action         | Command            |
| :------------- | :----------------- |
| **Start API**  | `npx nx serve api` |
| **Run Tests**  | `npx nx test api`  |
| **Update ERD** | `npm run doc:db`   |

---

## 7. Future-Proofing

This modular setup allows for an easy transition to a Microservices architecture if the **Raffle Engine** requires independent scaling in the future.

_Last updated: February 2026_
