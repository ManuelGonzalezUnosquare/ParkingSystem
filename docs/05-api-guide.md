# API Development Guide

## Standards

- **RESTful Design:** Use proper HTTP verbs (GET, POST, PATCH, DELETE).
- **Global Prefix:** All routes are prefixed with `/api`.
- **Security:** \* Protected by `ThrottlerGuard` (Rate Limiting).
  - Auth implemented via JWT (JSON Web Tokens).

## Key Commands

- `npx nx serve api`: Start the API in development mode.
- `npm run doc:db`: Update the ERD documentation after entity changes.
