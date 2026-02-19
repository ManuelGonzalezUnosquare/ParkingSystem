# Database Seeding & Initialization

## 1. Overview

To ensure environment consistency across the development team, the system includes an automated **Database Seeder**. This service is responsible for populating the database with essential lookup data and a default administrative account upon application startup.

## 2. Seeded Data

The seeder currently manages the following records:

### A. System Roles

The system follows a hierarchical RBAC (Role-Based Access Control) model:

- **ROOT**: Super Administrator. Global access to all buildings and system settings.
- **ADMIN**: Building Manager. Access limited to a specific assigned building.
- **USER**: Common User. Standard resident or employee with access to their own profile and raffle participation.

### B. Default Root User

On the first run, a default superuser is created if it doesn't already exist:

- **Email**: `root@test.com`
- **Password**: `1234567` (Stored as a Bcrypt hash)
- **Role**: `ROOT`
- **Building**: `null` (Global scope)

---

## 3. Implementation Details

The seeding logic is handled by the `DatabaseSeederService`, which implements the `OnApplicationBootstrap` interface from NestJS.

### Idempotency

The seeder is **idempotent**, meaning it checks for the existence of records before attempting an insert. This prevents duplicated data or primary key conflicts on subsequent application restarts.

### Security

All seeded passwords undergo a hashing process using **Bcrypt** with a salt factor of `10`, ensuring that no plain-text credentials exist within the persistence layer.

---

## 4. How to Run

The seeder runs automatically when the API starts:

```bash
npx nx serve api
```
