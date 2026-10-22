-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "PlanId" AS ENUM ('FREE', 'PERSONAL', 'GARDENER_PRO', 'MAINTENANCE_COMPANY', 'NURSERY', 'LANDSCAPER', 'SMALL_FARM');

-- CreateEnum
CREATE TYPE "AnalysisKind" AS ENUM ('IDENTIFY', 'DIAGNOSE', 'GARDEN_SPACE');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NOT_CONFIGURED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'URGENT');

-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('WATERING', 'FERTILIZING', 'PRUNING', 'TRANSPLANT', 'SOWING', 'GERMINATION', 'HARVEST', 'TREATMENT', 'PEST_PREVENTION', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "unitSystem" "UnitSystem" NOT NULL DEFAULT 'METRIC',
    "experience" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER',
    "housingType" TEXT,
    "budgetLevel" TEXT,
    "maintenancePref" TEXT,
    "gardeningPrefs" TEXT[],
    "hasChildren" BOOLEAN,
    "hasPets" BOOLEAN,
    "plan" "PlanId" NOT NULL DEFAULT 'FREE',
    "imageConsentAt" TIMESTAMP(3),
    "termsAcceptedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "region" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevationM" DOUBLE PRECISION,
    "timezone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClimateCache" (
    "id" TEXT NOT NULL,
    "cellKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClimateCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taxon" (
    "id" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "authorship" TEXT,
    "rank" TEXT NOT NULL,
    "kingdom" TEXT,
    "phylum" TEXT,
    "className" TEXT,
    "orderName" TEXT,
    "family" TEXT,
    "genus" TEXT,
    "species" TEXT,
    "infraspecific" TEXT,
    "gbifKey" INTEGER,
    "wfoId" TEXT,
    "powoId" TEXT,
    "taxonomicStatus" TEXT,
    "acceptedTaxonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonSynonym" (
    "id" TEXT NOT NULL,
    "taxonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "TaxonSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonName" (
    "id" TEXT NOT NULL,
    "taxonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "country" TEXT,
    "source" TEXT NOT NULL,

    CONSTRAINT "CommonName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantProfile" (
    "id" TEXT NOT NULL,
    "taxonId" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "origin" TEXT NOT NULL,
    "promptVersion" TEXT,
    "data" JSONB NOT NULL,
    "careGuide" JSONB,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "region" TEXT,
    "confidence" TEXT,
    "limitations" TEXT,
    "license" TEXT,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "names" JSONB NOT NULL,
    "params" JSONB NOT NULL,
    "sourceId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PestDisease" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "scientificName" TEXT,
    "names" JSONB NOT NULL,
    "eppoCode" TEXT,
    "summary" JSONB NOT NULL,

    CONSTRAINT "PestDisease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "retainUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AnalysisKind" NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "model" TEXT,
    "promptVersion" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "context" JSONB,
    "result" JSONB,
    "warnings" TEXT[],
    "isTestFixture" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "taxonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisPhoto" (
    "analysisId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AnalysisPhoto_pkey" PRIMARY KEY ("analysisId","photoId")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "userPlantId" TEXT,
    "primaryProblem" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "confirmation" TEXT NOT NULL,
    "pestDiseaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "outcome" TEXT,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garden" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "areaM2" DOUBLE PRECISION,
    "orientation" TEXT,
    "soilType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenZone" (
    "id" TEXT NOT NULL,
    "gardenId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sunExposure" TEXT,
    "areaM2" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "GardenZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenDesign" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gardenId" TEXT,
    "title" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GardenDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignVersion" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "proposal" JSONB NOT NULL,
    "changeRequest" TEXT,
    "isTestFixture" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gardenId" TEXT,
    "taxonId" TEXT,
    "nickname" TEXT NOT NULL,
    "scientificName" TEXT,
    "commonName" TEXT,
    "sourceAnalysisId" TEXT,
    "coverPhotoId" TEXT,
    "locationNote" TEXT,
    "potted" BOOLEAN NOT NULL DEFAULT true,
    "acquiredAt" TIMESTAMP(3),
    "sownAt" TIMESTAMP(3),
    "germinatedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPlantId" TEXT NOT NULL,
    "type" "CareType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPlantId" TEXT,
    "type" "CareType" NOT NULL,
    "title" TEXT NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "seasonAdaptive" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "lastDoneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userPlantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "notes" TEXT,
    "heightCm" DOUBLE PRECISION,
    "healthScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryPhoto" (
    "entryId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,

    CONSTRAINT "JournalEntryPhoto_pkey" PRIMARY KEY ("entryId","photoId")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT,
    "operation" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "cacheReadTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Location_userId_idx" ON "Location"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClimateCache_cellKey_kind_provider_key" ON "ClimateCache"("cellKey", "kind", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Taxon_gbifKey_key" ON "Taxon"("gbifKey");

-- CreateIndex
CREATE UNIQUE INDEX "Taxon_wfoId_key" ON "Taxon"("wfoId");

-- CreateIndex
CREATE UNIQUE INDEX "Taxon_powoId_key" ON "Taxon"("powoId");

-- CreateIndex
CREATE INDEX "Taxon_family_idx" ON "Taxon"("family");

-- CreateIndex
CREATE INDEX "Taxon_genus_idx" ON "Taxon"("genus");

-- CreateIndex
CREATE UNIQUE INDEX "Taxon_scientificName_rank_key" ON "Taxon"("scientificName", "rank");

-- CreateIndex
CREATE INDEX "TaxonSynonym_name_idx" ON "TaxonSynonym"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonSynonym_taxonId_name_key" ON "TaxonSynonym"("taxonId", "name");

-- CreateIndex
CREATE INDEX "CommonName_name_idx" ON "CommonName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CommonName_taxonId_name_language_country_key" ON "CommonName"("taxonId", "name", "language", "country");

-- CreateIndex
CREATE UNIQUE INDEX "PlantProfile_taxonId_locale_origin_key" ON "PlantProfile"("taxonId", "locale", "origin");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_slug_key" ON "Crop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PestDisease_slug_key" ON "PestDisease"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_storageKey_key" ON "Photo"("storageKey");

-- CreateIndex
CREATE INDEX "Photo_userId_idx" ON "Photo"("userId");

-- CreateIndex
CREATE INDEX "Photo_retainUntil_idx" ON "Photo"("retainUntil");

-- CreateIndex
CREATE INDEX "Photo_userId_sha256_idx" ON "Photo"("userId", "sha256");

-- CreateIndex
CREATE INDEX "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Analysis_userId_inputHash_idx" ON "Analysis"("userId", "inputHash");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_analysisId_key" ON "Diagnosis"("analysisId");

-- CreateIndex
CREATE INDEX "Garden_userId_idx" ON "Garden"("userId");

-- CreateIndex
CREATE INDEX "GardenZone_gardenId_idx" ON "GardenZone"("gardenId");

-- CreateIndex
CREATE INDEX "GardenDesign_userId_idx" ON "GardenDesign"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignVersion_designId_version_key" ON "DesignVersion"("designId", "version");

-- CreateIndex
CREATE INDEX "UserPlant_userId_idx" ON "UserPlant"("userId");

-- CreateIndex
CREATE INDEX "CareEvent_userId_date_idx" ON "CareEvent"("userId", "date");

-- CreateIndex
CREATE INDEX "CareEvent_userPlantId_date_idx" ON "CareEvent"("userPlantId", "date");

-- CreateIndex
CREATE INDEX "Reminder_userId_nextDueAt_idx" ON "Reminder"("userId", "nextDueAt");

-- CreateIndex
CREATE INDEX "JournalEntry_userPlantId_date_idx" ON "JournalEntry"("userPlantId", "date");

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsage_userId_createdAt_idx" ON "AiUsage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxonSynonym" ADD CONSTRAINT "TaxonSynonym_taxonId_fkey" FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommonName" ADD CONSTRAINT "CommonName_taxonId_fkey" FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantProfile" ADD CONSTRAINT "PlantProfile_taxonId_fkey" FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantProfile" ADD CONSTRAINT "PlantProfile_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisPhoto" ADD CONSTRAINT "AnalysisPhoto_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisPhoto" ADD CONSTRAINT "AnalysisPhoto_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_pestDiseaseId_fkey" FOREIGN KEY ("pestDiseaseId") REFERENCES "PestDisease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenZone" ADD CONSTRAINT "GardenZone_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenDesign" ADD CONSTRAINT "GardenDesign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenDesign" ADD CONSTRAINT "GardenDesign_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignVersion" ADD CONSTRAINT "DesignVersion_designId_fkey" FOREIGN KEY ("designId") REFERENCES "GardenDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_taxonId_fkey" FOREIGN KEY ("taxonId") REFERENCES "Taxon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlant" ADD CONSTRAINT "UserPlant_coverPhotoId_fkey" FOREIGN KEY ("coverPhotoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareEvent" ADD CONSTRAINT "CareEvent_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userPlantId_fkey" FOREIGN KEY ("userPlantId") REFERENCES "UserPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryPhoto" ADD CONSTRAINT "JournalEntryPhoto_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryPhoto" ADD CONSTRAINT "JournalEntryPhoto_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
