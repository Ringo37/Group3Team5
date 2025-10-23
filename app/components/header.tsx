import {
  Flex,
  Box,
  Heading,
  HStack,
  Button,
  Link as ChakraLink,
  Input,
  Avatar,
  Menu,
  InputGroup,
} from "@chakra-ui/react";
import type { User } from "@prisma/client";
import { Search, Edit } from "lucide-react";
import { Form, Link as RouterLink } from "react-router";

import { ColorModeButton } from "./ui/color-mode";

interface HeaderUser extends User {
  image?: string | null;
}

export default function Header({ user }: { user: HeaderUser | null }) {
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      wrap="wrap"
      paddingY={4}
      paddingX={6}
      bg="white"
      _dark={{
        bg: "gray.800",
        color: "whiteAlpha.900",
        borderColor: "gray.700",
      }}
      color="gray.800"
      width="100%"
      borderBottomWidth="1px"
      borderColor="gray.200"
      gap={4}
    >
      {/* ロゴとか */}
      <HStack>
        <RouterLink to="/">
          <ChakraLink _hover={{ textDecoration: "none" }}>
            <Heading as="h1" size="lg" color="teal.500">
              農ハウ(仮)
            </Heading>
          </ChakraLink>
        </RouterLink>

        <HStack display={{ base: "none", md: "flex" }}>
          <RouterLink to="explore">
            <ChakraLink fontWeight="medium" _hover={{ color: "teal.500" }}>
              ノウハウを探す
            </ChakraLink>
          </RouterLink>
          <RouterLink to="categories">
            <ChakraLink fontWeight="medium" _hover={{ color: "teal.500" }}>
              カテゴリ
            </ChakraLink>
          </RouterLink>
        </HStack>
      </HStack>

      {/* 検索バー */}
      <Box
        flex={1}
        minWidth="200px"
        mx={8}
        display={{ base: "none", md: "block" }}
      >
        <InputGroup>
          <>
            <Box
              pointerEvents="none"
              pl={4}
              h="100%"
              display="flex"
              alignItems="center"
            >
              <Search size={16} color="gray" />
            </Box>
            <Input
              type="search"
              placeholder="キーワードでノウハウを検索..."
              borderRadius="full"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              borderColor="gray.300"
              pl={10}
            />
          </>
        </InputGroup>
      </Box>

      {/* ユーザーアクション */}
      <HStack align="center">
        <ColorModeButton />

        {user ? (
          <>
            <RouterLink to="/new">
              <Button
                colorScheme="teal"
                display={{ base: "none", md: "inline-flex" }}
              >
                <Edit size={16} />
                <Box as="span" ml={2}>
                  {" "}
                  ボタン仮
                </Box>
              </Button>
            </RouterLink>

            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  rounded={"full"}
                  variant={"surface"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar.Root size="sm">
                    <Avatar.Image
                      src={user.image || undefined}
                      alt={user.name || "User Avatar"}
                    />
                    <Avatar.Fallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </Button>
              </Menu.Trigger>

              <Menu.Positioner>
                <Menu.Content>
                  <RouterLink to={`/profile/${user.id}`}>
                    <Menu.Item value="マイページ">マイページ</Menu.Item>
                  </RouterLink>
                  <RouterLink to="/settings">
                    <Menu.Item value="設定">設定</Menu.Item>
                  </RouterLink>
                  <Menu.Separator />
                  <Form action="/logout" method="post">
                    <Button
                      type="submit"
                      variant="plain"
                      border="none"
                      padding={0}
                      height="auto"
                      width="full"
                      _focus={{ boxShadow: "none" }}
                    >
                      <Menu.Item value="ログアウト">ログアウト</Menu.Item>
                    </Button>
                  </Form>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </>
        ) : (
          <HStack display={{ base: "none", md: "flex" }}>
            <RouterLink to="/login">
              <Button variant="ghost">ログイン</Button>
            </RouterLink>
            <RouterLink to="/signup">
              <Button colorScheme="teal">新規登録</Button>
            </RouterLink>
          </HStack>
        )}
      </HStack>
    </Flex>
  );
}
