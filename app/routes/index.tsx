import { Button, HStack, VStack, Heading, Text, Box } from "@chakra-ui/react";
import { Form, Link } from "react-router";

import { ColorModeButton } from "~/components/ui/color-mode";

export function meta() {
  return [
    { title: "農ハウマッチング - 農家と未来をつなぐ" },
    {
      name: "description",
      content: "農家とハウスをマッチングして未来の農業を支えるプラットフォーム",
    },
  ];
}

export default function Index() {
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, green.100, yellow.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <VStack>
        <ColorModeButton />
        <Heading
          as="h1"
          size="2xl"
          color="green.700"
          textShadow="1px 1px 2px rgba(0,0,0,0.1)"
        >
          農ハウマッチング
        </Heading>

        <Text fontSize="lg" color="green.600" textAlign="center" maxW="lg">
          農家と施設をつなぎ、新しい農業のかたちをつくる。
        </Text>

        <HStack>
          <Link to={"/login"}>
            <Button
              bg="green.400"
              color="white"
              size="lg"
              px={8}
              borderRadius="full"
              _hover={{ bg: "green.500", transform: "scale(1.05)" }}
              boxShadow="md"
            >
              ログイン
            </Button>
          </Link>
          <Form action="/logout" method="post">
            <Button
              bg="orange.300"
              color="white"
              size="lg"
              px={8}
              borderRadius="full"
              _hover={{ bg: "orange.400", transform: "scale(1.05)" }}
              boxShadow="md"
              type="submit"
            >
              ログアウト
            </Button>
          </Form>
        </HStack>
        <Link to={"/sample"}>
          <Button
            bg="green.400"
            color="white"
            size="lg"
            px={8}
            borderRadius="full"
            _hover={{ bg: "green.500", transform: "scale(1.05)" }}
            boxShadow="md"
          >
            サンプル
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
