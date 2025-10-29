import { prisma } from "~/lib/prisma";

export async function getAllTags() {
  return prisma.interestTag.findMany();
}

export async function createTag(tag: string) {
  const existing = await prisma.interestTag.findUnique({
    where: { tag },
  });

  if (existing) {
    return existing;
  }

  return prisma.interestTag.create({ data: { tag } });
}

export async function getTagById(id: string) {
  return prisma.interestTag.findUnique({ where: { id } });
}

export async function deleteTagById(id: string) {
  return prisma.interestTag.delete({ where: { id } });
}
