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
  // FormControl, FormLabel は削除
} from "@chakra-ui/react";
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
} from "~/api";
import { apiClient } from "~/lib/apiClient";
import { farmKeyword } from "~/lib/farmKeyword";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const text = (formData.get("text") as string) ?? "";
  const tags = formData.getAll("tags[]") as string[];
  if (!text) return { error: "作業内容を入力してください" };
  try {
    const { data, error } = await extractKeywordsApiExtractKeywordsPost({
      client: apiClient,
      body: { text, top_n: 50 },
    });
    if (error) return { apiError: "通信エラー" };
    if (data.status === "error") return { apiError: "抽出エラー" };
    const apiKeywords = (data as ExtractKeywordsSuccess).keywords;
    const filteredKeywords = apiKeywords.filter((k) =>
      Array.from(farmKeyword).some((keyword) =>
        k.word.trim().toLowerCase().includes(keyword.trim().toLowerCase()),
      ),
    );
    return { keywords: { keywords: filteredKeywords }, text, tags };
  } catch (e) {
    console.error(e);
    return { apiError: "予期せぬエラー" };
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
  const [title, setTitle] = useState("");
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

    setPosting(true);
    const url = "/worklogformat/submit";

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("workDetails", textValue);
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

        {/* 表題入力欄（BoxとTextで書き換え） */}
        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg="white">
          <VStack align="stretch" gap={2}>
            <Text fontWeight="bold" color="black" as="label">
              表題{" "}
              <Text as="span" color="red.500">
                *
              </Text>
            </Text>
            <Input
              placeholder="例：トマトの定植"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="lg"
              color="black"
              bg="white"
              _placeholder={{ color: "gray.500" }}
            />
          </VStack>
        </Box>

        <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg="white">
          <RouterForm method="post">
            <VStack gap={4} align="stretch">
              <Textarea
                name="text"
                placeholder="作業内容を入力..."
                required
                size="lg"
                rows={10}
                defaultValue={actionData?.text ?? ""}
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags[]" value={tag} />
              ))}
              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                loading={isSubmitting}
              >
                キーワードを抽出
              </Button>
            </VStack>
          </RouterForm>
        </Box>

        {(actionData?.keywords ||
          selectedTags.length > 0 ||
          actionData?.text) && (
          <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4} color="gray.700">
              タグ編集
            </Heading>
            <VStack align="stretch" gap={2}>
              {actionData?.keywords?.keywords.map((item, index) => (
                <HStack
                  key={index}
                  p={3}
                  bg={selectedTags.includes(item.word) ? "teal.100" : "gray.50"}
                  borderRadius="md"
                  shadow="sm"
                  onClick={() => toggleTag(item.word)}
                  cursor="pointer"
                >
                  <Text fontWeight="bold" color="black">
                    {index + 1}. {item.word}
                  </Text>
                </HStack>
              ))}

              <HStack mt={4}>
                <Input
                  placeholder="タグ追加..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                />
                <Button onClick={handleAddTag}>追加 ＋</Button>
              </HStack>

              <HStack wrap="wrap" mt={2}>
                {selectedTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    bg="teal.100"
                    color="black"
                    borderWidth="1px"
                    borderColor="teal.400"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Button>
                ))}
              </HStack>

              <Button
                mt={4}
                colorScheme="blue"
                loading={posting}
                onClick={handlePostWorklog}
              >
                日誌を投稿する
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
