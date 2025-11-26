import {
  Flex,
  Box,
  HStack,
  Button,
  Input,
  Avatar,
  Menu,
  InputGroup,
  AvatarGroup,
  Icon,
} from "@chakra-ui/react";
import { Home, SquarePen, Search, Users, BookOpen } from "lucide-react";
import { Form, Link } from "react-router";

import type { UserWithAvatar } from "~/models/user.server";

export default function Header({ user }: { user: UserWithAvatar | null }) {
  return (
    <Flex
      as="header"
      maxWidth="7xl"
      mx="auto"
      width="100%"
      direction="column"
      borderBottomWidth="1px"
      borderColor="gray.200"
      _dark={{
        borderColor: "gray.700",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
        paddingY={4}
        paddingX={6}
        bg="white"
        _dark={{
          bg: "gray.800",
          color: "whiteAlpha.900",
        }}
        color="gray.800"
        width="100%"
        gap={4}
      >
        {/* ロゴ */}
        <HStack>
          <Link to="/">
            <Box fontSize="3xl" fontWeight="bold" color="teal.500">
              農ハウ(仮)
            </Box>
          </Link>
        </HStack>

        <Box
          flex={1}
          minWidth="200px"
          mx={8}
          display={{ base: "none", md: "block" }}
        >
          {/*
          <InputGroup startElement={<Search size={16} color="gray" />}>
            <Input
              type="search"
              placeholder="キーワードでノウハウを検索..."
              borderRadius="full"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              borderColor="gray.300"
              pl={10}
            />
          </InputGroup>*/}
        </Box>

        <HStack align="center">
          {user ? (
            <>
              <Menu.Root>
                <Menu.Trigger _focus={{ borderRadius: "full" }}>
                  <AvatarGroup>
                    <Avatar.Root size="sm">
                      <Avatar.Image
                        src={user.avatar?.url || undefined}
                        alt={user.name || "User Avatar"}
                      />
                      <Avatar.Fallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </AvatarGroup>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content>
                    <Link to={`/mypage`}>
                      <Menu.Item value="マイページ">マイページ</Menu.Item>
                    </Link>
                    <Link to="/settings">
                      <Menu.Item value="設定">設定</Menu.Item>
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link to={`/admin`}>
                        <Menu.Item value="管理画面">管理画面</Menu.Item>
                      </Link>
                    )}
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
            <HStack>
              <Link to="/login">
                <Button
                  bg="#FF7B00"
                  color="white"
                  borderRadius="full"
                  _hover={{
                    bg: "#E66F00",
                  }}
                >
                  ログイン
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  bg="#009245"
                  color="white"
                  borderRadius="full"
                  _hover={{
                    bg: "#007A3A",
                  }}
                >
                  新規登録
                </Button>
              </Link>
            </HStack>
          )}
        </HStack>

        <Box
          flex={1}
          minWidth={{ base: "200px", md: "200px" }}
          width={{ base: "full", md: "auto" }}
          mx={0}
          display={{ base: "block", md: "none" }}
        >
          <InputGroup startElement={<Search size={16} color="gray" />}>
            <Input
              type="search"
              placeholder="キーワードでノウハウを検索..."
              borderRadius="full"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              borderColor="gray.300"
              pl={10}
            />
          </InputGroup>
        </Box>
      </Flex>

      <Flex
        as="nav"
        align="center"
        justify="center"
        width="100%"
        paddingY={3}
        paddingX={6}
        bg="transparent"
        _dark={{
          bg: "gray.800",
        }}
      >
        <HStack gap={10}>
          <Link to="/">
            <HStack
              as="span"
              gap={2}
              align="center"
              fontSize="2xl"
              fontWeight="medium"
              color="#009245"
              _hover={{ color: "#266836" }}
            >
              <Icon as={Home} boxSize={6} />
              <span>ホーム</span>
            </HStack>
          </Link>
          <Link to="/post">
            <HStack
              as="span"
              gap={2}
              align="center"
              fontSize="2xl"
              fontWeight="medium"
              color="#009245"
              _hover={{ color: "#266836" }}
            >
              <Icon as={SquarePen} boxSize={6} />
              <span>ノウハウを投稿する</span>
            </HStack>
          </Link>
          <Link to="/explore">
            <HStack
              as="span"
              gap={2}
              align="center"
              fontSize="2xl"
              fontWeight="medium"
              color="#009245"
              _hover={{ color: "#266836" }}
            >
              <Icon as={Search} boxSize={6} />
              <span>ノウハウを探す</span>
            </HStack>
          </Link>
          <Link to="/community">
            <HStack
              as="span"
              gap={2}
              align="center"
              fontSize="2xl"
              fontWeight="medium"
              color="#009245"
              _hover={{ color: "#266836" }}
            >
              <Icon as={Users} boxSize={6} />
              <span>コミュニティ</span>
            </HStack>
          </Link>
          <Link to="/guide">
            <HStack
              as="span"
              gap={2}
              align="center"
              fontSize="2xl"
              fontWeight="medium"
              color="#009245"
              _hover={{ color: "#266836" }}
            >
              <Icon as={BookOpen} boxSize={6} />
              <span>ご利用ガイド</span>
            </HStack>
          </Link>
        </HStack>
      </Flex>
    </Flex>
  );
}
