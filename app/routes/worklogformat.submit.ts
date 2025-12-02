import { redirect, type ActionFunctionArgs } from "react-router";

import { prisma } from "~/lib/prisma";
import { requireUserId } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();

  // ★タイトル取得
  const title = (form.get("title") as string) || "無題";
  const workDetails = form.get("workDetails") as string;
  const tags = form.getAll("tags[]") as string[];
  const farmId = 1;

  if (!workDetails) {
    throw new Response("作業内容が入力されていません", { status: 400 });
  }

  const tagConnect = Array.isArray(tags)
    ? tags.map((t: string) => ({
        where: { tag: t },
        create: { tag: t },
      }))
    : [];

  try {
    await prisma.workLog.create({
      data: {
        date: new Date(),
        title, // ★タイトル保存
        workDetails,
        farm: { connect: { id: farmId } },
        user: { connect: { id: userId } },
        tags: { connectOrCreate: tagConnect },
      },
    });

    return redirect("/worklog/complete");
  } catch (error) {
    console.error("WorkLog 保存エラー:", error);
    throw new Response("保存に失敗しました", { status: 500 });
  }
}
