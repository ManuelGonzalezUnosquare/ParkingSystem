# Database Documentation

## Overview

The database is designed to handle multi-tenancy at the building level. Most entities include `createdAt`, `updatedAt`, and `deletedAt` fields for full lifecycle tracking.

## Entity Relationship Diagram (ERD)

The visual representation of the database schema, including tables, columns, and foreign key relationships, can be found here:

👉 **[View Detailed ERD & Relationships](./database-schema.md)**

## Key Entities

- **User:** Central entity linked to a Role and a Building.
- **RaffleResult:** Pivot table that stores the history of winners, linking a User, Vehicle, and Slot to a specific Raffle event.
