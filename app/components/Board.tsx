// app/components/Board.tsx
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Heading,
  Container,
  Card,
  Flex,
  IconButton,
  Alert,
} from "@chakra-ui/react";
import { Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Like {
  id: string;
  userId: string;
  postId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  authorId: string;
  likes: Like[];
  createdAt: string;
  updatedAt: string;
}

interface BoardProps {
  initialPosts: Post[];
  currentUserId: string;
}

export function Board({ initialPosts, currentUserId }: BoardProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const postFetcher = useFetcher();
  const likeFetcher = useFetcher();

  // 投稿作成
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    postFetcher.submit(formData, {
      method: "POST",
      action: "/api.posts",
    });

    setTitle("");
    setContent("");
  };

  // 投稿削除
  const handleDeletePost = (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;

    const formData = new FormData();
    formData.append("postId", postId);

    postFetcher.submit(formData, {
      method: "DELETE",
      action: "/api.posts",
    });
  };

  // いいね追加
  const handleLike = (postId: string) => {
    const formData = new FormData();
    formData.append("postId", postId);

    likeFetcher.submit(formData, {
      method: "POST",
      action: "/api.likes",
    });
  };

  // いいね削除
  const handleUnlike = (postId: string) => {
    const formData = new FormData();
    formData.append("postId", postId);

    likeFetcher.submit(formData, {
      method: "DELETE",
      action: "/api.likes",
    });
  };

  // いいねしているか判定
  const isLiked = (post: Post) => {
    return post.likes.some((like) => like.userId === currentUserId);
  };

  return (
    <Container maxW="2xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="2xl">
          掲示板
        </Heading>

        {/* 投稿作成フォーム */}
        <Card.Root>
          <Card.Body>
            <VStack as="form" onSubmit={handleCreatePost} gap={4}>
              <Heading as="h2" size="lg" w="full">
                新規投稿
              </Heading>

              <VStack gap={3} w="full">
                <Box w="full">
                  <label
                    htmlFor="title"
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    タイトル
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="投稿タイトルを入力"
                    required
                  />
                </Box>

                <Box w="full">
                  <label
                    htmlFor="content"
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    内容
                  </label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="投稿内容を入力"
                    required
                    minH="100px"
                  />
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  w="full"
                  disabled={postFetcher.state === "submitting"}
                >
                  {postFetcher.state === "submitting"
                    ? "投稿中..."
                    : "投稿する"}
                </Button>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* 投稿一覧 */}
        <VStack gap={4} align="stretch">
          {posts.length === 0 ? (
            <Alert.Root>
              <Text textAlign="center" color="gray.500" py={8}>
                投稿がありません
              </Text>
            </Alert.Root>
          ) : (
            posts.map((post) => (
              <Card.Root key={post.id}>
                <Card.Body>
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" gap={1}>
                        <Heading as="h3" size="md">
                          {post.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          by {post.author.name} •{" "}
                          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                        </Text>
                      </VStack>

                      {post.authorId === currentUserId && (
                        <IconButton
                          onClick={() => handleDeletePost(post.id)}
                          colorScheme="red"
                          variant="ghost"
                          aria-label="削除"
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      )}
                    </Flex>

                    <Text color="gray.700">{post.content}</Text>

                    {/* いいねボタン */}
                    <HStack>
                      <Button
                        onClick={() =>
                          isLiked(post)
                            ? handleUnlike(post.id)
                            : handleLike(post.id)
                        }
                        disabled={likeFetcher.state === "submitting"}
                        variant="ghost"
                        size="sm"
                        colorScheme={isLiked(post) ? "red" : "gray"}
                      >
                        <Heart
                          size={18}
                          fill={isLiked(post) ? "currentColor" : "none"}
                        />
                        <Text ml={2}>{post.likes.length}</Text>
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))
          )}
        </VStack>
      </VStack>
    </Container>
  );
}
