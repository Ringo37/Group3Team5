import type { WeatherCondition } from "@prisma/client";
import { redirect, type ActionFunctionArgs } from "react-router";

import { prisma } from "~/lib/prisma";
import { requireUserId } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();

  const title = (form.get("title") as string) || "無題";
  const workDetails = form.get("workDetails") as string;
  const dateString = form.get("date") as string;
  const tags = form.getAll("tags[]") as string[];

  const tempValue = form.get("temperature") as string | null;
  const temperature: number | null = tempValue ? Number(tempValue) : null;
  const humValue = form.get("humidity") as string | null;
  const humidity: number | null = humValue ? Number(humValue) : null;
  const weatherValue = form.get("weather");
  const weather: WeatherCondition | null = weatherValue
    ? (weatherValue as WeatherCondition)
    : null;

  const farmId = 1;

  if (!workDetails)
    throw new Response("作業内容が入力されていません", { status: 400 });

  const date = dateString ? new Date(dateString) : new Date();

  const tagConnect = Array.isArray(tags)
    ? tags.map((t: string) => ({ where: { tag: t }, create: { tag: t } }))
    : [];

  try {
    await prisma.workLog.create({
      data: {
        date: date,
        title,
        workDetails,
        farm: { connect: { id: farmId } },
        user: { connect: { id: userId } },
        tags: { connectOrCreate: tagConnect },
        temperature,
        humidity,
        weather,
      },
    });
    // ★完了画面へ
    return redirect("/worklogformat/complete");
  } catch (error) {
    console.error("WorkLog 保存エラー:", error);
    throw new Response("保存に失敗しました", { status: 500 });
  }
}
