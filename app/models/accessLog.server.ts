import type { Action } from "@prisma/client";

import { prisma } from "~/lib/prisma";

interface CreateAccessLogProps {
  action: Action;
  knowhowId: number;
  userId: string;
}

export async function createAccessLog({
  action,
  knowhowId,
  userId,
}: CreateAccessLogProps) {
  return prisma.accessLog.create({
    data: {
      action,
      knowhow: { connect: { id: knowhowId } },
      user: { connect: { id: userId } },
    },
  });
}

export async function getAccessLogByKnowhowId(knowhowId: number) {
  return prisma.accessLog.findMany({ where: { knowhow: { id: knowhowId } } });
}

export async function getAccessLogByUserId(userId: string) {
  return prisma.accessLog.findMany({ where: { user: { id: userId } } });
}

export async function getAllAccessLog() {
  return prisma.accessLog.findMany({ include: { user: true, knowhow: true } });
}
