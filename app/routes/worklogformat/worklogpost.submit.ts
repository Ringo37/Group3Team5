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

  // 環境データ
  const weatherString = form.get("weather") as string;
  const weather = weatherString
    ? (weatherString as WeatherCondition)
    : undefined;

  const tempStr = form.get("temperature") as string;
  const humidityStr = form.get("humidity") as string;
  const windStr = form.get("windSpeed") as string;
  const precipStr = form.get("precipitation") as string;

  const temperature = tempStr ? parseFloat(tempStr) : null;
  const humidity = humidityStr ? parseFloat(humidityStr) : null;
  const windSpeed = windStr ? parseFloat(windStr) : null;
  const precipitation = precipStr ? parseFloat(precipStr) : null;

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
        date,
        title,
        workDetails,
        weather,
        temperature,
        humidity,
        windSpeed,
        precipitation,
        farm: { connect: { id: farmId } },
        user: { connect: { id: userId } },
        tags: { connectOrCreate: tagConnect },
      },
    });

    return redirect("/worklogformat/complete");
  } catch (error) {
    console.error("WorkLog 保存エラー:", error);
    throw new Response("保存に失敗しました", { status: 500 });
  }
}
