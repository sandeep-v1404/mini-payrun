# Mini Payroll App

A small payroll management system built with **Node.js**, **Express**, **PostgreSQL** +s **Prisma**, and **TypeScript**.  
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

### 3. Set up environment variables

Create a `.env` file in the root and update DB password:

``` 
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

- Add authentication & role-based access (e.g., admin vs employee)
- Export payruns as CSV/PDF for reporting
- Add UI for employees to view and submit timesheets
- Add validations (e.g., overlapping timesheets, allowance caps)
- Automate payroll calculations (basic salary, overtime, deductions)

---
