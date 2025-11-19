import { prisma } from "~/lib/prisma";

interface CreateFarmProps {
  name: string;
  region: string;
  areaHa: number;
  seasonalCalendar: string;
  userId: string;
  cropId: number;
}

export async function createFarm({
  name,
  region,
  areaHa,
  seasonalCalendar,
  userId,
  cropId,
}: CreateFarmProps) {
  return prisma.farm.create({
    data: {
      name,
      region,
      areaHa,
      seasonalCalendar,
      users: {
        connect: { id: userId },
      },
      mainCrop: {
        connect: { id: cropId },
      },
    },
  });
}

interface UpdateFarmProps {
  id: number;
  name: string;
  region: string;
  areaHa: number;
  seasonalCalendar: string;
  usersId: string[];
  cropId: number;
}

export async function updateFarm({
  id,
  name,
  region,
  areaHa,
  seasonalCalendar,
  usersId,
  cropId,
}: UpdateFarmProps) {
  try {
    return prisma.farm.update({
      where: { id },
      data: {
        name,
        region,
        areaHa,
        seasonalCalendar,
        users: {
          set: usersId.map((id) => ({ id })),
        },
        mainCrop: {
          connect: { id: cropId },
        },
      },
    });
  } catch (error) {
    console.error("Failed to update organization:", error);
    return null;
  }
}

export async function getFarmById(id: number) {
  return prisma.farm.findUnique({ where: { id } });
}

export async function deleteFarmById(id: number) {
  return prisma.farm.delete({ where: { id } });
}
