import {
  Box,
  Flex,
  Input,
  InputGroup,
  SimpleGrid,
  Button,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import {
  useLoaderData,
  useNavigate,
  Form,
  useSearchParams,
  Link,
  type LoaderFunctionArgs,
} from "react-router";

import Footer from "~/components/fotter";
import { PostCard } from "~/components/postCard";
import { prisma } from "~/lib/prisma";
import { getKnowHows, getKnowHowsCount } from "~/models/knowhow.server";
import { requireUser } from "~/services/auth.server";

const MODEL_API_URL = process.env.MODEL_API_URL || "http://127.0.0.1:8000";

// --- loader関数は前回のままでOK（デバッグログ付き） ---
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const sortMode = url.searchParams.get("sort");

  console.log("--------------- DEBUG START ---------------");
  console.log("DEBUG: URL =", url.toString());
  console.log("DEBUG: sortMode =", sortMode);

  if (sortMode === "recommend") {
    console.log("DEBUG: おすすめモードに入りました");
    try {
      const user = await requireUser(request);

      const userInterests = await prisma.interestTag.findMany({
        where: { users: { some: { id: user.id } } },
        select: { tag: true },
      });
      const interestTags = userInterests.map((t) => t.tag);
      console.log("DEBUG: ユーザーの興味タグ:", interestTags);

      if (interestTags.length === 0) {
        console.log("DEBUG: 【注意】興味タグが0件です。");
      }

      const allKnowHows = await prisma.knowhow.findMany({
        where: {
          title: search ? { contains: search } : undefined,
        },
        include: {
          user: true,
          tags: true,
          cover: true,
        },
        take: 100,
        orderBy: { createdAt: "desc" },
      });

      const requestBody = {
        knowhows: allKnowHows.map((k) => ({
          id: k.id,
          title: k.title,
          tags: k.tags.map((t) => t.tag),
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

      const response = await fetch(`${MODEL_API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Recommendation API failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      const recommendations = data.recommendations;

      const sortedKnowHows = recommendations
        .map((rec: any) => allKnowHows.find((k) => k.id === rec.id))
        .filter((k: any) => k !== undefined);

      console.log("DEBUG: ソート後の件数:", sortedKnowHows.length);
      console.log("--------------- DEBUG END ---------------");

      return {
        knowhows: sortedKnowHows,
        page: 1,
        totalCount: sortedKnowHows.length,
        search,
        isRecommended: true,
      };
    } catch (e) {
      console.error("DEBUG ERROR:", e);
    }
  }

  const knowhows = await getKnowHows(page, 18, search);
  const totalCount = await getKnowHowsCount(search);

  return { knowhows, page, totalCount, search, isRecommended: false };
}

// --- 表示コンポーネント ---
export default function Explore() {
  const navigate = useNavigate();
  const { knowhows, page, totalCount, search, isRecommended } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const totalPages = Math.ceil(totalCount / 18);

  const handlePageChange = (newPage: number) => {
    // ページ切り替え時も現在のsortパラメータを維持する
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    navigate(`?${newParams.toString()}`);
  };

  return (
    <Flex direction="column" minH="100vh" bg="#fdf8f3">
      <Box
        flex="1"
        pb={20}
        mx="auto"
        maxWidth="7xl"
        width={{ base: "95%", md: "90%", lg: "65%" }}
        px={0}
      >
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }}>
          <Heading as="h1" size="2xl" textAlign="center" mt={10}>
            ノウハウを検索
          </Heading>
          <Form method="get" action=".">
            {/* 検索時、おすすめモードがONなら維持するための隠しフィールド */}
            {isRecommended && (
              <input type="hidden" name="sort" value="recommend" />
            )}

            <InputGroup
              startElement={<Search size={16} color="gray" />}
              marginY={10}
            >
              <Input
                name="search"
                type="search"
                defaultValue={search}
                placeholder="キーワードでノウハウを検索..."
                borderRadius="full"
                bg="gray.50"
                _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                borderColor="gray.300"
                pl={10}
              />
            </InputGroup>
          </Form>

          {/* ▼▼▼ ここを修正しました ▼▼▼ */}
          <HStack mb={6} justify="flex-end">
            {/* 新着順: 現在のパスに search パラメータだけ残して遷移 (sortを消す) */}
            <Link to={`?${search ? `search=${search}` : ""}`}>
              <Button
                as="div"
                size="sm"
                variant={!isRecommended ? "solid" : "outline"}
                colorPalette="teal"
                cursor="pointer"
                borderRadius="full"
              >
                新着順
              </Button>
            </Link>

            {/* おすすめ順: 現在のパスに sort=recommend を追加して遷移 */}
            <Link to={`?sort=recommend${search ? `&search=${search}` : ""}`}>
              <Button
                as="div"
                size="sm"
                variant={isRecommended ? "solid" : "outline"}
                colorPalette="orange"
                cursor="pointer"
                borderRadius="full"
              >
                おすすめ順
              </Button>
            </Link>
          </HStack>
          {/* ▲▲▲ 修正終わり ▲▲▲ */}

          {isRecommended && knowhows.length > 0 && (
            <Text mb={4} color="orange.600" fontWeight="bold" fontSize="sm">
              💡 あなたの登録した興味に基づいて選ばれたノウハウです
            </Text>
          )}

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {knowhows.length > 0 ? (
              knowhows.map((knowhow: any) => (
                <PostCard key={knowhow.id} knowhow={knowhow} />
              ))
            ) : (
              <Box
                gridColumn="1 / -1"
                textAlign="center"
                py={10}
                color="gray.500"
              >
                {isRecommended
                  ? "おすすめできるノウハウが見つかりませんでした。"
                  : "該当するノウハウが見つかりませんでした。"}
              </Box>
            )}
          </SimpleGrid>

          {!isRecommended && totalPages > 0 && (
            <HStack gap={2} justify="center" mt={10}>
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                前へ
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  colorPalette={p === page ? "teal" : "gray"}
                >
                  {p}
                </Button>
              ))}

              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                次へ
              </Button>
            </HStack>
          )}
        </Box>
      </Box>
      <Footer />
    </Flex>
  );
}
