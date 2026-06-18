-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "taxId" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(30),
    "address" VARCHAR(300),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "countryCode" VARCHAR(5) NOT NULL DEFAULT 'CV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_taxId_key" ON "companies"("taxId");
CREATE INDEX "companies_active_idx" ON "companies"("active");
CREATE UNIQUE INDEX "public_holidays_date_countryCode_key" ON "public_holidays"("date", "countryCode");

-- AddForeignKey
ALTER TABLE "health_plans" ADD CONSTRAINT "health_plans_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "companies"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
