import { Action, Prisma, Visibility, type InterestTag } from "@prisma/client";

import { prisma } from "~/lib/prisma";

interface CreateKnowhowProps {
  title: string;
  summary?: string;
  fullText?: string;
  farmId: number;
  userId: string;
  visibility: Visibility;
  tags?: InterestTag[];
}

export type KnowhowWithCover = Prisma.KnowhowGetPayload<{
  include: { cover: true; tags: true };
}>;

export async function createKnowhow({
  title,
  summary,
  fullText,
  farmId,
  userId,
  visibility,
  tags,
}: CreateKnowhowProps) {
  return prisma.knowhow.create({
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
      tags: tags?.length
        ? {
            connect: tags.map((tag) => ({ id: tag.id })),
          }
        : undefined,
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
  return prisma.knowhow.findUnique({
    where: { id },
    include: { cover: true, farm: true },
  });
}

export async function deleteKnowhowById(id: number, userId: string) {
  await prisma.accessLog.create({
    data: { userId, knowhowId: id, action: Action.DELETE },
  });
  return prisma.knowhow.delete({
    where: { id, visibility: Visibility.PUBLIC },
  });
}

export async function getKnowHowsByUserId(userId: string) {
  return prisma.knowhow.findMany({
    where: { userId },
  });
}

function buildSearchWhere(search?: string) {
  if (!search) return {};

  return {
    OR: [
      { title: { contains: search } },
      { summary: { contains: search } },
      { fullText: { contains: search } },
      {
        tags: {
          some: {
            tag: { contains: search },
          },
        },
      },
    ],
  };
}

export async function getKnowHows(page = 1, limit = 6, search?: string) {
  const searchFilter = buildSearchWhere(search);

  return prisma.knowhow.findMany({
    where: {
      visibility: "PUBLIC",
      ...searchFilter,
    },
    skip: (page - 1) * limit,
    take: limit,
    include: { cover: true, tags: true },
    orderBy: {
      accessLogs: {
        _count: "desc",
      },
    },
  });
}

export async function getKnowHowsCount(search?: string) {
  const searchFilter = buildSearchWhere(search);

  return prisma.knowhow.count({
    where: {
      visibility: "PUBLIC",
      ...searchFilter,
    },
  });
}
