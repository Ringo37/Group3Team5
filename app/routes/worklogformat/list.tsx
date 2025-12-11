import {
  Container,
  VStack,
  Box,
  Text,
  Heading,
  HStack,
  Tag,
  Button,
  Flex, // レイアウト用に追記
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLoaderData, Link, useSearchParams } from "react-router";

import { prisma } from "~/lib/prisma";
import { requireUser } from "~/services/auth.server"; // 認証用に追加

// Python APIのURL
const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:8000";

// 型定義: map関数でのエラーを防ぐために追加
type WorkLogItem = {
  id: number;
  title: string | null;
  date: string; // Remix経由で受け取るとDateはStringになります
  user: { name: string | null } | null;
  tags: { id: string; tag: string }[];
};

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const sortMode = url.searchParams.get("sort"); // "recommend" か undefined

  // 1. 基本となる日誌データを取得
  // コンテンツベースフィルタリングのため、一度候補をすべて取得します
  const allLogs = await prisma.workLog.findMany({
    include: { user: true, tags: true },
    orderBy: { date: "desc" },
    take: 50, // 件数制限
  });

  // デフォルト（新着順）の場合はそのまま返す
  if (sortMode !== "recommend") {
    return { logs: allLogs, isRecommended: false };
  }

  // 2. おすすめモードの場合
  try {
    // ログインユーザーの情報を取得 (requireUserを使用)
    const user = await requireUser(request);

    // ユーザーの興味タグを取得
    const userInterests = await prisma.interestTag.findMany({
      where: { users: { some: { id: user.id } } },
      select: { tag: true },
    });
    const interestTags = userInterests.map((t) => t.tag);

    // 3. Python APIへのリクエストデータを作成
    const requestBody = {
      knowhows: allLogs.map((log) => ({
        id: log.id,
        title: log.title || "無題",
        tags: log.tags.map((t) => t.tag),
      })),
      learners: [
        {
          user_id: user.id,
          name: user.name,
          interest_tags: interestTags,
        },
      ],
      user_name: user.name,
      top_n: 50,
    };

    // 4. Python APIを叩く
    const response = await fetch(`${MODEL_API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Recommendation API failed");
    }

    const data = await response.json();
    const recommendations = data.recommendations;

    // 5. APIの結果順に allLogs を並び替える
    const sortedLogs = recommendations
      .map((rec: any) => allLogs.find((log) => log.id === rec.id))
      .filter((log: any) => log !== undefined);

    return { logs: sortedLogs, isRecommended: true };
  } catch (e) {
    console.error("Recommendation Error:", e);
    // エラー時はフォールバックとして通常リストを返す
    return { logs: allLogs, isRecommended: false };
  }
};

export default function WorkLogList() {
  const { logs, isRecommended } = useLoaderData<typeof loader>();

  // 削除完了メッセージの制御
  const [searchParams, setSearchParams] = useSearchParams();
  const isDeleted = searchParams.get("deleted") === "true";
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isDeleted) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDeleted, setSearchParams]);

  return (
    <Container maxW="lg" py={8}>
      {/* メッセージエリア */}
      {showNotification && (
        <Box
          mb={6}
          p={4}
          bg="red.50"
          color="red.800"
          borderRadius="md"
          borderWidth="1px"
          borderColor="red.200"
          textAlign="center"
        >
          <Text fontWeight="bold">🗑️ 日誌を削除しました</Text>
        </Box>
      )}

      {/* 日誌トップに戻るボタン */}
      <Box mb={4}>
        <Link to="/worklogformat">
          <Button
            as="div"
            variant="solid"
            size="sm"
            bg="white"
            color="gray.800"
            borderWidth="1px"
            borderColor="gray.300"
            _hover={{ bg: "gray.100" }}
            cursor="pointer"
          >
            ← 日誌トップに戻る
          </Button>
        </Link>
      </Box>

      {/* 見出しとソートボタン */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="teal.700">日誌一覧</Heading>

        <HStack>
          <Link to="/worklogformat/list">
            <Button
              as="div"
              size="sm"
              variant={!isRecommended ? "solid" : "outline"}
              colorScheme="teal"
              cursor="pointer"
            >
              新着順
            </Button>
          </Link>
          <Link to="/worklogformat/list?sort=recommend">
            <Button
              as="div"
              size="sm"
              variant={isRecommended ? "solid" : "outline"}
              colorScheme="orange"
              cursor="pointer"
            >
              おすすめ順
            </Button>
          </Link>
        </HStack>
      </Flex>

      {(!logs || logs.length === 0) && (
        <Text color="gray.600">
          {isRecommended
            ? "おすすめできる投稿が見つかりませんでした。"
            : "まだ投稿がありません。"}
        </Text>
      )}

      <VStack gap={4} align="stretch">
        {/* logsに型指定(WorkLogItem)を追加してanyエラーを回避 */}
        {logs?.map((log: WorkLogItem) => (
          <Box
            key={log.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            color="black"
            borderColor={isRecommended ? "orange.200" : "gray.200"} // おすすめ時は枠線を少し変える
            _hover={{
              shadow: "lg",
              borderColor: isRecommended ? "orange.400" : "teal.300",
              transform: "translateY(-2px)",
            }}
            transition="all 0.2s"
          >
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  {new Date(log.date).toLocaleDateString()}
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
