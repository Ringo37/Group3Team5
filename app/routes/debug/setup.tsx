import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
} from "@chakra-ui/react";
import { Link } from "react-router";

import { prisma } from "~/lib/prisma";
// LoaderFunctionArgs を削除

export const loader = async () => {
  const farm = await prisma.farm.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "テスト農場",
      region: "関東",
      areaHa: 1.5,
      seasonalCalendar: "通年",
      mainCrop: {
        connectOrCreate: {
          where: { name: "トマト" },
          create: { name: "トマト" },
        },
      },
    },
  });

  return { farm };
};

export default function Setup() {
  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6} align="stretch">
        <Heading color="green.600">システム準備完了 (Setup)</Heading>
        <Box p={6} bg="gray.50" borderRadius="md" borderWidth="1px">
          <Heading size="sm" mb={2}>
            ✅ 農場データ確認済み
          </Heading>
          <Text fontSize="sm">農場データ（ID: 1）の準備ができました。</Text>
        </Box>
        <Box>
          <Heading size="md" mb={4}>
            次のステップ
          </Heading>
          <VStack gap={4} align="start">
            <Link to="/join">
              <Button colorScheme="blue" width="full">
                1. アカウント登録 (/join)
              </Button>
            </Link>
            <Link to="/worklog">
              <Button colorScheme="teal" variant="outline" width="full">
                2. 日誌トップへ (/worklog)
              </Button>
            </Link>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
