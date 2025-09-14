/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Employee` table. All the data in the column will be lost.
  - The primary key for the `Payrun` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Timesheet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[employeeId,periodStart,periodEnd]` on the table `Timesheet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `baseHourlyRate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superRate` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Timesheet" DROP CONSTRAINT "Timesheet_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Timesheet" DROP CONSTRAINT "Timesheet_payrunId_fkey";

-- DropIndex
DROP INDEX "public"."Employee_email_key";

-- AlterTable
ALTER TABLE "public"."Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "bank" JSONB,
ADD COLUMN     "baseHourlyRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "superRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Employee_id_seq";

-- AlterTable
ALTER TABLE "public"."Payrun" DROP CONSTRAINT "Payrun_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payrun_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "payrun_id_seq";

-- AlterTable
ALTER TABLE "public"."Timesheet" DROP CONSTRAINT "Timesheet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ALTER COLUMN "payrunId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Timesheet_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_employeeId_periodStart_periodEnd_key" ON "public"."Timesheet"("employeeId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "public"."Timesheet" ADD CONSTRAINT "Timesheet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timesheet" ADD CONSTRAINT "Timesheet_payrunId_fkey" FOREIGN KEY ("payrunId") REFERENCES "public"."Payrun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
