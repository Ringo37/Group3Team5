import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { Role } from "@prisma/client";
import { useState } from "react";
import {
  redirect,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  Link,
} from "react-router";

import Header from "~/components/header";
import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user.role !== Role.ADMIN) {
    return redirect("/");
  }
  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  const [active, setActive] = useState("");
  return (
    <>
      <Header user={user} />
      <VStack gap={0} h="100vh" w="100%">
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
            管理
          </Text>
        </Box>

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
              { key: "accesslog", label: "アクセスログ" },
              { key: "user", label: "ユーザー" },
              { key: "tag", label: "タグ" },
            ].map(({ key, label }) => (
              <Link to={`admin/${key}`}>
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
              </Link>
            ))}
          </VStack>

          {/* --- メインコンテンツ --- */}
          <VStack w="80%" h="100%" p={10} align="start" overflowY="auto">
            <Outlet />
          </VStack>
        </HStack>
      </VStack>
    </>
  );
}
