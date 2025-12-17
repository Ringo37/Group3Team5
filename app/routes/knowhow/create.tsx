import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { getFarmById } from "~/models/farm.server";
import { createKnowhow } from "~/models/knowhow.server";
import { createTags } from "~/models/tag.server";
import { getWorkLogsByFarmId } from "~/models/workLog.server";
import { generateKnowHow } from "~/services/ai.server";
import { requireUser } from "~/services/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const farmId = Number(params.farmId) || 1;
  await requireUser(request);
  const farm = await getFarmById(farmId);
  const workLogs = await getWorkLogsByFarmId(farmId);
  return { farm, workLogs };
}
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const farmId = Number(formData.get("farmId"));
  const logs = await getWorkLogsByFarmId(farmId);

  // ここでノウハウ生成処理
  const knowhow = await generateKnowHow(logs);
  const tagsArray = knowhow.tags
    ? knowhow.tags.split(",").map((tag) => tag.trim())
    : [];

  const tags = await createTags(tagsArray);
  const knowhowdb = await createKnowhow({
    title: knowhow.title,
    summary: knowhow.summary,
    fullText: knowhow.content,
    farmId,
    userId: user.id,
    visibility: "PUBLIC",
    tags,
  });
  if (!knowhowdb) {
    return null;
  }
  console.log(knowhow);

  return redirect(`/knowhow/${knowhowdb.id}`);
}

export default function KnowhowCreate() {
  const { farm, workLogs } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleSubmit = () => {
    const ok = window.confirm("選択した日誌からノウハウを生成しますか？");
    if (!ok) return;

    const formData = new FormData();
    formData.append("farmId", String(farm?.id));

    fetcher.submit(formData, { method: "post" });
  };
  return (
    <Container maxW="lg">
      <Heading size="lg">{farm?.name}のノウハウを生成</Heading>
      <HStack justify="center" my={4}>
        <Button onClick={handleSubmit} loading={fetcher.state !== "idle"}>
          以下の日誌から生成
        </Button>
      </HStack>

      <VStack gap={4} align="stretch">
        {workLogs?.map((log) => (
          <Box
            key={log.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            color="black"
            _hover={{
              shadow: "lg",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
          >
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                {/* JSTで日付表示 */}
                <Text fontSize="sm" color="gray.500">
                  {new Date(log.date).toLocaleDateString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                  })}
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {log.user?.name ?? "不明"}
                </Text>
              </HStack>

              <Heading size="md" color="teal.600">
                <Link
                  to={`/worklogformat/${log.id}`}
                  style={{ display: "block", width: "100%" }}
                >
                  {log.title || "無題の作業日誌"}
                </Link>
              </Heading>

              {/* タグ表示 */}
              {log.tags && log.tags.length > 0 && (
                <HStack gap={2}>
                  {log.tags.map((tag) => (
                    <Tag.Root
                      key={tag.id}
                      size="sm"
                      variant="solid"
                      bg="teal.500"
                    >
                      <Tag.Label color="white">{tag.tag}</Tag.Label>
                    </Tag.Root>
                  ))}
                </HStack>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Container>
  );
}
