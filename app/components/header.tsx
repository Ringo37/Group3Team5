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
import { Home, SquarePen, Search, BookOpen } from "lucide-react";
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

      paddingBottom: { base: "6px", md: "14px" },
      marginBottom: "-1.5px",

      fontWeight: "medium" as const,
      fontSize: { base: "10px", sm: "sm", md: "md" },
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
        width="100%"
        maxWidth="5xl"
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
      >
        <Flex
          align="center"
          direction={{ base: user ? "row" : "column", md: "row" }}
          justify="space-between"
          paddingTop={{ base: 2, md: 4 }}
          paddingBottom={2}
          width="100%"
          gap={{ base: 0, md: 4 }}
        >
          <HStack
            width={user ? "auto" : { base: "100%", md: "auto" }}
            justify={user ? "flex-start" : { base: "center", md: "flex-start" }}
          >
            <Link to="/">
              <HStack gap={{ base: 2, md: 3 }} align="center">
                <Image
                  src="/favicon.svg"
                  alt="農ハウ ロゴ"
                  height={{ base: "50px", md: "75px" }}
                  width="auto"
                  objectFit="contain"
                />
                <Box
                  fontSize={{ base: "xl", md: "3xl" }}
                  fontWeight="bold"
                  color="#009570"
                >
                  農ハウマッチング
                </Box>
              </HStack>
            </Link>
          </HStack>

          <HStack
            align="center"
            width={user ? "auto" : { base: "100%", md: "auto" }}
            justify={user ? "flex-end" : "center"}
            mr={user ? { base: 0, md: 50 } : 0}
          >
            {user ? (
              <Menu.Root>
                <Menu.Trigger _focus={{ borderRadius: "full" }}>
                  <AvatarGroup>
                    <Avatar.Root size={{ base: "sm", md: "md" }}>
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
              <HStack
                gap={4}
                width={{ base: "100%", md: "auto" }}
                justify="center"
              >
                <Link to="/login" style={{ width: "fit-content" }}>
                  <Button
                    fontSize={{ base: "xs", md: "sm" }}
                    size={{ base: "xs", md: "md" }}
                    width={{ base: "140px", md: "120px" }}
                    bg="#FF7B00"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "#E66F00" }}
                  >
                    ログイン
                  </Button>
                </Link>
                <Link to="/join">
                  <Button
                    fontSize={{ base: "xs", md: "sm" }}
                    size={{ base: "xs", md: "md" }}
                    width={{ base: "140px", md: "120px" }}
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
        </Flex>
        <Flex
          as="nav"
          align="center"
          justify="center"
          width="100%"
          px={{ base: 1, md: 0 }}
        >
          <HStack gap={{ base: 2, sm: 6, md: 12, lg: 16 }}>
            <Link to="/">
              <HStack
                as="span"
                gap={{ base: 1, md: 2 }}
                align="center"
                {...getLinkStyle("/")}
              >
                <Icon as={Home} boxSize={{ base: 4, md: 6 }} />
                <span style={{ whiteSpace: "nowrap" }}>ホーム</span>
              </HStack>
            </Link>

            <Link to="/worklogformat/worklogpost">
              <HStack
                as="span"
                gap={{ base: 1, md: 2 }}
                align="center"
                {...getLinkStyle("/worklogformat/worklogpost")}
              >
                <Icon as={SquarePen} boxSize={{ base: 4, md: 6 }} />
                <span style={{ whiteSpace: "nowrap" }}>日誌を作成する</span>
              </HStack>
            </Link>

            <Link to="/explore">
              <HStack
                as="span"
                gap={{ base: 1, md: 2 }}
                align="center"
                {...getLinkStyle("/explore")}
              >
                <Icon as={Search} boxSize={{ base: 4, md: 6 }} />
                <span style={{ whiteSpace: "nowrap" }}>ノウハウを探す</span>
              </HStack>
            </Link>

            <Link to="/guide">
              <HStack
                as="span"
                gap={{ base: 1, md: 2 }}
                align="center"
                {...getLinkStyle("/guide")}
              >
                <Icon as={BookOpen} boxSize={{ base: 4, md: 6 }} />
                <span style={{ whiteSpace: "nowrap" }}>ご利用ガイド</span>
              </HStack>
            </Link>
          </HStack>
        </Flex>
      </Flex>
    </Flex>
  );
}
