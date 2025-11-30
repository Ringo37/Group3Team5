// app/routes/worklog/complete.tsx
import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react";
import { Link } from "react-router";

export default function Complete() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <VStack gap={6}>
        <Heading as="h2" size="xl" color="teal.600">
          投稿が完了しました！
        </Heading>
        <Text color="gray.700">
          ご投稿ありがとうございました。日誌は正常に保存されました。
        </Text>
        <Link to="/">
          <Button
            colorScheme="teal"
            size="md"
            _hover={{ transform: "scale(1.05)" }}
          >
            トップページに戻る
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
