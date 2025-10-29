import { prisma } from "~/lib/prisma";

export async function getAllCrops() {
  return prisma.crop.findMany();
}

export async function createCropSafe(cropName: string) {
  const existing = await prisma.crop.findUnique({
    where: { name: cropName },
  });

  if (existing) {
    return existing;
  }

  return prisma.crop.create({
    data: { name: cropName },
  });
}

export async function getCropById(id: number) {
  return prisma.crop.findUnique({ where: { id } });
}

export async function deleteCropById(id: number) {
  return prisma.crop.delete({ where: { id } });
}
