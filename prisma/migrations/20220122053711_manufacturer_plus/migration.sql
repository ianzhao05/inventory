/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_code_key";

-- DropIndex
DROP INDEX "Product_code_name_idx";

-- DropIndex
DROP INDEX "Supplier_name_idx";

-- DropIndex
DROP INDEX "Supplier_name_key";

-- DropIndex
DROP INDEX "UpdateEvent_createdAt_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "manufacturer",
ADD COLUMN     "manufacturerId" INTEGER;

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE INDEX "Manufacturer_name_idx" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_code_name_idx" ON "Product"("code", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "UpdateEvent_createdAt_idx" ON "UpdateEvent"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
