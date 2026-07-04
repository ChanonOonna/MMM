-- AlterTable
ALTER TABLE "events" ADD COLUMN     "cover_pos_x" DOUBLE PRECISION DEFAULT 50,
ADD COLUMN     "cover_pos_y" DOUBLE PRECISION DEFAULT 50,
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
