# 🏗️ Architecture & Design Documentation

## A. High-Level System Architecture

The system is built on a **Modern Full-Stack Architecture** designed for high availability, consistency, and decoupled scaling across different environments.

### Core Infrastructure & Cloud Components:

- **Version Control & CI/CD:** GitHub serves as the primary repository, with **GitHub Actions** orchestrating the CI/CD pipeline for automated testing and containerized deployment.
- **Containerization:** **Docker & Docker Compose** ensure environment parity, allowing the application to run identically from local development to production pods.
- **Cloud Hosting:** Designed for scalable container platforms like **AWS ECS** or **DigitalOcean App Platform**.
- **Storage:**
  - **RDBMS:** MySQL for structured, transactional data.
  - **In-Memory:** **Redis** for high-speed caching and session management.
  - **Blob Storage:** Future-ready integration with **AWS S3** for resident-related documents and assets.

---

## B. Design Choices & Trade-offs

### 1. Nx Monorepo Orchestrator

- **Choice:** Adopting an **Nx-based monorepo** structure.
- **Value:** We prioritized **developer velocity and architectural integrity**. Nx allows the sharing of TypeScript interfaces and DTOs between the Backend and Frontend, virtually eliminating \"contract mismatch\" errors. It provides a unified workspace that remains maintainable as the codebase expands.
- **Trade-off:** It introduces a steeper initial learning curve and configuration overhead compared to standalone repositories, but the long-term benefits in code reuse outweigh the setup costs.

### 2. Angular + TailwindCSS + PrimeNG

- **Choice:** Enterprise-grade Frontend Stack.
- **Value:** **Angular** was selected for its robust framework features like Dependency Injection and RxJS, which are essential for managing complex states in administrative dashboards. **TailwindCSS** offers unparalleled styling productivity, while **PrimeNG** provides a library of accessible, high-quality UI components, allowing the team to focus on business logic rather than low-level CSS.

### 3. NestJS + TypeORM

- **Choice:** Modular Backend with an Advanced ORM.
- **Value:** **NestJS** ensures a highly testable and modular architecture. **TypeORM** was a strategic choice for its superior support for **Database Transactions**. This is critical for the \"Raffle Engine,\" where multiple records (slots, vehicles, and history) must be updated atomically to ensure data integrity.

### 4. MySQL

- **Choice:** Relational Database Management System (RDBMS).
- **Value:** Given the strict requirements for data consistency and **ACID compliance** (especially during parking assignments), a relational model is mandatory. MySQL combined with TypeORM mitigates SQL injection risks and provides optimized performance for historical audit logging.

### 5. Redis (Performance Optimization)

- **Choice:** In-memory data structure store.
- **Value:** Redis is implemented to handle **Read-Heavy operations**, such as frequently queried assignment statuses. This offloads pressure from the MySQL instance and prepares the API to handle high-concurrency peaks during automated raffle execution.

---

## C. Scalability Considerations

To support growth from a single building to a large-scale residential network, the system includes the following evolutionary paths:

1.  **Horizontal Scaling:** Since the NestJS API is stateless, it can be deployed behind a **Load Balancer** to distribute traffic across multiple instances based on demand.
2.  **Database Partitioning:** For multi-tenant growth, we can implement partitioning by `building_id`, ensuring that query performance remains constant regardless of the total number of records in the system.
3.  **Asynchronous Processing:** The Raffle Engine can be decoupled into a dedicated **Microservice** or a **Worker** process. This ensures that heavy computational tasks do not block the main event loop, maintaining a responsive experience for all users.
