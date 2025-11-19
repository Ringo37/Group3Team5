import {
  Box,
  Container,
  Text,
  Button,
  Heading,
  VStack,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { Form, Link } from "react-router";

export default function Footer() {
  return (
    <Box
      as="footer"
      width="100%"
      bg="#16462bff"
      color="white"
      mt="auto"
      py={12}
    >
      <Container maxW="7xl">
        <VStack gap={10}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="xl" color="white" letterSpacing="wide">
              農ハウマッチング
            </Heading>
            <Text fontSize="md" color="gray.300" maxW="lg">
              農家と施設をつなぎ、新しい農業のかたちをつくる。
            </Text>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap={6}
            align="center"
            justify="center"
            w="full"
          >
            <HStack gap={4}>
              <Link to="/login">
                <Button
                  bg="green.500"
                  color="white"
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: "green.400" }}
                >
                  ログイン
                </Button>
              </Link>
              <Form action="/logout" method="post">
                <Button
                  bg="orange.400"
                  color="white"
                  borderRadius="full"
                  px={6}
                  _hover={{ bg: "orange.300" }}
                  type="submit"
                >
                  ログアウト
                </Button>
              </Form>
            </HStack>

            <HStack gap={4}>
              <Link to="/sample">
                <Button
                  variant="ghost"
                  color="gray.200"
                  _hover={{ bg: "whiteAlpha.200", color: "white" }}
                >
                  サンプル
                </Button>
              </Link>
              <Link to="/worklogformat">
                <Button
                  variant="ghost"
                  color="gray.200"
                  _hover={{ bg: "whiteAlpha.200", color: "white" }}
                >
                  日誌機能
                </Button>
              </Link>
            </HStack>
          </Flex>

          <Box pt={8} borderTopWidth={1} borderColor="whiteAlpha.300" w="full">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="center"
              align="center"
              gap={4}
            >
              <Text fontSize="sm" color="gray.400">
                &copy; {new Date().getFullYear()} Nou-How Matching. All rights
                reserved.
              </Text>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
