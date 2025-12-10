// app/routes/board.tsx
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Board } from "~/components/Board";
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

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        likes: {
          select: { id: true, userId: true, postId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return json({ posts, currentUserId: userId });
  } catch (error) {
    console.error("Failed to load posts:", error);
    return json({ posts: [], currentUserId: userId });
  }
}

export default function BoardPage() {
  const { posts, currentUserId } = useLoaderData<typeof loader>();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <Board initialPosts={posts} currentUserId={currentUserId} />
    </div>
  );
}
