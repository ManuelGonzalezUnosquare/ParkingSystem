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

# 🐳 Docker Deployment Guide

This project is fully containerized using **Docker** and **Docker Compose**, allowing you to spin up the entire stack (Database, Backend, and Frontend) without manual local configuration.

---

## 1. Prerequisites

Before starting, ensure you have the following installed:

- **Docker Desktop** (v4.0.0+)
- **Docker Compose** (v2.0.0+)
- **Git**

## 2. Environment Configuration

Docker uses the `.env` file at the root of the project to configure the services. Make sure you have created yours:

```bash
cp .env.example .env
```

_Note: Ensure `DB_HOST` is set to `db` (the service name in docker-compose) for container-to-container communication._

---

## 3. Essential Commands

### 🚀 Start the Entire Stack

To build the images and start all services in the background:

```bash
docker compose up -d --build
```

### 🛑 Stop Services

To stop and remove all containers defined in the compose file:

```bash
docker compose down
```

### 📝 View Logs

If you need to debug the API or the Web app in real-time:

```bash
docker compose logs -f api
docker compose logs -f web
```

### 🧹 Deep Clean

If you experience dependency or cache issues, use this command to reset the environment:

```bash
docker compose down --volumes --remove-orphans
```

---

## 4. Services Map

Once the containers are running, you can access the services at:

- **Frontend (Angular)**: [http://localhost:4200](http://localhost:4200)
- **Backend (NestJS API)**: [http://localhost:3000/api](http://localhost:3000/api)
- **Database (MySQL)**: `localhost:3306`

## 5. Troubleshooting

- **Dependency Conflicts**: If the build fails during `npm install`, the project is configured to use `--legacy-peer-deps` automatically within the Dockerfiles.
- **Database Connectivity**: The API container waits for the MySQL container to be healthy before starting the NestJS application.

---

_Created by the Unosquare Parking System Team - 2026_
