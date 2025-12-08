import {
  Box,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Separator,
  Button,
} from "@chakra-ui/react";
import { ArrowLeft, Building2, FileText, Hash } from "lucide-react";
import {
  Link,
  useLoaderData,
  redirect,
  type LoaderFunctionArgs,
} from "react-router";

import { getOrganizationById } from "~/models/organization.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id;
  if (!id) {
    return redirect("/organization");
  }
  const organization = await getOrganizationById(id);

  if (!organization) {
    // 組織が見つからない場合は一覧へリダイレクト、または404を投げる
    throw new Response("Organization Not Found", { status: 404 });
  }

  return { organization };
}

export default function OrganizationDetail() {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <Box p={8} w="100%">
      <VStack gap={6} align="stretch" w="80%" mx="auto">
        {/* ナビゲーションエリア */}
        <HStack>
          <Button variant="ghost" colorScheme="gray" asChild>
            <Link to="/organization">
              <ArrowLeft /> 組織一覧に戻る
            </Link>
          </Button>
        </HStack>

        {/* 詳細カード */}
        <Box
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg="white"
        >
          <VStack align="stretch" gap={6}>
            {/* ヘッダー部分（アイコン・名前・ID） */}
            <HStack gap={5} align="start">
              <Box
                p={3}
                bg="gray.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Building2} boxSize={8} color="gray.600" />
              </Box>
              <VStack align="start" gap={1}>
                <Heading size="xl">{organization.name}</Heading>
                <HStack>
                  <Icon as={Hash} size={"lg"} color="gray.400" />
                  <Text color="gray.500" fontSize="sm" fontFamily="mono">
                    {organization.id}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Separator />

            {/* 詳細情報の表示エリア */}
            <VStack align="stretch" gap={2}>
              <HStack gap={2} mb={2}>
                <Icon as={FileText} color="gray.500" />
                <Heading size="md" fontSize="lg">
                  組織詳細
                </Heading>
              </HStack>

              <Box
                p={4}
                bg="gray.50"
                borderRadius="md"
                borderWidth="1px"
                minH="150px"
              >
                <Text whiteSpace="pre-wrap" color="gray.700" lineHeight="tall">
                  {organization.detail || "詳細情報はありません。"}
                </Text>
              </Box>
            </VStack>

            {/* 必要に応じて追加情報をここに配置（作成日、メンバー数など） */}
            {/* <HStack fontSize="sm" color="gray.500" justify="flex-end">
              <Text>作成日: {new Date(organization.createdAt).toLocaleDateString()}</Text>
            </HStack>
            */}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
