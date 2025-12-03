import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Button,
  Separator,
} from "@chakra-ui/react";
import { Calendar } from "lucide-react";
import {
  Link,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";

import { getKnowhowById } from "~/models/knowhow.server";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    return redirect("/explore");
  }
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    return redirect("/explore");
  }
  const userId = await requireUserId(request);

  const knowhow = await getKnowhowById(idNumber, userId);
  return { knowhow };
}

export default function KnowhowDetail() {
  const { knowhow } = useLoaderData<typeof loader>();

  // データが存在しない場合の表示
  if (!knowhow) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack gap={4}>
          <Heading size="md">ノウハウが見つかりませんでした</Heading>
          <Link to="/explore">
            <Button>一覧に戻る</Button>
          </Link>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack gap={6} align="stretch">
        {/* パンくずリスト & 戻るボタン */}
        <HStack justify="space-between">
          <Link to="/explore">
            <Button variant="ghost" size="sm">
              一覧へ
            </Button>
          </Link>
          <Text gap="8px" fontSize="sm">
            {knowhow.title}
          </Text>
        </HStack>

        {/* カバー画像 (存在する場合のみ表示) */}
        {knowhow.cover && (
          <Box
            w="100%"
            h={{ base: "200px", md: "350px" }}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
          >
            <Image
              src={knowhow.cover.url}
              alt={knowhow.title}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          </Box>
        )}

        {/* タイトルとメタ情報 */}
        <VStack align="start" gap={3}>
          <HStack>
            <Badge
              colorScheme={knowhow.visibility === "PUBLIC" ? "green" : "gray"}
            >
              {knowhow.visibility}
            </Badge>
            <HStack color="gray.500" fontSize="sm">
              <Calendar />
              <Text>
                {new Date(knowhow.createdAt).toLocaleDateString("ja-JP")}
              </Text>
            </HStack>
          </HStack>

          <Heading as="h1" size="xl">
            {knowhow.title}
          </Heading>
        </VStack>

        {/* 概要 (Summary) */}
        {knowhow.summary && (
          <Box
            p={4}
            bg="gray.50"
            borderLeft="4px solid"
            borderColor="teal.500"
            borderRadius="sm"
          >
            <Text fontSize="md" color="gray.700" fontWeight="bold">
              概要
            </Text>
            <Text mt={2} color="gray.600">
              {knowhow.summary}
            </Text>
          </Box>
        )}

        <Separator />

        {/* 本文 (FullText) */}
        <Box
          className="markdown-body" // 将来的にMarkdownスタイルを当てる場合用
          lineHeight="1.8"
          fontSize="lg"
          whiteSpace="pre-wrap" // 改行を反映させる
        >
          {knowhow.fullText || "本文はありません。"}
        </Box>

        {/* フッターエリア（必要に応じて編集ボタンなどを配置） */}
        <Box pt={10}>{/* 編集ボタンなどを置くスペース */}</Box>
      </VStack>
    </Container>
  );
}
