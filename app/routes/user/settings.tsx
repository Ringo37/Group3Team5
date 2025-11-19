import { VStack, Box, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export default function Setting() {
  const { user } = useLoaderData<typeof loader>();
  const [active, setActive] = useState<"account" | "notifications">("account");
  return (
    <VStack gap={0} h="100vh" w="100%">
      {/* --- 上部バー（ユーザー名など） --- */}
      <Box
        w="100%"
        bg="white"
        _dark={{ bg: "gray.900", borderColor: "gray.700" }}
        borderBottom="1px solid"
        borderColor="gray.200"
        p={4}
        boxShadow="sm"
      >
        <Text fontSize="2xl" fontWeight="bold">
          設定
        </Text>
      </Box>

      {/* --- 下部：サイドバー＋メインコンテンツ --- */}
      <HStack
        align="start"
        gap={0}
        h="100%"
        w="100%"
        bg="gray.100"
        _dark={{ bg: "gray.800" }}
      >
        {/* --- サイドメニュー --- */}
        <VStack
          w="20%"
          h="100%"
          p={4}
          gap={4}
          bg="white"
          _dark={{ bg: "gray.900", borderColor: "gray.700" }}
          borderRight="1px solid"
          borderColor="gray.200"
          align="stretch"
        >
          {[
            { key: "account", label: "アカウント設定" },
            { key: "notifications", label: "通知設定" },
          ].map(({ key, label }) => (
            <Box
              key={key}
              p={2}
              borderRadius="md"
              cursor="pointer"
              bg={active === key ? "gray.200" : "transparent"}
              _dark={{
                bg: active === key ? "gray.700" : "transparent",
              }}
              _hover={{
                bg: active === key ? "gray.300" : "gray.100",
                _dark: { bg: active === key ? "gray.600" : "gray.800" },
              }}
              onClick={() => setActive(key as typeof active)}
            >
              {label}
            </Box>
          ))}
        </VStack>

        {/* --- メインコンテンツ --- */}
        <VStack w="80%" h="100%" p={10} align="start" overflowY="auto">
          {active === "account" && (
            <Box
              w="100%"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="lg"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              p={6}
              boxShadow="md"
            >
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                アカウント設定
              </Text>
              <Text fontSize="large">ユーザー名：{user.name}</Text>
            </Box>
          )}

          {active === "notifications" && (
            <Box
              w="100%"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="lg"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              p={6}
              boxShadow="md"
            >
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                通知設定
              </Text>
              <Text>ここに通知設定を表示します。</Text>
            </Box>
          )}
        </VStack>
      </HStack>
    </VStack>
  );
}
