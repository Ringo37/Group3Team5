import {
  Button,
  HStack,
  Heading,
  Text,
  Box,
  Image,
  Flex,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { Link } from "react-router";

import Footer from "~/components/fotter";
export function meta() {
  return [
    { title: "農ハウマッチング - 農家と未来をつなぐ" },
    {
      name: "description",
      content: "農家とハウスをマッチングして未来の農業を支えるプラットフォーム",
    },
  ];
}

const PostCard = () => {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      _hover={{ boxShadow: "md", transform: "translateY(-4px)" }}
      transition="all 0.2s"
    >
      <Image
        src="https://via.placeholder.com/400x250"
        alt="投稿の画像"
        height="200px"
        width="100%"
        objectFit="cover"
      />
      <Box p={5}>
        <Text fontWeight="bold" fontSize="lg" lineClamp={2} mb={2}>
          ここに投稿のタイトルが入ります
        </Text>
        <Text fontSize="sm" color="gray.600" lineClamp={3} mb={4}>
          これは投稿内容のプレビューです。最新のノウハウや農業日誌の一部がここに表示されます。
        </Text>
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.500">
            2025年11月11日
          </Text>
          <Text fontSize="xs" color="teal.500" fontWeight="medium">
            カテゴリ名
          </Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default function Index() {
  return (
    <Flex direction="column" minH="100vh" bg="#fdf8f3">
      <Box position="relative" height="60vh" width="100%" overflow="hidden">
        <Image
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="bottom"
          src="/img/main.jpg"
          alt="農場の背景"
          zIndex={0}
        />

        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={0}
          style={{
            background: "rgba(0, 0, 0, 0.5)",
          }}
        />

        <Flex
          position="relative"
          height="100%"
          alignItems="center"
          justifyContent="center"
          p={6}
          zIndex={1}
        >
          <Box
            position="relative"
            width={{ base: "90%", md: "60%" }}
            maxW="600px"
          >
            <Box
              position="absolute"
              top="50%"
              style={{ transform: "translateY(-50%)", left: "1.2rem" }}
              zIndex={2}
              pointerEvents="none"
            >
              <Search size={20} color="gray" />
            </Box>
            <Input
              type="search"
              placeholder="キーワードでノウハウを検索..."
              borderRadius="full"
              bg="gray.50"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              borderColor="gray.300"
              height="3.5rem"
              boxShadow="lg"
              style={{ paddingLeft: "3.5rem" }}
            />
          </Box>
        </Flex>
      </Box>

      <Box flex="1" width="100%" pb={20}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }}>
          <Box py={16} textAlign="center">
            <Text
              color="#009245"
              fontWeight="extrabold"
              fontSize={{ base: "xl", md: "3xl" }}
              mb={3}
              style={{ letterSpacing: "0.15em" }}
            >
              - 農家と未来をつなぐ -
            </Text>
            <Heading
              fontSize={{ base: "xl", md: "3xl", lg: "4xl" }}
              as="h2"
              size="xl"
              color="gray.700"
              lineHeight="1.6"
            >
              農家とハウスをマッチングして
              <br />
              未来の農業を支えるプラットフォーム
            </Heading>
          </Box>

          <Box mb={10}>
            <Flex justify="center" mb={10}>
              <Heading
                as="h3"
                size="lg"
                color="#009245"
                bg="white"
                px={10}
                py={3}
                borderRadius="full"
                boxShadow="sm"
                textAlign="center"
                style={{
                  border: "1px solid #e2e8f0",
                  display: "inline-block",
                }}
              >
                最新の投稿
              </Heading>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              <PostCard />
              <PostCard />
              <PostCard />
              <PostCard />
              <PostCard />
              <PostCard />
            </SimpleGrid>
          </Box>

          <Flex justify="center" mt={8}>
            <Link to="/explore">
              <Button
                variant="outline"
                colorScheme="green"
                color="#009245"
                borderColor="#009245"
                borderRadius="full"
                px={8}
                _hover={{ bg: "#009245", color: "white" }}
              >
                もっと見る
              </Button>
            </Link>
          </Flex>
        </Box>
      </Box>
      <Box mb={8} p={4} bg="gray.50" borderRadius="md" textAlign="center">
        <Text fontSize="sm" color="gray.500" mb={4}>
          ※ 開発用リンク（後で削除予定）
        </Text>
        <Flex gap={4} justify="center" wrap="wrap">
          <Link to={"/sample"}>
            <Button size="sm" colorScheme="green" variant="outline">
              サンプル
            </Button>
          </Link>
          <Link to="/worklogformat">
            <Button size="sm" colorScheme="teal" variant="outline">
              日誌
            </Button>
          </Link>
          <Link to="/edit-interest-tags">
            <Button size="sm" colorScheme="blue" variant="outline">
              興味を登録
            </Button>
          </Link>
        </Flex>
      </Box>
      <Footer />
    </Flex>
  );
}
