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

import { prisma } from "~/lib/prisma.server";

export const loader = async () => {
  try {
    const latestLog = await prisma.workLog.findFirst({
      orderBy: { date: "desc" },
      include: { user: true, tags: true },
    });
    return { latestLog };
  } catch (e) {
    console.error(e);
    return { latestLog: null };
  }
};

export default function WorkLogIndex() {
  const { latestLog } = useLoaderData<typeof loader>();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
      bg="gray.50"
    >
      <VStack gap={8} w="full" maxW="md">
        <Heading as="h1" size="2xl" color="green.700">
          農ハウマッチング
        </Heading>

        <Link to="/worklogformat">
          <Button
            bg="teal.400"
            color="white"
            size="lg"
            px={8}
            borderRadius="full"
            _hover={{ bg: "teal.500", transform: "scale(1.05)" }}
            boxShadow="md"
          >
            日誌を書く
          </Button>
        </Link>

        {/* Dividerの代わりにBoxで線を描画（エラー回避） */}
        <Box w="full" h="1px" bg="gray.200" />

        <Box w="full">
          <Heading as="h3" size="md" mb={4} color="gray.600">
            最新の作業日誌
          </Heading>

          {latestLog ? (
            <Card.Root width="full" variant="elevated">
              <Card.Body>
                <Stack gap="2">
                  <Text fontSize="sm" color="gray.500">
                    {new Date(latestLog.date).toLocaleDateString()} -{" "}
                    {latestLog.user?.name ?? "ユーザー"}
                  </Text>
                  <Heading size="sm">
                    {latestLog.workDetails.slice(0, 30)}...
                  </Heading>

                  {latestLog.tags && latestLog.tags.length > 0 && (
                    <Text fontSize="sm" color="teal.600">
                      {latestLog.tags.map((t: any) => `#${t.tag} `)}
                    </Text>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          ) : (
            <Text color="gray.500">まだ日誌がありません。</Text>
          )}

          <Box pt={4} textAlign="center">
            <Link to="/worklog/list">
              {/* 「->」を「→」に変更してエラー回避 */}
              <Button variant="ghost" size="sm" colorScheme="teal">
                すべての日誌を見る →
              </Button>
            </Link>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}
