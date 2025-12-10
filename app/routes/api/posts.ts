import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

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

// GET: 全投稿取得
export async function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST/DELETE: 投稿作成・削除
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method === "POST") {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) {
      return json({ error: "Title and content are required" }, { status: 400 });
    }

    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId: userId,
        },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          likes: true,
        },
      });

      return json(post, { status: 201 });
    } catch (error) {
      console.error("Failed to create post:", error);
      return json({ error: "Failed to create post" }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    const formData = await request.formData();
    const postId = formData.get("postId") as string;

    if (!postId) {
      return json({ error: "Post ID is required" }, { status: 400 });
    }

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return json({ error: "Post not found" }, { status: 404 });
      }

      if (post.authorId !== userId) {
        return json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.post.delete({
        where: { id: postId },
      });

      return json({ success: true });
    } catch (error) {
      console.error("Failed to delete post:", error);
      return json({ error: "Failed to delete post" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
