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
  Input,
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

// Action 関数（既存：抽出用）
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const text = (formData.get("text") as string) ?? "";
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

  // selectedTags: 自動抽出で選択したもの／手動追加したものの集合
  const [selectedTags, setSelectedTags] = useState<string[]>(
    actionData?.tags ?? [],
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [postMessage, setPostMessage] = useState<string | null>(null);

  // 抽出結果の項目をクリックで選択・解除（既存）
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // 手動タグを追加する（＋追加ボタン）
  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (!tag) return;
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setNewTagInput("");
  };

  // 選択済みタグを削除（×ボタン）
  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePostWorklog = async () => {
    const textarea = document.querySelector(
      'textarea[name="text"]',
    ) as HTMLTextAreaElement | null;
    const textValue = textarea ? textarea.value : (actionData?.text ?? "");

    if (!textValue.trim()) {
      setPostMessage("投稿する日誌を入力してください。");
      return;
    }

    setPosting(true);
    setPostMessage(null);

    // 送信先URL — チームで決めた API があれば変更してください
    const url = "/worklogs"; // 例: FastAPI に /worklogs を作るならここに実装

    try {
      // まずは fetch を使って JSON POST（クロスオリジンや CORS に注意）
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textValue, tags: selectedTags }),
      });

      if (res.ok) {
        setPostMessage("投稿に成功しました。");
      } else {
        // 受け口が無かったりエラーなら、詳細を console に出す
        const text = await res.text().catch(() => "");
        console.warn("投稿サーバ応答:", res.status, text);
        // フォールバック: コンソール出力してユーザーに通知
        console.log("投稿データ (fallback):", {
          text: textValue,
          tags: selectedTags,
        });
        setPostMessage("サーバ応答がエラーでした（" + res.status + "）。");
      }
    } catch (e) {
      console.error("投稿失敗:", e);
      // フォールバック: ローカルでの保存や通知
      console.log("投稿データ (fallback):", {
        text: textValue,
        tags: selectedTags,
      });
      setPostMessage(
        "投稿に失敗しました（ネットワークまたはサーバ）。コンソール参照。",
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack align="stretch" gap={6}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          作業ログキーワード抽出
        </Heading>

        {/* 抽出フォーム（既存の RouterForm をそのまま残す） */}
        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg">
          <RouterForm method="post">
            <VStack gap={4} align="stretch" {...({} as StackProps)}>
              <Textarea
                name="text"
                placeholder="分析したい作業内容を入力してください"
                required
                size="lg"
                rows={10}
                defaultValue={actionData?.text ?? ""}
              />

              {/* 選択タグを hidden input として送信（action に渡る） */}
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

        {/* 抽出結果 + 手動タグ追加 + 選択済みタグ表示 */}
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
              {/* 抽出キーワードリスト（クリックで選択/解除） */}
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

              {/* 手動タグ追加フォーム（自動抽出欄の下） */}
              <HStack mt={4} gap={2}>
                <Input
                  placeholder="新しいタグを追加..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  bg="white"
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                />
                <Button colorScheme="green" onClick={handleAddTag}>
                  ＋追加
                </Button>
              </HStack>

              {/* 選択済みタグの一覧（削除ボタン付き） */}
              <HStack wrap="wrap" mt={2} gap={2}>
                {selectedTags.length === 0 && (
                  <Text color="gray.500">選択中のタグはありません</Text>
                )}
                {selectedTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    color="black"
                    borderColor={"teal.400"}
                    _hover={{ bg: "teal.100" }}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Button>
                ))}
              </HStack>

              {/* 投稿ボタン（フロントで POST /worklogs を呼ぶ） */}
              <HStack mt={4} gap={3}>
                <Button
                  colorScheme="blue"
                  onClick={handlePostWorklog}
                  loading={posting}
                >
                  投稿
                </Button>
                {/* 投稿結果メッセージ */}
                {postMessage && <Text color="gray.600">{postMessage}</Text>}
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
