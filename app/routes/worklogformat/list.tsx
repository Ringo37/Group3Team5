import {
  Container,
  VStack,
  Box,
  Text,
  Heading,
  HStack,
  Tag,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLoaderData, Link, useSearchParams } from "react-router";

import { prisma } from "~/lib/prisma";

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

  // 削除完了メッセージの制御
  const [searchParams, setSearchParams] = useSearchParams();
  const isDeleted = searchParams.get("deleted") === "true";
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isDeleted) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDeleted, setSearchParams]);

  return (
    <Container maxW="lg" py={8}>
      {/* メッセージエリア */}
      {showNotification && (
        <Box
          mb={6}
          p={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderWidth="1px"
          borderColor="red.200"
          textAlign="center"
        >
          <Text fontWeight="bold">🗑️ 日誌を削除しました</Text>
        </Box>
      )}

      {/* ★追加: 日誌トップに戻るボタン */}
      <Box mb={4}>
        <Link to="/worklogformat">
          <Button
            variant="solid"
            size="sm"
            bg="white"
            color="gray.800"
            borderWidth="1px"
            borderColor="gray.300"
            _hover={{ bg: "gray.100" }}
          >
            ← 日誌トップに戻る
          </Button>
        </Link>
      </Box>

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
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  {new Date(log.date).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {log.user?.name ?? "不明"}
                </Text>
              </HStack>

              <Heading size="md" color="teal.600">
                <Link
                  to={`/worklogformat/${log.id}`}
                  style={{ display: "block", width: "100%" }}
                >
                  {log.title || "無題の作業日誌"}
                </Link>
              </Heading>

              {/* タグ表示 */}
              {log.tags && log.tags.length > 0 && (
                <HStack gap={2}>
                  {log.tags.map((tag: any) => (
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
