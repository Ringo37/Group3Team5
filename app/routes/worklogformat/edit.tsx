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
  useLoaderData,
  redirect,
  Link,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import {
  extractKeywordsApiExtractKeywordsPost,
  type ExtractKeywordsSuccess,
} from "~/api";
import { farmKeyword } from "~/data/farmKeyword";
import { apiClient } from "~/lib/apiClient";
import { prisma } from "~/lib/prisma";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const log = await prisma.workLog.findFirst({
    where: { id: Number(params.id), userId: userId },
    include: { tags: true },
  });
  if (!log)
    throw new Response("権限がないか、日誌が存在しません", { status: 403 });
  return { log };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  // A. 抽出処理
  if (formData.get("intent") === "extract") {
    const text = (formData.get("text") as string) ?? "";
    const title = (formData.get("title") as string) ?? "";
    const currentTags = formData.getAll("tags[]") as string[];
    if (!text)
      return {
        error: "作業内容を入力してください",
        tags: currentTags,
        text,
        title,
      };
    try {
      const { data, error } = await extractKeywordsApiExtractKeywordsPost({
        client: apiClient,
        body: { text, top_n: 50 },
      });
      if (error)
        return { apiError: "通信エラー", tags: currentTags, text, title };
      const apiKeywords = (data as ExtractKeywordsSuccess).keywords;
      const filteredKeywords = apiKeywords.filter((k) =>
        Array.from(farmKeyword).some((keyword) =>
          k.word.trim().toLowerCase().includes(keyword.trim().toLowerCase()),
        ),
      );
      return {
        keywords: { keywords: filteredKeywords },
        text,
        title,
        tags: currentTags,
      };
    } catch (e) {
      console.error(e);
      return { apiError: "エラー発生", tags: currentTags, text, title };
    }
  }

  // B. 更新処理
  const title = formData.get("title") as string;
  const workDetails = formData.get("text") as string;
  const dateString = formData.get("date") as string;
  const tags = formData.getAll("tags[]") as string[];

  if (!title || !workDetails) return { error: "必須項目が不足しています" };

  const count = await prisma.workLog.count({
    where: { id: Number(params.id), userId: userId },
  });
  if (count === 0) throw new Response("権限がありません", { status: 403 });

  const updateData: any = {
    title,
    workDetails,
    tags: {
      set: [],
      connectOrCreate: tags.map((t) => ({
        where: { tag: t },
        create: { tag: t },
      })),
    },
  };
  if (dateString) {
    updateData.date = new Date(dateString);
  }

  await prisma.workLog.update({
    where: { id: Number(params.id) },
    data: updateData,
  });

  // ★修正: リダイレクト先を worklogformat に変更
  return redirect(`/worklogformat/${params.id}?updated=true`);
}

export default function WorkLogEdit() {
  const { log } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [title, setTitle] = useState(actionData?.title ?? log.title);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    actionData?.tags ?? log.tags.map((t: any) => t.tag),
  );
  const [newTagInput, setNewTagInput] = useState("");
  // DBの日付を編集用（YYYY-MM-DD）に変換して初期値にする
  const [date, setDate] = useState(
    new Date(log.date).toISOString().split("T")[0],
  );

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

  return (
    <Container maxW="container.md" py={10}>
      <VStack align="stretch" gap={6}>
        <Heading as="h1" size="xl" textAlign="center" color="teal.600">
          日誌の編集
        </Heading>

        <Box textAlign="left">
          {/* ★修正: 戻る先を変更 */}
          <Link to={`/worklogformat/${log.id}`}>
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
              <Box>
                <Text fontWeight="bold" color="black" mb={2}>
                  作業日
                </Text>
                <Input
                  type="date"
                  name="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  size="lg"
                  color="black"
                  bg="white"
                  borderColor="gray.300"
                />
              </Box>
              <Box>
                <Text fontWeight="bold" color="black" mb={2}>
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
                <Text fontWeight="bold" color="black" mb={2}>
                  作業内容{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>
                <Textarea
                  name="text"
                  defaultValue={actionData?.text ?? log.workDetails}
                  bg="white"
                  color="black"
                  rows={8}
                  borderColor="gray.300"
                />
              </Box>
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags[]" value={tag} />
              ))}
              <Button
                type="submit"
                name="intent"
                value="extract"
                colorScheme="teal"
                variant="outline"
                size="sm"
                loading={isSubmitting}
              >
                キーワードを再抽出
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
                type="submit"
                name="intent"
                value="update"
                colorScheme="blue"
                size="lg"
                loading={isSubmitting}
              >
                変更を保存する
              </Button>
            </VStack>
          </RouterForm>
        </Box>
      </VStack>
    </Container>
  );
}
