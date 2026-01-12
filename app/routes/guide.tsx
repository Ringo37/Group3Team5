import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Container,
  Button,
  SimpleGrid,
  Icon,
  Accordion,
} from "@chakra-ui/react";
import {
  BookOpen,
  Search,
  SquarePen,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";

import Footer from "~/components/fotter";

export const meta: MetaFunction = () => {
  return [
    { title: "ご利用ガイド | 農ハウマッチング" },
    {
      name: "description",
      content:
        "農ハウマッチングのご利用方法、主な機能、よくある質問についてご案内します。",
    },
  ];
};

export default function GuidePage() {
  return (
    <Box bg="#fdf8f3" minH="100vh" w="full">
      <Box
        mx="auto"
        maxWidth="7xl"
        width={{ base: "95%", md: "90%", lg: "80%" }} // ガイドは見やすくするため少し幅を広げています
        px={0}
      >
        <Container maxW="container.lg" py={10}>
          <VStack align="stretch" gap={6}>
            <Heading
              as="h1"
              size="2xl"
              textAlign="center"
              mb={5}
              lineHeight="1.2"
              color="gray.800"
            >
              ご利用ガイド
            </Heading>

            <Box
              p={{ base: 6, md: 12 }}
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

              <VStack gap={12} align="stretch">
                <Box textAlign="center">
                  <Text
                    fontSize="lg"
                    color="gray.600"
                    lineHeight="tall"
                    fontWeight="bold"
                  >
                    農ハウマッチングへようこそ。
                    <br />
                    このプラットフォームを使って、農業のノウハウを記録・共有し、
                    <br />
                    最適なパートナーと出会う方法をご案内します。
                  </Text>
                </Box>

                <Box>
                  <SectionTitle title="主な機能" />
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mt={6}>
                    <FeatureItem
                      icon={SquarePen}
                      title="日誌をつける"
                      desc="日々の農作業を記録しましょう。写真やタグ付きで記録することで、自分だけのナレッジベースが構築されます。"
                    />
                    <FeatureItem
                      icon={Search}
                      title="ノウハウを探す"
                      desc="他のユーザーが公開している「農ハウ」を検索できます。困ったときの解決策が見つかるかもしれません。"
                    />
                    <FeatureItem
                      icon={UserPlus}
                      title="マッチング"
                      desc="興味のある農家さんや技術を持っている人とつながり、メッセージ交換や情報共有ができます。"
                    />
                  </SimpleGrid>
                </Box>

                <Box>
                  <SectionTitle title="ご利用の流れ" />
                  <VStack gap={4} mt={6} align="stretch">
                    <StepItem
                      number="01"
                      title="アカウント登録"
                      desc="まずは新規登録からアカウントを作成しましょう。メールアドレスがあればすぐに始められます。"
                    />
                    <StepItem
                      number="02"
                      title="プロフィールの充実"
                      desc="マイページからプロフィール画像や自己紹介を設定すると、他のユーザーから信頼されやすくなります。"
                    />
                    <StepItem
                      number="03"
                      title="日誌の投稿・閲覧"
                      desc="「日誌を作成する」から日々の記録をつけたり、「ノウハウを探す」から他の人の投稿を見てみましょう。"
                    />
                  </VStack>
                </Box>

                <Box>
                  <SectionTitle title="よくある質問" />
                  <Box mt={6}>
                    <Accordion.Root multiple collapsible variant="outline">
                      <FaqItem
                        title="利用料金はかかりますか？"
                        content="基本的な機能はすべて無料でご利用いただけます。"
                      />
                      <FaqItem
                        title="退会したい場合はどうすればいいですか？"
                        content="設定画面の「アカウント削除」から手続きを行うことができます。"
                      />
                      <FaqItem
                        title="日誌を非公開にすることはできますか？"
                        content="はい、日誌作成時に公開範囲を設定することが可能です。"
                      />
                    </Accordion.Root>
                  </Box>
                </Box>

                <Box textAlign="center" pt={4}>
                  <Text fontWeight="bold" mb={4} fontSize="lg">
                    さっそく始めてみましょう
                  </Text>
                  <HStack justify="center" gap={4} flexWrap="wrap">
                    <Link to="/join">
                      <Button
                        size="lg"
                        bg="#009245"
                        color="white"
                        _hover={{ bg: "#007A3A" }}
                        px={8}
                        borderRadius="full"
                      >
                        新規登録はこちら{" "}
                      </Button>
                    </Link>
                    <Link to="/explore">
                      <Button
                        size="lg"
                        variant="outline"
                        color="#009245"
                        borderColor="#009245"
                        _hover={{ bg: "green.50" }}
                        px={8}
                        borderRadius="full"
                      >
                        ノウハウを見る
                      </Button>
                    </Link>
                  </HStack>
                </Box>
              </VStack>
            </Box>

            <Box textAlign="left">
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  color="gray.600"
                  borderColor="gray.300"
                  bg="white"
                >
                  ホームに戻る
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

function SectionTitle({ title }: { title: string }) {
  return (
    <Box borderBottomWidth="2px" borderColor="#009245" pb={2} mb={2}>
      <HStack>
        <Icon as={BookOpen} color="#009245" />
        <Heading size="md" color="gray.700">
          {title}
        </Heading>
      </HStack>
    </Box>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <VStack
      bg="gray.50"
      p={6}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      align="center"
      textAlign="center"
      gap={4}
    >
      <Box
        p={3}
        bg="white"
        borderRadius="full"
        color="#009245"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Icon as={icon} boxSize={8} />
      </Box>
      <Heading size="sm" color="gray.800">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.600">
        {desc}
      </Text>
    </VStack>
  );
}

function StepItem({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <HStack
      bg="gray.50"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      align="flex-start"
      gap={4}
    >
      <Text
        fontSize="2xl"
        fontWeight="900"
        color="#009245"
        lineHeight={1}
        mt={1}
      >
        {number}
      </Text>
      <Box>
        <Text fontWeight="bold" color="gray.800" mb={1}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {desc}
        </Text>
      </Box>
    </HStack>
  );
}

function FaqItem({ title, content }: { title: string; content: string }) {
  return (
    <Accordion.Item
      value={title}
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <Accordion.ItemTrigger _hover={{ bg: "gray.50" }} py={4}>
        <Box flex="1" textAlign="left" fontWeight="bold" color="gray.700">
          <HStack gap={3}>
            <Icon as={HelpCircle} color="#009245" boxSize="18px" />
            <Text>{title}</Text>
          </HStack>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent pb={4} ps={8} color="gray.600">
        {content}
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
