# Parking System - Architecture & Design Document

## 1. Project Overview

This project is a Proof of Concept (PoC) for a comprehensive Parking Management System. It aims to demonstrate a scalable, maintainable, and type-safe architecture using modern full-stack technologies within a monorepo environment managed by Nx.

---

## 2. Architecture & Design Documentation

### 2.1 Technology Stack & Justification

The selection of the following stack is based on the need for high developer velocity, strict type safety, and the ability to handle complex relational data.

| Component                 | Technology         | Justification                                                                                                                                                                                                                                                           |
| :------------------------ | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo Orchestrator** | **Nx**             | Enables a unified workspace for Frontend and Backend. It facilitates "Single Source of Truth" by sharing interfaces through local libraries, optimizes build times with computation caching, and enforces a clear boundary between different layers of the application. |
| **Frontend Framework**    | **Angular (v18+)** | Offers a robust and opinionated framework for enterprise-level applications. The use of **Signals** provides a modern, fine-grained reactivity model, improving performance and developer experience compared to traditional change detection.                          |
| **Styling**               | **TailwindCSS**    | A utility-first CSS framework that allows for rapid UI prototyping. It ensures consistent design patterns across the application while keeping the CSS bundle size minimal through purging unused styles.                                                               |
| **Backend Framework**     | **NestJS**         | Provides a modular and highly testable server-side architecture. Its heavy use of Decorators and Dependency Injection mirrors Angular's philosophy, reducing the cognitive load for full-stack developers.                                                              |
| **ORM**                   | **TypeORM**        | An Object-Relational Mapper that supports the latest TypeScript features. It allows the team to manage database schemas as code, ensuring that the database remains in sync with the application's domain models.                                                       |
| **Database**              | **MySQL**          | A reliable and industry-standard relational database. Chosen for its ACID compliance and efficient handling of complex queries and foreign key relationships, which are essential for managing residents and parking allocations.                                       |
| **Cache Layer**           | **Redis**          | Implemented to provide high-speed data access for volatile or frequently accessed information, such as real-time parking spot occupancy, significantly reducing the direct load on the primary MySQL database.                                                          |

### 2.2 Core Architectural Patterns

- **Type-Safe Contracts:** All communication between the API and the Frontend is governed by interfaces defined in `@parking-system/shared-models`. This eliminates runtime errors caused by mismatched data structures.
- **Encapsulated Domain Logic:** The Backend uses the **Data Mapper** pattern via TypeORM. This separates the database persistence logic from the business domain, allowing the application to evolve without being tightly coupled to the database schema.
- **Development Proxying:** To streamline the development workflow, an Angular proxy configuration is used to bypass CORS restrictions, allowing the Frontend to communicate with the Backend as if they were on the same origin.

---

## 3. System Components & Responsibility

- **Apps/**
  - `parking-portal`: The Angular client application (Frontend).
  - `api`: The NestJS server application (Backend).
- **Libs/**
  - `shared-models`: Pure TypeScript library containing interfaces and DTOs shared across the entire workspace.

## 4. Database Schema & Data Modeling

### 4.1 Data Dictionary

All entities inherit from a `BaseEntity` containing: `Id` (Internal PK), `PublicId` (UUID for API), `CreatedAt`, `UpdatedAt`, and `DeletedAt` (Soft Delete).

#### A. Building

- `name`: (String) Identifier for the complex.
- `totalSlots`: (Integer) Physical capacity.
  > **Logic:** When a building is created, the system automatically populates the `ParkingSlots` table based on `totalSlots`.

#### B. User

- `firstName`, `lastName`, `email`: (String) Personal details.
- `roleId`: (FK) Reference to Role table.
- `buildingId`: (FK) Reference to Building table.
- `status`: (Enum: ACTIVE, INACTIVE, SUSPENDED) Current state of the resident.
- `password`: (String/Hash) Encrypted password using BCrypt with a cost factor of 12.
  -\* `lastLogin`: (DateTime) Audit field for security tracking.

#### C. Role

- `name`: (String) Internal key (e.g., 'ADMIN').
- `displayName`: (String) Human-readable label (e.g., 'System Administrator').

#### D. Vehicle

- `userId`: (FK) Owner of the vehicle.
- `numberPlate`: (String) Unique license plate.
- `description`: (String) General info (e.g., 'Silver Toyota Corolla').

#### E. ParkingSlot

- `slotNumber`: (String) Label (e.g., 'S-001').
- `buildingId`: (FK) Parent building.
- `vehicleId`: (FK, Nullable) Current vehicle occupying the spot.
- `isAvailable`: (Boolean) Computed or flagged status for quick lookup.

#### F. ParkingAssignmentHistory

- `userId`: (FK) The resident who was granted the slot.
- `vehicleId`: (FK) The specific vehicle used during the period.
- `parkingSlotId`: (FK) The physical space assigned.
- `startDate`: (DateTime) Moment the assignment became active.
- `endDate`: (DateTime, Nullable) Moment the assignment ended.
- `assignmentType`: (Enum: RAFFLE, MANUAL, TEMPORARY) Origin of the assignment.

#### G. Raffle Log (Transparency & Fairness)

- **RaffleHistory**: `Id`, `BuildingId`, `ExecutedAt`.
- **RaffleParticipation**: `RaffleId`, `UserId`, `WeightAtTime`, `HasWon`.

#### H. PasswordResetToken

- `userId`: (FK) Reference to the requesting user.
- `token`: (String) Secure, one-time-use hashed token.
- `expiresAt`: (DateTime) Time-to-live (TTL) for the recovery request.
- `usedAt`: (DateTime, Nullable) Prevents token reuse.

---

### 4.2 Entity Relationship Logic (ERD)

1.  **Users ↔ Building**: Many-to-One.
2.  **User ↔ Vehicle**: One-to-Many.
3.  **User ↔ ParkingAssignmentHistory**: One-to-Many (Historical log).
4.  **ParkingSlot ↔ Vehicle**: One-to-One (Optional/Dynamic).
5.  **Building ↔ ParkingSlot**: One-to-Many.

---

### 4.3 Scalability & Performance Considerations

- **Database Indexing**: Composite indexes are applied to `(buildingId, isAvailable)` in `ParkingSlots` and `(userId, startDate)` in `History`. This ensures O(log n) lookup even with 50,000+ records.
- **Contention Management**: Raffle assignments use **Database Transactions** to ensure atomicity.
- **Batch Processing**: Post-raffle updates (resetting scores, updating history, and assigning slots) are executed as bulk operations to minimize table locking time.
- **Caching Strategy**: Redis is used to store temporary "locked" states during the raffle execution to prevent race conditions.

---

### 4.4 Data Lifecycle for Assignments

1.  **Initialization**: When a raffle starts, the system identifies current active assignments (`endDate IS NULL`) for the building.
2.  **Termination**: Existing records in `ParkingAssignmentHistory` are closed by setting the `endDate` to the current timestamp.
3.  **New Cycle**: New records are created for winners, and `ParkingSlots.vehicleId` is updated.
4.  **Persistence**: Soft-deleted users or vehicles do not break the history; foreign keys are maintained to preserve audit integrity.

---

### 4.5 Security Best Practices (Design)

- **Hashing Strategy**: All passwords will be hashed using BCrypt before persistence. No plain-text passwords will ever reach the database or the logs.
- **Token Rotation**: The system is designed to invalidate old tokens when a new one is requested for the same user.
- **Rate Limiting (Future-Proofing)**: The audit fields in `PasswordResetToken` allow for future implementation of rate-limiting to prevent brute-force attacks on the recovery flow.

## 5. Raffle System Design (Logic Flow)

The raffle is building-scoped and follows a **Weighted Shuffle Algorithm** to ensure equity.

### 5.1 Fairness & Weighting Logic

- **Accumulated Priority**: Every time an active user participates and loses, their `priorityScore` increases by 1.
- **Winning Reset**: Upon winning, the user's `priorityScore` is reset to 0.
- **Probability Formula**: The chance for user $i$ to win is calculated as:
  $$P_i = \frac{w_i}{\sum_{j=1}^{n} w_j}$$
  Where $w$ is the user's current weight ($1 + priorityScore$).

### 5.2 Execution Workflow

1.  **Validation**: Filter users by `status: ACTIVE` and `buildingId`.
2.  **Pool Generation**: Create a virtual pool where each user is represented $w$ times.
3.  **Random Selection**: Draw winners based on the number of available `ParkingSlots`.
4.  **State Update**:
    - Winners: Reset `priorityScore` and create `ParkingAssignmentHistory`.
    - Losers: Increment `priorityScore`.
5.  **Logging**: Records are added to `RaffleHistory` and `RaffleParticipation` for transparency.

## 6. Vehicle Management & Raffle Logic (Current Scope)

### 6.1 Resident Vehicle Policy

To maintain a balance between system scalability and project scope (PoC), the following business rules have been established:

- **Relationship**: The database maintains a **One-to-Many (1:N)** relationship between `User` and `Vehicle`.
- **Current Constraint**: For the initial phase, each user will manage only **one active vehicle**.
- **Scalability**: The system is pre-architected to allow multiple vehicles in future phases without schema migrations.
- **Data Integrity**: If a user updates their vehicle's license plate or description, the historical link in past raffles remains consistent via the `vehicle_id` foreign key.

### 6.2 Raffle Result Attribution

Each record in the `raffle_results` table now explicitly stores:

1. **User**: Who won.
2. **Parking Slot**: Which space was assigned.
3. **Vehicle**: Which specific vehicle is authorized to occupy that slot during the period.

---

## 7. Automation & System Triggers

### 7.1 Building-Slot Automation (Subscriber)

To eliminate manual data entry, the system implements an **Entity Subscriber** at the database level.

| Trigger Event                | Action                    | Logic                                                                                                                                    |
| :--------------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **`afterInsert` (Building)** | Automatic Slot Generation | When a new `Building` is created with a `totalSlots` value, the system automatically generates `N` records in the `parking_slots` table. |

**Naming Convention for Automated Slots:**

- Slots are labeled using the pattern `S-###` (e.g., `S-001`, `S-002`, `S-010`).
- All automated slots are set to `isAvailable: true` by default.

---

## 8. Updated Entity Relationship Diagram (Conceptual)

- **User** (1) ----> (N) **Vehicle**
- **Building** (1) ----> (N) **ParkingSlot**
- **RaffleResult** (N) ----> (1) **User** / (1) **ParkingSlot** / (1) **Vehicle**
