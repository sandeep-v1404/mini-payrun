
---

# DECISIONS.md

* **Prisma**

  * Picked for type-safety with TypeScript
  * Prisma Studio is super handy for debugging
  * Postgres for production (stable + reliable)

* **Express**

  * Faster to get started than NestJS
  * Doesn’t add unnecessary structure right now

* **DTOs vs Models**

  * Keep `Timesheet` as the clean core type
  * Use `TimesheetDTO` when API needs extra fields (`employee`, `payrunId`)
  * Prevents polluting domain models with API-specific stuff

* **Shared Types**

  * Backend + frontend share the same contracts
  * No duplication or “out of sync” types
  * Easier to refactor in one place

* **Error Handling**

  * Centralized middleware instead of `try/catch` everywhere
  * Cleaner routes
  * Consistent error responses

* **Testing**

  * Jest + Supertest for backend

* **Time Spent / Trade-offs**

  * Dockerized for easy local dev
  * Workspace monorepo keeps shared types in sync
