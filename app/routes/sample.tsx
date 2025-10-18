import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Text,
  Spinner,
  Container,
  Textarea,
  Code,
} from "@chakra-ui/react";
import {
  Form as RouterForm,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
} from "react-router";

import {
  extractKeywordsApiExtractKeywordsPost,
  type ExtractKeywordsSuccess,
  type ExtractKeywordsError,
} from "~/api";
import { apiClient } from "~/lib/apiClient";

// Loader 関数
export async function loader() {
  const sample =
    "今日はナスとトマトの支柱を立て直した。梅雨が明けて雨が少ないせいか、土が硬くて少し作業しづらかった。トマトの実は順調に色づいており、ナスも良いサイズに育っている。雑草も多く、少し取り残した部分が気になるが、夕方の風が心地よく、汗をかいた体に涼しい。明日は水やりを重点的に行う予定。";
  return { sample };
}

// Action 関数
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // フォームデータの検証
  const text = formData.get("text") as string;

  try {
    const { data, error } = await extractKeywordsApiExtractKeywordsPost({
      client: apiClient,
      body: { text, top_n: 10 },
    });

    if (error) {
      console.error("API Error (Client/Network):", error);
      return { apiError: "ネットワークまたはAPI接続に問題が発生しました。" };
    }

    if (data.status === "error") {
      console.error("API Error (Server):", data);
      const errorData = data as ExtractKeywordsError;
      return {
        apiError: errorData.message || "キーワード抽出に失敗しました。",
      };
    }

    // 成功
    return { keywords: data as ExtractKeywordsSuccess };
  } catch (e) {
    console.error("Unexpected Action Error:", e);
  }
}

export default function Sample() {
  const { sample } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Container maxW="container.md" py={10}>
      <VStack align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          キーワード抽出
        </Heading>

        {/* --- フォーム --- */}
        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg">
          <RouterForm method="post">
            <VStack>
              <Textarea
                name="text"
                placeholder="分析したい文章を入力してください"
                required
                size="lg"
                rows={10}
                defaultValue={sample}
              />
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                width="full"
                spinner={<Spinner size="sm" />}
                loadingText="抽出中..."
              >
                キーワードを抽出
              </Button>
            </VStack>
          </RouterForm>
        </Box>

        {/* --- 結果表示 --- */}
        {actionData?.keywords && (
          <Box
            p={6}
            shadow="lg"
            borderWidth="1px"
            borderRadius="lg"
            bg="gray.50"
          >
            <Heading as="h2" size="md" mb={4} color="gray.700">
              抽出結果
            </Heading>

            <VStack align="stretch">
              {actionData.keywords.keywords.map((item, index) => (
                <HStack
                  key={index}
                  p={3}
                  bg="white"
                  borderRadius="md"
                  shadow="sm"
                  borderWidth="1px"
                  justifyContent="space-between"
                >
                  <Text fontWeight="bold" color="teal.600">
                    {index + 1}.
                  </Text>
                  <Text flex="1" ml={2} color="gray.800">
                    {item.word}
                  </Text>
                  <Code colorScheme="purple">{item.count}回</Code>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
