import { PrismaClient } from "../generated/prisma";

export const prisma = new PrismaClient();

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.warn("✅ Connected to Aurora via Prisma");
  } catch (err: any) {
    console.error("❌ DB connection error:", err.message);
  }
}
