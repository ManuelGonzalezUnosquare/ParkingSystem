# Collaboration & Branching Strategy

## Branching Model

We use a **Feature Branch** workflow:

- `main`: Production-ready code.
- `develop`: Integration branch for features.
- `feature/feature-name`: Individual tasks.

## Commit Workflow

1. Create a feature branch from `develop`.
2. Ensure code passes `npm run lint`.
3. Generate updated DB docs if entities were modified: `npm run doc:db`.
4. Open a Pull Request to `develop`.

## Git Hooks

Husky is configured to run Linting and verify documentation consistency before every commit.
