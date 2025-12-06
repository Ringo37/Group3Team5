import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Container,
  Textarea,
  Button,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  Form as RouterForm,
  useActionData,
  useNavigation,
  Link,
  type ActionFunctionArgs,
} from "react-router";

import {
  extractKeywordsApiExtractKeywordsPost,
  type ExtractKeywordsSuccess,
} from "~/api";
import { farmKeyword } from "~/data/farmKeyword";
import { apiClient } from "~/lib/apiClient";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const text = (formData.get("text") as string) ?? "";
  const title = (formData.get("title") as string) ?? "";
  const tags = formData.getAll("tags[]") as string[];

  if (!text) return { error: "作業内容を入力してください", title, text, tags };

  try {
    const { data, error } = await extractKeywordsApiExtractKeywordsPost({
      client: apiClient,
      body: { text, top_n: 50 },
    });
    if (error) return { apiError: "通信エラー", title, text, tags };
    if (data.status === "error")
      return { apiError: "抽出エラー", title, text, tags };

    const apiKeywords = (data as ExtractKeywordsSuccess).keywords;
    const filteredKeywords = apiKeywords.filter((k) =>
      Array.from(farmKeyword).some((keyword) =>
        k.word.trim().toLowerCase().includes(keyword.trim().toLowerCase()),
      ),
    );
    return { keywords: { keywords: filteredKeywords }, title, text, tags };
  } catch (e) {
    console.error(e);
    return { apiError: "予期せぬエラー", title, text, tags };
  }
}

export default function WorkLogForm() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedTags, setSelectedTags] = useState<string[]>(
    actionData?.tags ?? [],
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [title, setTitle] = useState(actionData?.title ?? "");
  // ★追加: 日付の初期値を今日に設定
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [posting, setPosting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };
  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (tag && !selectedTags.includes(tag))
      setSelectedTags((prev) => [...prev, tag]);
    setNewTagInput("");
  };
  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePostWorklog = async () => {
    const textarea = document.querySelector(
      'textarea[name="text"]',
    ) as HTMLTextAreaElement | null;
    const textValue = textarea ? textarea.value : (actionData?.text ?? "");

    if (!textValue.trim()) {
      alert("内容を入力してください");
      return;
    }
    if (!title.trim()) {
      alert("表題を入力してください");
      return;
    }
    if (!date) {
      alert("日付を入力してください");
      return;
    }

    setPosting(true);

    // ★リンク先: 正しい submit API へ
    const url = "/worklogformat/worklogpost/submit";

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("workDetails", textValue);
      formData.append("date", date); // 日付も送信
      selectedTags.forEach((tag) => formData.append("tags[]", tag));

      const res = await fetch(url, { method: "POST", body: formData });
      if (res.redirected) window.location.href = res.url;
      else if (!res.ok) alert("投稿失敗");
    } catch (e) {
      console.error(e);
      alert("通信エラー");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack align="stretch" gap={6}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          日誌作成
        </Heading>

        <Box textAlign="left">
          {/* ★修正: 戻る先を worklogformat に */}
          <Link to="/worklogformat">
            <Button
              variant="outline"
              size="sm"
              color="gray.600"
              borderColor="gray.300"
            >
              キャンセルして戻る
            </Button>
          </Link>
        </Box>

        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg="white">
          <RouterForm method="post">
            <VStack gap={4} align="stretch">
              {/* ★日付入力欄 */}
              <Box>
                <Text fontWeight="bold" color="black" mb={2} as="label">
                  作業日{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="lg"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                />
              </Box>

              <Box>
                <Text fontWeight="bold" color="black" mb={2} as="label">
                  表題{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <Input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size="lg"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                />
              </Box>
              <Box>
                <Text fontWeight="bold" color="black" mb={2} as="label">
                  作業内容{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <Textarea
                  name="text"
                  placeholder="作業内容を入力..."
                  required
                  size="lg"
                  rows={10}
                  defaultValue={actionData?.text ?? ""}
                  color="black"
                  borderColor="gray.300"
                />
              </Box>
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags[]" value={tag} />
              ))}
              <Button
                type="submit"
                colorScheme="teal"
                variant="outline"
                width="full"
                loading={isSubmitting}
              >
                キーワードを抽出
              </Button>

              {actionData?.keywords && (
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" mb={2} color="gray.600">
                    抽出候補:
                  </Text>
                  <HStack wrap="wrap" gap={2}>
                    {actionData.keywords.keywords.map(
                      (item: any, index: number) => (
                        <Box
                          key={index}
                          p={2}
                          bg={
                            selectedTags.includes(item.word)
                              ? "teal.100"
                              : "white"
                          }
                          borderWidth="1px"
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => toggleTag(item.word)}
                        >
                          <Text fontWeight="bold" color="black" fontSize="sm">
                            {item.word}
                          </Text>
                        </Box>
                      ),
                    )}
                  </HStack>
                </Box>
              )}

              <Box>
                <Text fontWeight="bold" color="black" mb={2}>
                  選択中のタグ
                </Text>
                <HStack wrap="wrap" mb={2} gap={2}>
                  {selectedTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      bg="teal.100"
                      color="black"
                      borderWidth="1px"
                      borderColor="teal.400"
                      onClick={() => handleRemoveTag(tag)}
                      _hover={{ bg: "teal.200" }}
                    >
                      {tag} ×
                    </Button>
                  ))}
                </HStack>
                <HStack>
                  <Input
                    placeholder="手動追加..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    size="sm"
                    bg="white"
                    color="black"
                    width="200px"
                    borderColor="gray.300"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    bg="gray.100"
                    color="black"
                    borderWidth="1px"
                    borderColor="gray.300"
                  >
                    ＋
                  </Button>
                </HStack>
              </Box>

              <Button
                mt={4}
                type="button"
                colorScheme="blue"
                size="lg"
                loading={posting}
                onClick={handlePostWorklog}
              >
                日誌を投稿する
              </Button>
            </VStack>
          </RouterForm>
        </Box>
      </VStack>
    </Container>
  );
}
