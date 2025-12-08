import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Link,
  useLoaderData,
  Form,
  redirect,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { prisma } from "~/lib/prisma";
import { getUserId, requireUserId } from "~/services/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  if (!params.id) throw new Response("IDが必要です", { status: 400 });
  const currentUserId = await getUserId(request);
  const log = await prisma.workLog.findUnique({
    where: { id: Number(params.id) },
    include: { user: true, tags: true },
  });
  if (!log) throw new Response("日誌が見つかりません", { status: 404 });
  return { log, currentUserId };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const logId = Number(params.id);
  const result = await prisma.workLog.deleteMany({
    where: { id: logId, userId: userId },
  });
  if (result.count === 0)
    throw new Response("権限がないか、日誌が存在しません", { status: 403 });

  // ★修正: リダイレクト先を worklogformat に変更
  return redirect("/worklogformat/list?deleted=true");
}

export default function WorkLogDetail() {
  const { log, currentUserId } = useLoaderData<typeof loader>();
  const isOwner = currentUserId === log.userId;
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdated = searchParams.get("updated") === "true";
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isUpdated) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isUpdated, setSearchParams]);

  const handleDelete = (event: React.FormEvent) => {
    if (!confirm("本当にこの日誌を削除しますか？")) {
      event.preventDefault();
    }
  };

  return (
    <Box minH="100vh" py={10}>
      <Container maxW="container.md">
        <VStack align="stretch" gap={6}>
          {showSuccess && (
            <Box
              p={4}
              bg="green.50"
              color="green.800"
              borderRadius="md"
              borderWidth="1px"
              borderColor="green.200"
              textAlign="center"
            >
              <Text fontWeight="bold">✅ 日誌の内容を更新しました</Text>
            </Box>
          )}

          {/* ★修正: 戻る先を変更 */}
          <Link to="/worklogformat/list">
            <Button
              variant="solid"
              size="sm"
              bg="white"
              color="gray.800"
              borderWidth="1px"
              borderColor="gray.300"
              _hover={{ bg: "gray.100" }}
            >
              ← 一覧に戻る
            </Button>
          </Link>

          <Box
            p={8}
            shadow="lg"
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            color="black"
          >
            <VStack align="stretch" gap={4}>
              <Box borderBottomWidth="1px" borderColor="gray.200" pb={4}>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={2}
                >
                  <Text fontSize="sm" color="gray.500">
                    {new Date(log.date).toLocaleString()}
                  </Text>
                  {isOwner && (
                    <HStack>
                      {/* ★修正: 編集画面へのリンクパスを変更 */}
                      <Link to={`/worklogformat/${log.id}/edit`}>
                        <Button size="sm" colorScheme="blue" variant="outline">
                          編集
                        </Button>
                      </Link>
                      <Form method="post" onSubmit={handleDelete}>
                        <Button
                          type="submit"
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                        >
                          削除
                        </Button>
                      </Form>
                    </HStack>
                  )}
                </Flex>
                <Heading as="h1" size="xl" mt={2} color="teal.700">
                  {log.title}
                </Heading>
                <Text fontSize="md" color="gray.600" mt={2}>
                  作成者: {log.user?.name ?? "不明"}
                </Text>
              </Box>
              <Box py={4}>
                <Text
                  fontSize="lg"
                  lineHeight="tall"
                  color="black"
                  whiteSpace="pre-wrap"
                >
                  {log.workDetails}
                </Text>
              </Box>
              {log.tags && log.tags.length > 0 && (
                <Box pt={4} borderTopWidth="1px" borderColor="gray.100">
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    タグ:
                  </Text>
                  <HStack wrap="wrap" gap={2}>
                    {log.tags.map((tag: any) => (
                      <Tag.Root
                        key={tag.id}
                        size="md"
                        variant="solid"
                        bg="teal.100"
                        borderWidth="1px"
                        borderColor="teal.400"
                      >
                        <Tag.Label color="teal.800" fontWeight="bold">
                          #{tag.tag}
                        </Tag.Label>
                      </Tag.Root>
                    ))}
                  </HStack>
                </Box>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
