import type { Prisma, WeatherCondition } from "@prisma/client";

import { prisma } from "~/lib/prisma";

interface CreateWorkLogProps {
  date: Date;
  workDetails: string;
  weather: WeatherCondition;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  farmId: number;
  userId: string;
}

export async function createWorkLog({
  date,
  workDetails,
  weather,
  temperature,
  humidity,
  windSpeed,
  precipitation,
  farmId,
  userId,
}: CreateWorkLogProps) {
  return prisma.workLog.create({
    data: {
      date,
      workDetails,
      weather,
      temperature,
      humidity,
      windSpeed,
      precipitation,
      farm: { connect: { id: farmId } },
      user: { connect: { id: userId } },
    },
  });
}

interface UpdateWorkLogProps {
  id: number;
  date: Date;
  workDetails: string;
  weather: WeatherCondition;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
}

export async function updateWorkLog({
  id,
  date,
  workDetails,
  weather,
  temperature,
  humidity,
  windSpeed,
  precipitation,
}: UpdateWorkLogProps) {
  return prisma.workLog.update({
    where: { id },
    data: {
      date,
      workDetails,
      weather,
      temperature,
      humidity,
      windSpeed,
      precipitation,
    },
  });
}

export async function getWorkLogById(id: number) {
  return prisma.workLog.findUnique({ where: { id } });
}

export async function deleteWorkLogById(id: number) {
  return prisma.workLog.delete({ where: { id } });
}

export type WorkLogsWithUserAndTags = Prisma.WorkLogGetPayload<{
  include: { tags: true; user: true };
}>;

export async function getWorkLogsByFarmId(farmId: number) {
  return prisma.workLog.findMany({
    where: { farm: { id: farmId } },
    include: { tags: true, user: true },
  });
}
