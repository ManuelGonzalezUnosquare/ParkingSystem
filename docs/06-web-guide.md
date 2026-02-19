# Web Frontend Guide

## Framework Configuration

The Angular application resides in `apps/web`. It consumes the API using environment-based configurations.

## Development

- `npx nx serve web`: Start the frontend development server.
- **Shared Models:** Always import Enums and Interfaces from `@parking-system/shared/models` to ensure type safety with the backend.
