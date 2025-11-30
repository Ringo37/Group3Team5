import {
  Container,
  VStack,
  Box,
  Text,
  Heading,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { useLoaderData, Link } from "react-router";

import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
  try {
    const logs = await prisma.workLog.findMany({
      include: { user: true, tags: true },
      orderBy: { date: "desc" },
      take: 20,
    });
    return { logs };
  } catch (e) {
    console.error(e);
    return { logs: [] };
  }
};

export default function WorkLogList() {
  const { logs } = useLoaderData<typeof loader>();

  return (
    <Container maxW="lg" py={8}>
      <Heading mb={6} color="teal.700">
        日誌一覧
      </Heading>

      {(!logs || logs.length === 0) && (
        <Text color="gray.600">まだ投稿がありません。</Text>
      )}

      <VStack gap={4} align="stretch">
        {logs?.map((log) => (
          <Box
            key={log.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            color="black"
            _hover={{
              shadow: "lg",
              borderColor: "teal.300",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
          >
            <VStack align="stretch" gap={3}>
              {/* 日付と作成者 */}
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  {new Date(log.date).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {log.user?.name ?? "不明"}
                </Text>
              </HStack>

              {/* ★ここを修正: LinkOverlayを使わず、直接Linkで囲む */}
              <Heading size="md" color="teal.600">
                <Link
                  to={`/worklog/${log.id}`}
                  style={{ display: "block", width: "100%" }}
                >
                  {/* タイトルが保存されていない古いデータ対策 */}
                  {log.title || "無題の作業日誌"}
                </Link>
              </Heading>

              {/* タグ表示 */}
              {log.tags && log.tags.length > 0 && (
                <HStack gap={2}>
                  {log.tags.map((tag: any) => (
                    // Chakra UI v3ならTag.Root、v2ならTag
                    <Tag.Root
                      key={tag.id}
                      size="sm"
                      variant="solid"
                      bg="teal.500"
                    >
                      <Tag.Label color="white">{tag.tag}</Tag.Label>
                    </Tag.Root>
                  ))}
                </HStack>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Container>
  );
}
