# 🛠️ Tools & Strategies

## A. Technology Stack & Framework Selection

The selection of the stack was driven by the need for **type safety, modularity, and rapid iteration**:

- **Nx Monorepo:** Selected as the orchestrator to manage the Frontend (Angular) and Backend (NestJS) in a single workspace. This ensures a **Single Source of Truth** for shared DTOs and interfaces, drastically reducing integration bugs.
- **NestJS (Node.js):** Chosen for its opinionated, modular architecture. It follows SOLID principles and provides a robust structure for dependency injection, making the backend highly testable.
- **TypeORM:** Bridges the gap between TypeScript and MySQL. Its support for **Data Mapper patterns** and **ACID transactions** is vital for the Raffle Engine's integrity.
- **TailwindCSS & PrimeNG:** This combination provides a balance between rapid UI development (PrimeNG components) and granular design control (Tailwind utility classes).

---

## B. Performance & Deployment Optimization

To ensure the system remains responsive as the number of buildings and residents grows, the following strategies are implemented:

- **Containerization (Docker & Docker Compose):** Every component (API, DB, Cache) is containerized. This eliminates the \"it works on my machine\" problem and allows for **Environment Parity**, ensuring seamless transitions between development, staging, and production.
- **Multi-Level Caching (Redis):**
  - **Result Caching:** Storing recent raffle outcomes to avoid heavy database joins during peak login times.
  - **Session Storage:** Using Redis for stateless session management, allowing the API to scale horizontally.
- **Data Indexing:** Implementing **Composite Indexes** in MySQL on frequently queried columns such as `(building_id, status)` and `(user_id, raffle_id)` to keep query response times under 100ms.
- **Load Balancing:** Deployment through a Round-Robin Load Balancer to distribute traffic across multiple stateless API nodes.

---

## C. Security & Data Protection Strategies

Security is integrated at every layer, following the principle of **Defense in Depth**:

- **Authentication & Authorization:**
  - **JWT (JSON Web Tokens):** Used for secure, stateless authentication.
  - **RBAC (Role-Based Access Control):** A strict hierarchy (Root > Admin > Resident) enforced via NestJS Guards to ensure multi-tenant data isolation.
  - **First-Login Handshake:** A security requirement forcing users to change system-generated passwords upon their first entry.
- **Data Protection:**
  - **Encryption at Rest & In Transit:** Ensuring database disks are encrypted and all communication happens over HTTPS/TLS.
  - **Hashing:** All passwords are hashed using **Argon2** or **Bcrypt** before storage.
  - **Input Sanitization:** Parameterized queries in TypeORM protect against SQL Injection, while `class-validator` decorators prevent XSS attacks.
- **Cloud & Infrastructure Security:**
  - **VPC Isolation:** The database and Redis cache are placed in private subnets, inaccessible from the public internet.
  - **Secrets Management:** Sensitive credentials (DB passwords, API keys) are managed via Environment Variables or Cloud Secret Managers, never hardcoded in the source code.
