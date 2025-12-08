import {
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Building2, ChevronRight } from "lucide-react";
import {
  Link,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";

import {
  getOrganizations,
  getOrganizationsCount,
} from "~/models/organization.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const organizations = await getOrganizations(page);
  const totalCount = await getOrganizationsCount();
  return { organizations, page, totalCount };
}

export default function Organization() {
  const navigate = useNavigate();
  const { organizations, page, totalCount } = useLoaderData<typeof loader>();

  const totalPages = Math.ceil(totalCount / 10);

  const handlePageChange = (newPage: number) => {
    navigate(`?page=${newPage}`);
  };

  return (
    <Container w="80%" py={8}>
      <VStack gap={8} align="stretch">
        {/* ヘッダー */}
        <HStack>
          <VStack align="start" gap={1}>
            <Heading as="h1" size="xl">
              組織一覧
            </Heading>
            <Text color="gray.500">登録されている組織を確認できます</Text>
          </VStack>
          <Spacer />
          {/* 必要であればここに「新規作成」ボタンなどを配置 */}
        </HStack>

        {/* 組織リスト（グリッド表示） */}
        {organizations.length === 0 ? (
          <Box
            p={10}
            textAlign="center"
            bg="gray.50"
            borderRadius="lg"
            borderWidth="1px"
            borderStyle="dashed"
          >
            <Text color="gray.500">表示できる組織がありません。</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {organizations.map((org) => (
              <Card.Root
                key={org.id}
                variant="outline"
                _hover={{ borderColor: "blue.400", boxShadow: "md" }}
                transition="all 0.2s"
              >
                <Card.Body>
                  <VStack align="start" gap={4} h="100%">
                    <HStack w="100%" justify="space-between">
                      <HStack>
                        <Box
                          p={2}
                          bg="blue.50"
                          borderRadius="md"
                          color="blue.500"
                        >
                          <Icon as={Building2} />
                        </Box>
                        <Heading size="md" lineClamp={1} title={org.name}>
                          {org.name}
                        </Heading>
                      </HStack>
                    </HStack>

                    <Text
                      color="gray.600"
                      fontSize="sm"
                      lineClamp={3} // 3行以上は「...」で省略
                      minH="4.5em" // 高さ揃え用
                    >
                      {org.detail || "詳細情報はありません。"}
                    </Text>

                    <Spacer />

                    <Button
                      asChild
                      variant="ghost"
                      colorScheme="blue"
                      size="sm"
                      w="full"
                      justifyContent="space-between"
                    >
                      <Link to={`/organization/${org.id}`}>
                        詳細を見る
                        <Icon as={ChevronRight} size={"md"} />
                      </Link>
                    </Button>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        {/* ページネーション */}
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
      </VStack>
    </Container>
  );
}
