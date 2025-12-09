import {
  Flex,
  Box,
  HStack,
  Button,
  Avatar,
  Menu,
  AvatarGroup,
  Icon,
  Image,
} from "@chakra-ui/react";
import { Home, SquarePen, Search, Users, BookOpen } from "lucide-react";
import { Form, Link, useLocation } from "react-router";

import type { UserWithAvatar } from "~/models/user.server";

export default function Header({ user }: { user: UserWithAvatar | null }) {
  const location = useLocation();
  const activeColor = "#009245";

  const getLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return {
      borderBottomWidth: "4px",
      borderColor: isActive ? activeColor : "transparent",
      color: isActive ? activeColor : "#009245",

      paddingBottom: "14px",
      marginBottom: "-1.5px",

      fontWeight: "medium" as const,
      fontSize: "md",
      transition: "all 0.2s",
      _hover: { color: "#266836" },
    };
  };

  return (
    <Flex
      as="header"
      direction="column"
      width="100%"
      borderBottomWidth="1px"
      borderColor="gray.200"
      bg="white"
      _dark={{
        borderColor: "gray.700",
        bg: "gray.800",
        color: "whiteAlpha.900",
      }}
      color="gray.800"
      alignItems="center"
    >
      <Flex
        direction="column"
        width={{ base: "95%", md: "100%" }}
        maxWidth="5xl"
        mx="auto"
      >
        <Flex
          align="center"
          justify="space-between"
          paddingTop={4}
          paddingBottom={2}
          width="100%"
          gap={4}
          px={{ base: 3, md: 0 }}
        >
          <HStack ml={{ base: 0, md: 0, lg: 0 }}>
            <Link to="/">
              <HStack gap={3} align="center">
                <Image
                  src="/favicon.svg"
                  alt="農ハウ ロゴ"
                  height="75px"
                  width="auto"
                  objectFit="contain"
                />
                <Box fontSize="3xl" fontWeight="bold" color="#009570">
                  農ハウマッチング
                </Box>
              </HStack>
            </Link>
          </HStack>

          <HStack align="center" mr={user ? { base: 50, md: 50 } : 0}>
            {user ? (
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
            ) : (
              <HStack>
                <Link to="/login">
                  <Button
                    bg="#FF7B00"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "#E66F00" }}
                  >
                    ログイン
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    bg="#009245"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "#007A3A" }}
                  >
                    新規登録
                  </Button>
                </Link>
              </HStack>
            )}
          </HStack>

          {/* スマホ用検索バー 
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
                placeholder="キーワード..."
                borderRadius="full"
                bg="gray.50"
                _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                borderColor="gray.300"
                pl={10}
              />
            </InputGroup>
          </Box>
          */}
        </Flex>

        {/* === 下段: ナビゲーション === */}
        <Flex as="nav" align="center" justify="center" width="100%">
          <HStack gap={{ base: 4, md: 8, lg: 10 }}>
            <Link to="/">
              <HStack as="span" gap={2} align="center" {...getLinkStyle("/")}>
                <Icon as={Home} boxSize={6} />
                <span style={{ whiteSpace: "nowrap" }}>ホーム</span>
              </HStack>
            </Link>

            <Link to="/post">
              <HStack
                as="span"
                gap={2}
                align="center"
                {...getLinkStyle("/post")}
              >
                <Icon as={SquarePen} boxSize={6} />
                <span style={{ whiteSpace: "nowrap" }}>ノウハウを投稿する</span>
              </HStack>
            </Link>

            <Link to="/explore">
              <HStack
                as="span"
                gap={2}
                align="center"
                {...getLinkStyle("/explore")}
              >
                <Icon as={Search} boxSize={6} />
                <span style={{ whiteSpace: "nowrap" }}>ノウハウを探す</span>
              </HStack>
            </Link>

            <Link to="/community">
              <HStack
                as="span"
                gap={2}
                align="center"
                {...getLinkStyle("/community")}
              >
                <Icon as={Users} boxSize={6} />
                <span style={{ whiteSpace: "nowrap" }}>コミュニティ</span>
              </HStack>
            </Link>

            <Link to="/guide">
              <HStack
                as="span"
                gap={2}
                align="center"
                {...getLinkStyle("/guide")}
              >
                <Icon as={BookOpen} boxSize={6} />
                <span style={{ whiteSpace: "nowrap" }}>ご利用ガイド</span>
              </HStack>
            </Link>
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  );
}
