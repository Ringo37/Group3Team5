import {
  Box,
  Flex,
  Input,
  InputGroup,
  SimpleGrid,
  Button,
  HStack,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import {
  useLoaderData,
  useNavigate,
  Form,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router";

import { PostCard } from "~/components/postCard";
import { getKnowHows, getKnowHowsCount } from "~/models/knowhow.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const knowhows = await getKnowHows(page, 18, search);
  const totalCount = await getKnowHowsCount(search);

  return { knowhows, page, totalCount, search };
}

export default function Explore() {
  const navigate = useNavigate();
  const { knowhows, page, totalCount, search } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const totalPages = Math.ceil(totalCount / 18);

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    navigate(`?${newParams.toString()}`);
  };

  return (
    <Flex direction="column" minH="100vh" bg="#fdf8f3">
      <Box flex="1" width="100%" pb={20}>
        <Box maxW="7xl" mx="auto" px={{ base: 6, md: 10 }}>
          <Form method="get" action=".">
            <InputGroup
              startElement={<Search size={16} color="gray" />}
              marginY={5}
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

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {knowhows.length > 0 ? (
              knowhows.map((knowhow) => (
                <PostCard key={knowhow.id} knowhow={knowhow} />
              ))
            ) : (
              <Box
                gridColumn="1 / -1"
                textAlign="center"
                py={10}
                color="gray.500"
              >
                該当するノウハウが見つかりませんでした。
              </Box>
            )}
          </SimpleGrid>

          {totalPages > 0 && (
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
                  colorScheme={p === page ? "teal" : "gray"}
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
    </Flex>
  );
}
