import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = "test@example.com";
const password = "Passw0rd!";
const hashedPassword = await bcrypt.hash(password, 10);

async function seed() {
  const user = await prisma.user.create({
    data: {
      name: "Test",
      email: email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      role: Role.ADMIN,
    },
  });
  console.log(`Database has been seeded with an admin user 🌱: ${user.email}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
