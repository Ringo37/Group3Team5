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
  createListCollection,
  Select,
  Portal,
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
import Footer from "~/components/fotter";
import { farmKeyword } from "~/data/farmKeyword";
import { apiClient } from "~/lib/apiClient";
import { getCurrentPosition } from "~/utils/getPosition.client";
import { fetchCurrentWeather } from "~/utils/getWeather";

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
  const [date, setDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
  });

  const [weather, setWeather] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [precipitation, setPrecipitation] = useState("");

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [posting, setPosting] = useState(false);

  const weatherCollection = createListCollection({
    items: WEATHER_OPTIONS,
  });

  const handleAutoFillWeather = async () => {
    setLoadingWeather(true);
    try {
      const pos = await getCurrentPosition();
      const data = await fetchCurrentWeather(
        pos.coords.latitude,
        pos.coords.longitude,
      );
      setTemperature(String(data.temperature));
      setHumidity(String(data.humidity));
      setWeather(data.weather);
    } catch (error) {
      console.error(error);
      alert("天気の取得に失敗しました");
    } finally {
      setLoadingWeather(false);
    }
  };

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
      alert("日付を選択してください");
      return;
    }

    setPosting(true);
    const url = "/worklogformat/worklogpost/submit";

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("workDetails", textValue);
      formData.append("date", date);

      if (weather) formData.append("weather", weather);
      if (temperature) formData.append("temperature", temperature);
      if (humidity) formData.append("humidity", humidity);
      if (windSpeed) formData.append("windSpeed", windSpeed);
      if (precipitation) formData.append("precipitation", precipitation);

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
    <Box bg="#fdf8f3" minH="100vh" w="full">
      <Box
        mx="auto"
        maxWidth="7xl"
        width={{ base: "95%", md: "90%", lg: "65%" }}
        px={0}
      >
        <Container maxW="container.md" py={10}>
          <VStack align="stretch" gap={6}>
            <Heading
              as="h1"
              size="2xl"
              textAlign="center"
              mb={5}
              lineHeight="1.2"
            >
              日誌作成
            </Heading>

            <Box
              p={12}
              pt={12}
              shadow="lg"
              borderWidth="1px"
              borderRadius="lg"
              bg="white"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="20px"
                left="0"
                width="30px"
                height="8px"
                bg="#009245"
              />
              <RouterForm method="post">
                <VStack gap={4} align="stretch">
                  {/* 1. 作業日 */}
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

                  {/* 2. 表題 */}
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

                  {/* 3. 作業内容 */}
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
                              <Text
                                fontWeight="bold"
                                color="black"
                                fontSize="sm"
                              >
                                {item.word}
                              </Text>
                            </Box>
                          ),
                        )}
                      </HStack>
                    </Box>
                  )}

                  {/* 4. タグ編集 */}
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

                  {/* 5. 天気情報 (画像の通り一番下に配置) */}
                  <Box>
                    <Text fontWeight="bold" color="black" mb={2} as="label">
                      天気情報
                    </Text>
                    <HStack gap={4} wrap="wrap" alignItems="center">
                      <HStack gap={1}>
                        <Input
                          placeholder="気温"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          size="md"
                          width="80px"
                          bg="white"
                          color="black"
                          borderColor="gray.300"
                        />
                        <Text color="black">℃</Text>
                      </HStack>

                      <HStack gap={1}>
                        <Input
                          placeholder="湿度"
                          value={humidity}
                          onChange={(e) => setHumidity(e.target.value)}
                          size="md"
                          width="80px"
                          bg="white"
                          color="black"
                          borderColor="gray.300"
                        />
                        <Text color="black">%</Text>
                      </HStack>

                      {/* セレクトボックス (Chakra UI v3) */}
                      <Select.Root
                        collection={weatherCollection}
                        size="md"
                        width="140px"
                        value={[weather]}
                        onValueChange={(val: any) => {
                          if (typeof val === "string") setWeather(val);
                          else if (val.value && Array.isArray(val.value))
                            setWeather(val.value[0]);
                          else if (val.value) setWeather(val.value);
                        }}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger bg="white" borderColor="gray.300">
                            <Select.ValueText
                              placeholder="天気を選択"
                              color="black"
                            />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator color="black" />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            {/* メニュー背景白 */}
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

                      <Button
                        size="sm"
                        colorScheme="yellow" // 画像に合わせて黄色系などの目立つ色に
                        variant="ghost" // 文字だけのリンク風にするならghost、ボタンならsolid
                        loading={loadingWeather}
                        onClick={handleAutoFillWeather}
                        color="black"
                      >
                        自動取得
                      </Button>
                    </HStack>

                    {/* 風速・降水量の追加欄（必要であれば表示、画像にはないので控えめに配置） */}
                    <HStack gap={4} mt={2} wrap="wrap">
                      <HStack gap={1}>
                        <Input
                          placeholder="風速"
                          value={windSpeed}
                          onChange={(e) => setWindSpeed(e.target.value)}
                          size="md"
                          width="80px"
                          bg="white"
                          color="black"
                          borderColor="gray.300"
                        />
                        <Text color="black">m/s</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Input
                          placeholder="降水量"
                          value={precipitation}
                          onChange={(e) => setPrecipitation(e.target.value)}
                          size="md"
                          width="80px"
                          bg="white"
                          color="black"
                          borderColor="gray.300"
                        />
                        <Text color="black">mm</Text>
                      </HStack>
                    </HStack>
                  </Box>

                  {/* 投稿ボタン */}
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

            <Box textAlign="left">
              <Link to="/worklogformat">
                <Button
                  variant="outline"
                  size="sm"
                  color="gray.600"
                  borderColor="gray.300"
                  bg="white"
                >
                  キャンセルして戻る
                </Button>
              </Link>
            </Box>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
