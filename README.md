# Mini Payroll App

A small payroll management system built with **React + Vite**, **Node.js**, **Express**, **PostgreSQL** + **Prisma**, and **TypeScript**.  
The goal is to keep it simple but still handle the essentials like employees, timesheets, and payruns.

---

## Features

- **Employees**

  - Add and manage employee records
  - Store details like name, ID, and related timesheets

- **Timesheets**

  - Track work periods with start and end dates
  - Add daily entries and allowances
  - Link timesheets to employees and payruns

- **Payruns**
  - Create payruns for a given period
  - Automatically include all employee timesheets for that range
  - Exportable JSON data (easy to extend later to CSV/PDF)

---

## Tech Stack

- **Backend**: Node.js + Express
- **ORM**: Prisma
- **Database**: SQLite (dev), Postgres (prod)
- **Language**: TypeScript
- **Testing**: Jest + Supertest

---

## API Endpoints

### Employees

- `GET /employees` → list all employees
- `POST /employees` → create employee

### Timesheets

- `GET /timesheets` → list all timesheets
- `POST /timesheets` → create timesheet

### Payruns

- `GET /payruns` → list all payruns
- `POST /payruns` → create payrun

---

## Getting Started

### 1. Clone repo

```sh
git clone https://github.com/sandeep-v1404/mini-payrun
cd mini-payroll
```

### 2. Install dependencies

```sh
pnpm install
```

### 3. Build Types 

```sh
pnpm shared:types
```

### 3. Generate Prisma Schema

```sh
pnpm prisma:generate
```


### 4. Set up environment variables

Create a `.env` file in the root and update variables in env:

```sh
cp packages/api/.env.example packages/api/.env

```

### 4. Start the server

```sh
pnpm dev
```

Server will be running at: [http://localhost:5173](http://localhost:5173)

---

## Testing

Run all tests:

```sh
npm test
```

---

## Future Improvements

- role-based access (e.g., admin vs employee)
- Add UI for employees to view timesheets
- Add validations (e.g., overlapping timesheets, allowance caps)
- Automate payroll calculations (basic salary, overtime, deductions)

---



### TODO

Unit tests for tax/super logic & at least one endpoint.

Structured logging; basic error handling.


GitHub Actions for lint, typecheck, test


Employees: list + add/edit (id, name, rate, super)


● Testing:
○ Unit tests for tax/super/overtime logic (include edge cases around bracket
cutovers)
○ 1–2 API tests (happy path + validation error)
○ (Optional) minimal UI test with Playwright


8) Optional AWS Track (bonus)
● API: Lambda + API Gateway (Node18+), or ECS Fargate
● Storage: RDS (Postgres) or DynamoDB; or SQLite for local
● Static UI: S3 + CloudFront
● IaC: CDK/Terraform/SAM with README deploy steps
● Observability: CloudWatch logs/metrics; structured JSON; simple /metrics
endpoint