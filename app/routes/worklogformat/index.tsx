import {
  Button,
  VStack,
  Heading,
  Box,
  Text,
  Card,
  Stack,
} from "@chakra-ui/react";
import { Link, useLoaderData } from "react-router";

import { prisma } from "~/lib/prisma";

export const loader = async () => {
  try {
    const latestLogs = await prisma.workLog.findMany({
      orderBy: { date: "desc" },
      take: 3,
      include: { user: true, tags: true },
    });
    return { latestLogs };
  } catch (e) {
    console.error(e);
    return { latestLogs: [] };
  }
};

export default function WorkLogIndex() {
  const { latestLogs } = useLoaderData<typeof loader>();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <VStack gap={8} w="full" maxW="md">
        <Heading as="h1" size="2xl" color="green.700">
          農ハウマッチング
        </Heading>

        {/* ボタンエリア: 2つのボタンを縦に並べる */}
        <VStack gap={4} w="full">
          {/* 1. 日誌を書く（メインボタン） */}
          <Link to="/worklogformat/worklogpost" style={{ width: "100%" }}>
            <Button
              bg="teal.400"
              color="white"
              size="lg"
              width="full"
              px={8}
              borderRadius="full"
              _hover={{ bg: "teal.500", transform: "scale(1.02)" }}
              boxShadow="md"
            >
              日誌を書く
            </Button>
          </Link>

          {/* 2. すべての日誌を見る（サブボタン：ここに移動しました） */}
          <Link to="/worklogformat/list" style={{ width: "100%" }}>
            <Button
              variant="outline"
              size="lg"
              width="full"
              bg="white"
              color="teal.600"
              borderWidth="1px"
              borderColor="teal.600"
              borderRadius="full"
              _hover={{ bg: "teal.50", transform: "scale(1.02)" }}
            >
              すべての日誌を見る →
            </Button>
          </Link>
        </VStack>

        <Box w="full" h="1px" bg="gray.400" />

        <Box w="full">
          <Heading as="h3" size="md" mb={4} color="gray.500">
            最新の作業日誌
          </Heading>

          {latestLogs && latestLogs.length > 0 ? (
            <VStack gap={4} align="stretch">
              {latestLogs.map((log) => (
                <Card.Root
                  key={log.id}
                  width="full"
                  variant="elevated"
                  bg="white"
                  color="black"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Card.Body>
                    <Stack gap={2}>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(log.date).toLocaleDateString()} -{" "}
                        {log.user?.name ?? "ユーザー"}
                      </Text>

                      <Heading size="md" color="teal.600">
                        <Link
                          to={`/worklogformat/${log.id}`}
                          style={{ display: "block", width: "100%" }}
                        >
                          {log.title || "無題の作業日誌"}
                        </Link>
                      </Heading>

                      <Text fontSize="sm" color="gray.800" lineClamp={2}>
                        {log.workDetails}
                      </Text>

                      {log.tags && log.tags.length > 0 && (
                        <Text fontSize="sm" color="teal.600">
                          {log.tags.map((t: any) => `#${t.tag} `)}
                        </Text>
                      )}
                    </Stack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">まだ日誌がありません。</Text>
          )}

          {/* 下にあったボタンエリアは削除済み */}
        </Box>
      </VStack>
    </Box>
  );
}
