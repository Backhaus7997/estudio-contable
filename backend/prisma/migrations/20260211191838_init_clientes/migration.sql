-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" VARCHAR(20),
    "email" VARCHAR(200),
    "telefono" VARCHAR(50),
    "estado" VARCHAR(10) NOT NULL DEFAULT 'Activo',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cliente_cuit_idx" ON "Cliente"("cuit");

-- CreateIndex
CREATE INDEX "Cliente_razonSocial_idx" ON "Cliente"("razonSocial");
