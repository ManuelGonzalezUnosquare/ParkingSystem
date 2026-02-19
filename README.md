# 🅿️ Parking System - Enterprise Monorepo

[![Nx](https://img.shields.io/badge/nx-workspace-blue?logo=nx)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/backend-nestjs-red?logo=nestjs)](https://nestjs.com)
[![Angular](https://img.shields.io/badge/frontend-angular-dd0031?logo=angular)](https://angular.io)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

An enterprise-grade parking management and raffle system built on an **Nx Monorepo** architecture. This project manages users, buildings, and vehicle parking assignments using a priority-based algorithm.

---

## 📖 Documentation Portal

Navigate through our detailed documentation modules to understand the system's inner workings:

| Module            | Description                                         | Link                                    |
| :---------------- | :-------------------------------------------------- | :-------------------------------------- |
| **Requirements**  | Business rules, user roles, and core objectives.    | [View Docs](./docs/01-requirements.md)  |
| **Tech Stack**    | Full list of languages, frameworks, and tools.      | [View Docs](./docs/02-stack.md)         |
| **Architecture**  | Nx structure, apps, and shared libraries.           | [View Docs](./docs/03-architecture.md)  |
| **Database**      | Schema details and **Entity Relationship Diagram**. | [View Docs](./docs/04-database.md)      |
| **API Guide**     | Backend standards, security, and Rate Limiting.     | [View Docs](./docs/05-api-guide.md)     |
| **Web Guide**     | Angular frontend development and shared models.     | [View Docs](./docs/06-web-guide.md)     |
| **Collaboration** | Branching strategy, PR flow, and Git hooks.         | [View Docs](./docs/07-collaboration.md) |

---

## 🚀 Quick Start & Onboarding

Welcome to the team! Follow these steps to set up your local development environment.

### A) Repository Setup

First, clone the repository and enter the project folder:

```bash
git clone https://github.com/ManuelGonzalezUnosquare/ParkingSystem.git
cd ParkingSystem
```

### B) Local Environment Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a .env file in the root directory based on .env.example:
   ```bash
   cp .dev.env .env
   ```
3. **Database:**
   Ensure your MySQL service is running and the database name matches your .env configuration.

### C) Running the Apps

Since this is an **Nx Monorepo**, you can run both the API and the Web app simultaneously:

- **Start Backend (API):** `npx nx serve api`
- **Start Frontend (Web):** `npx nx serve web`

---

## 🛠 Collaboration Instructions

To maintain high code quality, please adhere to the following standards:

- **Linter:** Run `npx nx lint` before pushing your changes.
- **Format:** We use Prettier for consistent styling across the monorepo.
- **Testing:** Run unit tests with `npx nx test api` or `npx nx test web`.

### Branching Strategy

We follow a strict branching model to ensure stability:

- `main` ➔ Production stable.
- `develop` ➔ Integration for features.
- `feature/NAME-description` ➔ Individual task branches.

---

## 🛡 Security & Reliability

This project includes built-in protection mechanisms:

- **Rate Limiting:** All API endpoints are protected by NestJS Throttler.
- **Validation:** Strict `class-validator` pipes for all incoming DTOs.
- **Auditability:** Soft-delete (`deletedAt`) implemented across all primary tables to preserve historical data.

---

_Created by the Unosquare Parking System Team - 2026_
