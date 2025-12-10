// app/routes/api.likes.ts
import type { ActionFunctionArgs } from "react-router";

import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";

const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method === "POST") {
    const formData = await request.formData();
    const postId = formData.get("postId") as string;

    if (!postId) {
      return json({ error: "Post ID is required" }, { status: 400 });
    }

    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });

      if (existingLike) {
        return json({ error: "Already liked this post" }, { status: 400 });
      }

      const like = await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });

      return json(like, { status: 201 });
    } catch (error) {
      console.error("Failed to like post:", error);
      return json({ error: "Failed to like post" }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const postId = formData.get("postId") as string;

    if (!postId) {
      return json({ error: "Post ID is required" }, { status: 400 });
    }

    try {
      await prisma.like.delete({
        where: {
          postId_userId: { postId, userId },
        },
      });

      return json({ success: true });
    } catch (error) {
      console.error("Failed to unlike post:", error);
      return json({ error: "Failed to unlike post" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
