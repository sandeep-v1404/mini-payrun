# Mini Payroll App

A small payroll management system built with **React + Vite**, **Node.js**, **Express**, **PostgreSQL** + **Prisma**, and **TypeScript**.
The goal is to keep it simple but still handle the essentials like employees, timesheets, and payruns.

---

## Features

* **Authentication**

  * User signup, login, logout
  * JWT-based access & refresh tokens
  * Refresh token rotation for security

* **Employees**

  * Add and manage employee records
  * Auto-generate employee codes (EMP001, EMP002, ...)
  * Store details like name, hourly rate, super rate, bank details

* **Timesheets**

  * Track work periods with start and end dates
  * Add daily entries and allowances
  * Prevent invalid entries outside of period range
  * One timesheet per employee per period (upsert)

* **Payruns**

  * Create payruns for a given period
  * Automatically include all employee timesheets for that range
  * Calculate payslips (gross, tax, super, net)
  * Generate PDF payslips and upload to S3
  * Fetch enriched payrun details with employee data

---

## Tech Stack

* **Backend**: Node.js + Express
* **ORM**: Prisma
* **Database**: AWS Aurora PostgreSQL (prod)
* **Storage**: AWS S3
* **Language**: TypeScript
* **Testing**: Jest + Supertest
* **Frontend**: React + Vite + TailwindCSS + Tanstack React Query

---

## API Endpoints

### Auth

* `POST /auth/signup` → create new user
* `POST /auth/login` → login user
* `POST /auth/refresh` → refresh access token
* `POST /auth/logout` → logout user

### Employees

* `GET /employees` → list all employees
* `POST /employees` → create employee (auto-generate code if missing)
* `PUT /employees/:id` → update employee
* `DELETE /employees/:id` → delete employee

### Timesheets

* `GET /timesheets` → list all timesheets (with employee & payrun)
* `POST /timesheets` → create or replace timesheet for an employee+period

### Payruns

* `GET /payruns` → list all payruns
* `POST /payruns` → create payrun (generate payslips, upload PDFs to S3)
* `GET /payruns/:id` → fetch payrun with employee data

---

## Getting Started

You can set up the project in **two ways**:

### Option 1: Local Setup (pnpm + nvm)

#### 1. Clone repo

```sh
git clone https://github.com/sandeep-v1404/mini-payrun
cd mini-payrun
```

#### 2. Use correct Node.js version

We use **Node.js v22.18.0**. Install via [nvm](https://github.com/nvm-sh/nvm):

```sh
nvm use
```

> The `.nvmrc` file in the repo will pick the right version automatically.  
If you don’t use nvm, make sure your Node version is **22.18.0** or compatible.

#### 3. Install dependencies

```sh
pnpm install
```

#### 4. Build shared types

```sh
pnpm shared:types
```

#### 5. Generate Prisma client

```sh
pnpm prisma:generate
```

#### 6. Set up environment variables

Copy `.env.example` for the API:
```sh
cp packages/api/.env.example packages/api/.env
```

#### 7. Start dev servers

```sh
pnpm dev
```

* API: [http://localhost:4000](http://localhost:4000)
* Web: [http://localhost:5173](http://localhost:5173)

---

### Option 2: Docker Setup

Make sure you have Docker + Docker Compose installed.

#### Build and run containers

```sh
docker-compose up --build
```

#### Services

* **API** → `http://localhost:4000`
* **Web** → `http://localhost:5173`

---

## Testing

Run all API tests:

```sh
pnpm api:test
```

---

## Future Improvements

* Role-based access (e.g., admin vs employee)
* Add UI for employees to view timesheets
* Add validations (e.g., overlapping timesheets, allowance caps)
* Automate payroll calculations (basic salary, overtime, deductions)