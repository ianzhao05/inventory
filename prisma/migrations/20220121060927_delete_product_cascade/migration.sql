/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UpdateEventsOnProducts" DROP CONSTRAINT "UpdateEventsOnProducts_productId_fkey";

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
ALTER TABLE "UpdateEventsOnProducts" ADD CONSTRAINT "UpdateEventsOnProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
