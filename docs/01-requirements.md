# Project Requirements

## Core Objective

The Parking System is designed to manage employee parking spot assignments through a fair, priority-based raffle system.

## Key Features

- **User Management:** Hierarchical access control (ROOT, Building Admin, and Regular User).
- **Asset Management:** Management of Buildings, Parking Slots, and Vehicles.
- **Raffle Engine:** Automated and manual parking spot assignment based on a `priorityScore`.
- **Soft Deletion:** All critical entities implement soft-delete for auditability and data recovery.
- **Security:** Password reset flows and secure authentication.

## Business Rules

- Users are assigned to a specific Building.
- The `priorityScore` increases for users who haven't won a spot recently.
- A Raffle record preserves the state of the assignment at the time of execution.
