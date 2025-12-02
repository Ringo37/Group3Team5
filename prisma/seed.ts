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

  const crop = await prisma.crop.create({
    data: { name: "米" },
  });
  const farm = await prisma.farm.create({
    data: {
      name: "テストファーム",
      areaHa: 10,
      region: "Tokyo",
      seasonalCalendar: "Spring",
      cropId: crop.id,
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  const cover = await prisma.file.create({
    data: {
      url: "https://www.jaiwate.or.jp/wp-content/themes/ja_iwate_group/img/dummy-pic3.jpg",
      fileName: "dummy-pic3.jpg",
    },
  });
  await prisma.knowhow.createMany({
    data: [
      {
        title: "テスト1",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト2",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト3",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト4",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト5",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト6",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト7",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト8",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト9",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト10",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト11",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト12",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト13",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト14",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト15",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト16",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト17",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト18",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト19",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト20",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト21",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト22",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト23",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト24",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト25",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト26",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト27",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト28",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト29",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
      {
        title: "テスト30",
        farmId: farm.id,
        fileId: cover.id,
        visibility: "PUBLIC",
        userId: user.id,
      },
    ],
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
