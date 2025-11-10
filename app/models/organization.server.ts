import { prisma } from "~/lib/prisma";

interface CreateOrganizationProps {
  name: string;
  detail?: string;
  ownerId: string;
}

export async function createOrganization({
  name,
  detail,
  ownerId,
}: CreateOrganizationProps) {
  return prisma.organization.create({
    data: {
      name,
      detail,
      owners: {
        connect: { id: ownerId },
      },
    },
  });
}

interface UpdateOrganizationProps {
  id: string;
  name: string;
  detail?: string;
  ownersId: string[];
}

export async function updateOrganization({
  id,
  name,
  detail,
  ownersId,
}: UpdateOrganizationProps) {
  try {
    return await prisma.organization.update({
      where: { id },
      data: {
        name,
        detail,
        owners: {
          set: ownersId.map((id) => ({ id })),
        },
      },
    });
  } catch (error) {
    console.error("Failed to update organization:", error);
    return null;
  }
}

export async function getOrganizationById(id: string) {
  return prisma.organization.findUnique({ where: { id } });
}

export async function deleteOrganizationById(id: string) {
  return prisma.organization.delete({ where: { id } });
}
