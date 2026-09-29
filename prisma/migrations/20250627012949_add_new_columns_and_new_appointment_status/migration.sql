-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'RECHAZADA';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "barberName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "serviceName" TEXT NOT NULL DEFAULT '';
