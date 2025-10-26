// app/routes/worklogformat.tsx
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Container,
  Textarea,
  Code,
  Button,
} from "@chakra-ui/react";
import type { StackProps } from "@chakra-ui/react";
import { useState } from "react";
import {
  Form as RouterForm,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
} from "react-router";

import {
  extractKeywordsApiExtractKeywordsPost,
  type ExtractKeywordsSuccess,
  type ExtractKeywordsError,
} from "~/api";
import { apiClient } from "~/lib/apiClient";

// Action 関数
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const text = formData.get("text") as string;
  const tags = formData.getAll("tags[]") as string[];

  if (!text) return { error: "作業内容を入力してください" };

  try {
    const { data, error } = await extractKeywordsApiExtractKeywordsPost({
      client: apiClient,
      body: { text, top_n: 10 },
    });

    if (error)
      return { apiError: "ネットワークまたはAPI接続に問題が発生しました。" };
    if (data.status === "error") {
      const errorData = data as ExtractKeywordsError;
      return {
        apiError: errorData.message || "キーワード抽出に失敗しました。",
      };
    }

    return { keywords: data as ExtractKeywordsSuccess, text, tags };
  } catch (e) {
    console.error("Unexpected Action Error:", e);
    return { apiError: "予期せぬエラーが発生しました。" };
  }
}

export default function WorkLogForm() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // タグ選択・解除
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack align="stretch" gap={6}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          作業ログキーワード抽出
        </Heading>

        {/* フォーム */}
        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg">
          <RouterForm method="post">
            {/* 型キャストで spacing / align の型エラー回避 */}
            <VStack gap={4} align="stretch" {...({} as StackProps)}>
              <Textarea
                name="text"
                placeholder="分析したい作業内容を入力してください"
                required
                size="lg"
                rows={10}
                defaultValue={actionData?.text ?? ""}
              />

              {/* 選択タグを hidden input として送信 */}
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags[]" value={tag} />
              ))}

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                width="full"
                loading={isSubmitting}
                loadingText="抽出中..."
              >
                キーワードを抽出
              </Button>
            </VStack>
          </RouterForm>
        </Box>

        {/* エラー表示 */}
        {(actionData?.error || actionData?.apiError) && (
          <Box p={3} bg="red.100" color="red.700" borderRadius="md">
            {actionData.error || actionData.apiError}
          </Box>
        )}

        {/* 抽出結果 */}
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

            <VStack align="stretch" gap={2} {...({} as StackProps)}>
              {actionData.keywords.keywords.map((item, index) => (
                <HStack
                  key={index}
                  p={3}
                  bg={selectedTags.includes(item.word) ? "teal.100" : "white"}
                  borderRadius="md"
                  shadow="sm"
                  borderWidth="1px"
                  justifyContent="space-between"
                  onClick={() => toggleTag(item.word)}
                  cursor="pointer"
                  {...({} as StackProps)}
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
