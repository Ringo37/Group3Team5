import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
} from "@chakra-ui/react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) throw new Response("IDが必要です", { status: 400 });

  const log = await prisma.workLog.findUnique({
    where: { id: Number(params.id) },
    include: { user: true, tags: true },
  });

  if (!log) throw new Response("日誌が見つかりません", { status: 404 });
  return { log };
}

export default function WorkLogDetail() {
  const { log } = useLoaderData<typeof loader>();

  return (
    // ★修正: ページ全体の背景指定を削除（アプリの元設定に従う）
    <Box minH="100vh" py={10}>
      <Container maxW="container.md">
        <VStack align="stretch" gap={6}>
          <Link to="/worklog/list">
            {/* ★修正: ボタン自体を白くして、黒背景でも見やすくする */}
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

          {/* 詳細カード：ここは白背景・黒文字で見やすさを維持 */}
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
                <Text fontSize="sm" color="gray.500" mb={1}>
                  {new Date(log.date).toLocaleString()}
                </Text>
                <Heading as="h1" size="xl" color="teal.700">
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
