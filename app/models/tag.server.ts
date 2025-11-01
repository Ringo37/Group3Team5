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

export async function createTags(tags: string[]) {
  const existing = await prisma.interestTag.findMany({
    where: { tag: { in: tags } },
  });

  const existingTags = new Set(existing.map((t) => t.tag));

  const newTags = tags.filter((t) => !existingTags.has(t));

  if (newTags.length > 0) {
    await prisma.interestTag.createMany({
      data: newTags.map((tag) => ({ tag })),
      skipDuplicates: true,
    });
  }

  return prisma.interestTag.findMany({
    where: { tag: { in: tags } },
  });
}

export async function getTagById(id: string) {
  return prisma.interestTag.findUnique({ where: { id } });
}

export async function deleteTagById(id: string) {
  return prisma.interestTag.delete({ where: { id } });
}
