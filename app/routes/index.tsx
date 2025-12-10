import {
  Button,
  Heading,
  Text,
  Box,
  Image,
  Flex,
  Input,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";

import Footer from "~/components/fotter";
import { PostCard } from "~/components/postCard";
import { getKnowHows } from "~/models/knowhow.server";

export function meta() {
  return [
    { title: "農ハウマッチング - 農家と未来をつなぐ" },
    {
      name: "description",
      content: "農家とハウスをマッチングして未来の農業を支えるプラットフォーム",
    },
  ];
}

export async function loader() {
  const knowhows = await getKnowHows();
  return { knowhows };
}

export default function Index() {
  const { knowhows } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(`/explore?search=${encodeURIComponent(keyword)}`);
    }
  };
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
          zIndex={1}
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7))",
          }}
        />

        <Flex
          position="relative"
          height="100%"
          alignItems="center"
          justifyContent="center"
          direction="column"
          p={6}
          zIndex={2}
          textAlign="center"
          gap={8}
        >
          <VStack gap={4} maxW="4xl">
            <Text
              color="green.300"
              fontWeight="bold"
              fontSize={{ base: "lg", md: "2xl" }}
              letterSpacing="0.2em"
              textShadow="0px 2px 4px rgba(0,0,0,0.8)"
            >
              - 農家と未来をつなぐ -
            </Text>
            <Heading
              as="h1"
              color="white"
              fontWeight="extrabold"
              fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
              lineHeight="1.4"
              textShadow="0px 2px 8px rgba(0,0,0,0.8)"
            >
              農家とハウスをマッチングして
              <br />
              未来の農業を支えるプラットフォーム
            </Heading>
          </VStack>

          <Box width={{ base: "95%", md: "600px" }} position="relative">
            <Box
              position="absolute"
              top="50%"
              left="1.5rem"
              transform="translateY(-50%)"
              zIndex={2}
              pointerEvents="none"
            >
              <Search size={20} color="#718096" />
            </Box>
            <Input
              type="search"
              placeholder="キーワードでノウハウを検索..."
              borderRadius="full"
              bg="white"
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              border="none"
              height={{ base: "3rem", md: "3rem" }}
              fontSize="lg"
              pl="3.5rem"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              _focus={{
                boxShadow: "0 0 0 3px rgba(0, 146, 69, 0.4)",
                outline: "none",
              }}
              onChange={(e) => setKeyword(e.target.value)}
              value={keyword}
              onKeyDown={handleKeyDown}
            />
          </Box>
        </Flex>
      </Box>

      <Box flex="1" width="100%" pb={20}>
        <Box
          mx="auto"
          maxWidth="7xl"
          width={{ base: "95%", md: "90%", lg: "70%" }}
          px={0}
        >
          <Box mt={16} mb={10}>
            <Box
              borderBottomWidth="1px"
              borderColor="gray.300"
              mb={10}
              width="100%"
            >
              <Heading
                as="h3"
                size="lg"
                display="inline-block"
                pb={2}
                borderBottomWidth="3px"
                borderColor="#009245"
                marginBottom="-2px"
              >
                最新の投稿
              </Heading>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              {knowhows.map((knowhow) => (
                <PostCard key={knowhow.id} knowhow={knowhow} />
              ))}
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
