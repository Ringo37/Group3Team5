import { Action, type Visibility } from "@prisma/client";

import { prisma } from "~/lib/prisma";

interface CreateKnowhowProps {
  title: string;
  summary?: string;
  fullText?: string;
  farmId: number;
  userId: string;
  visibility: Visibility;
}

export async function createKnowhow({
  title,
  summary,
  fullText,
  farmId,
  userId,
  visibility,
}: CreateKnowhowProps) {
  prisma.knowhow.create({
    data: {
      title,
      summary,
      fullText,
      farmId,
      userId,
      visibility,
      accessLogs: {
        create: {
          userId,
          action: Action.CREATE,
        },
      },
    },
  });
}

interface UpdateKnowhowProps {
  id: number;
  title: string;
  summary?: string;
  fullText?: string;
  farmId: number;
  userId: string;
  visibility: Visibility;
}

export async function updateKnowhow({
  id,
  title,
  summary,
  fullText,
  farmId,
  userId,
  visibility,
}: UpdateKnowhowProps) {
  prisma.knowhow.update({
    where: { id },
    data: {
      title,
      summary,
      fullText,
      farmId,
      userId,
      visibility,
      accessLogs: {
        create: {
          userId,
          action: Action.UPDATE,
        },
      },
    },
  });
}

export async function getKnowhowById(id: number, userId: string) {
  await prisma.accessLog.create({
    data: { userId, knowhowId: id, action: Action.VIEW },
  });
  return prisma.knowhow.findUnique({ where: { id } });
}

export async function deleteKnowhowById(id: number, userId: string) {
  await prisma.accessLog.create({
    data: { userId, knowhowId: id, action: Action.DELETE },
  });
  return prisma.knowhow.delete({ where: { id } });
}
