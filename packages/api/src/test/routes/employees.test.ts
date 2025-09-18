import request from "supertest";
import express from "express";
import employeesRouter from "../../routes/employees";

// Mock prisma
jest.mock("../../lib/db", () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from "../../lib/db";

const app = express();
app.use(express.json());
app.use("/employees", employeesRouter);

describe("Employees API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /employees should return list of employees", async () => {
    (prisma.employee.findMany as jest.Mock).mockResolvedValue([
      { id: "e-1", firstName: "Alice", lastName: "Smith" },
      { id: "e-2", firstName: "Bob", lastName: "Brown" },
    ]);

    const res = await request(app).get("/employees");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(prisma.employee.findMany).toHaveBeenCalled();
  });

  it("POST /employees should fail validation (missing firstName)", async () => {
    const res = await request(app).post("/employees").send({
      lastName: "Smith",
      type: "FULL_TIME",
      baseHourlyRate: 40,
      superRate: 0.1,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it("PUT /employees/:id should update employee (happy path)", async () => {
    (prisma.employee.update as jest.Mock).mockResolvedValue({
      id: "e-123",
      firstName: "Alice",
      lastName: "Jones",
      type: "FULL_TIME",
      baseHourlyRate: 50,
      superRate: 0.12,
      bank: null,
    });

    const res = await request(app).put("/employees/e-123").send({
      firstName: "Alice",
      lastName: "Jones",
      type: "FULL_TIME",
      baseHourlyRate: 50,
      superRate: 0.12,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "e-123",
      lastName: "Jones",
      baseHourlyRate: 50,
    });
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: "e-123" },
      data: expect.objectContaining({ lastName: "Jones" }),
    });
  });

  it("PUT /employees/:id should fail validation (bad payload)", async () => {
    const res = await request(app).put("/employees/e-123").send({
      lastName: "Jones", // missing firstName, baseHourlyRate etc.
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("DELETE /employees/:id should delete employee", async () => {
    (prisma.employee.delete as jest.Mock).mockResolvedValue({ id: "e-123" });

    const res = await request(app).delete("/employees/e-123");

    expect(res.status).toBe(204);
    expect(prisma.employee.delete).toHaveBeenCalledWith({
      where: { id: "e-123" },
    });
  });
});
