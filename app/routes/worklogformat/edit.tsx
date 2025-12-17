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
  SimpleGrid,
  createListCollection,
  Select,
  Portal,
} from "@chakra-ui/react";
import type { WeatherCondition } from "@prisma/client";
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


// 天気の選択肢
const WEATHER_OPTIONS = [
  { value: "SUNNY", label: "晴れ" },
  { value: "CLOUDY", label: "曇り" },
  { value: "RAINY", label: "雨" },
  { value: "SNOWY", label: "雪" },
  { value: "WINDY", label: "風" },
  { value: "FOGGY", label: "霧" },
  { value: "THUNDERSTORM", label: "雷雨" },
];

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
    if (!text) return { error: "入力必要", tags: currentTags, text, title };
    try {
      const { data } = await extractKeywordsApiExtractKeywordsPost({
        client: apiClient,
        body: { text, top_n: 50 },
      });
      if (!data || data.status === "error")
        return { apiError: "エラー", tags: currentTags, text, title };
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
      return { apiError: "エラー", tags: currentTags, text, title };
    }
  }

  // B. 更新処理
  const title = formData.get("title") as string;
  const workDetails = formData.get("text") as string;
  const dateString = formData.get("date") as string;
  const tags = formData.getAll("tags[]") as string[];

  const weatherString = formData.get("weather") as string;
  const tempStr = formData.get("temperature") as string;
  const humidityStr = formData.get("humidity") as string;
  const windStr = formData.get("windSpeed") as string;
  const precipStr = formData.get("precipitation") as string;

  if (!title || !workDetails) return { error: "必須項目不足" };

  const count = await prisma.workLog.count({
    where: { id: Number(params.id), userId: userId },
  });
  if (count === 0) throw new Response("権限なし", { status: 403 });

  const updateData: any = {
    title,
    workDetails,
    weather: weatherString ? (weatherString as WeatherCondition) : null,
    temperature: tempStr ? parseFloat(tempStr) : null,
    humidity: humidityStr ? parseFloat(humidityStr) : null,
    windSpeed: windStr ? parseFloat(windStr) : null,
    precipitation: precipStr ? parseFloat(precipStr) : null,
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

  // JST日付変換
  const [date, setDate] = useState(
    new Date(log.date).toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }),
  );

  // 環境データState
  const [weather, setWeather] = useState(log.weather ?? "");
  const [temperature, setTemperature] = useState(
    log.temperature?.toString() ?? "",
  );
  const [humidity, setHumidity] = useState(log.humidity?.toString() ?? "");
  const [windSpeed, setWindSpeed] = useState(log.windSpeed?.toString() ?? "");
  const [precipitation, setPrecipitation] = useState(
    log.precipitation?.toString() ?? "",
  );

  const weatherCollection = createListCollection({
    items: WEATHER_OPTIONS,
  });

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
              {/* 1. 作業日・天気エリア */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontWeight="bold" color="black" mb={2} as="label">
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
                  <Text fontWeight="bold" color="black" mb={2} as="label">
                    天気
                  </Text>
                  {/* worklogpostと同じSelect.Root構造 */}
                  <Select.Root
                    collection={weatherCollection}
                    size="lg"
                    value={[weather]}
                    onValueChange={(val: any) => {
                      if (typeof val === "string") setWeather(val);
                      else if (val.value && Array.isArray(val.value))
                        setWeather(val.value[0]);
                      else if (val.value) setWeather(val.value);
                    }}
                  >
                    <Select.HiddenSelect name="weather" />
                    <Select.Control>
                      <Select.Trigger bg="white" borderColor="gray.300">
                        <Select.ValueText
                          placeholder="選択してください"
                          color="black"
                        />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator color="black" />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content
                          bg="white"
                          color="black"
                          borderColor="gray.200"
                          borderWidth="1px"
                          zIndex={1500}
                        >
                          {weatherCollection.items.map((item) => (
                            <Select.Item
                              item={item}
                              key={item.value}
                              _hover={{ bg: "gray.100" }}
                              _highlighted={{ bg: "gray.100" }}
                              cursor="pointer"
                            >
                              {item.label}
                              <Select.ItemIndicator color="teal.500" />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>
              </SimpleGrid>

              {/* 2. 環境データ入力エリア */}
              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text fontWeight="bold" color="gray.700" mb={3} fontSize="sm">
                  環境データ
                </Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                  <Box>
                    <Text fontSize="xs" mb={1} color="gray.600">
                      気温 (℃)
                    </Text>
                    <Input
                      name="temperature"
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      bg="white"
                      color="black"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" mb={1} color="gray.600">
                      湿度 (%)
                    </Text>
                    <Input
                      name="humidity"
                      type="number"
                      step="1"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      bg="white"
                      color="black"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" mb={1} color="gray.600">
                      風速 (m/s)
                    </Text>
                    <Input
                      name="windSpeed"
                      type="number"
                      step="0.1"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(e.target.value)}
                      bg="white"
                      color="black"
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" mb={1} color="gray.600">
                      降水量 (mm)
                    </Text>
                    <Input
                      name="precipitation"
                      type="number"
                      step="0.5"
                      value={precipitation}
                      onChange={(e) => setPrecipitation(e.target.value)}
                      bg="white"
                      color="black"
                      borderColor="gray.300"
                    />
                  </Box>
                </SimpleGrid>
              </Box>

              {/* 3. 表題 */}
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

              {/* 4. 作業内容 */}
              <Box>
                <Text fontWeight="bold" color="black" mb={2} as="label">
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

              {/* タグ情報（hidden） */}
              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="tags[]" value={tag} />
              ))}

              {/* キーワード抽出ボタン */}
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

              {/* 抽出候補表示 */}
              {actionData?.keywords && (
                <Box
                  bg="gray.50"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" mb={2} color="gray.600">
                    抽出候補（クリックで追加）:
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

              {/* タグ編集エリア */}
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

              {/* 更新ボタン */}
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
