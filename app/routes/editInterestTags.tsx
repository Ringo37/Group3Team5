import {
  Button,
  Box,
  Heading,
  VStack,
  Checkbox, // v3ではこれは名前空間(Namespace)として機能します
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Form,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { addInterestTag } from "~/models/user.server";
import { requireUser } from "~/services/auth.server";

// タグの候補リスト
const CANDIDATE_TAGS = [
  "スマート農業",
  "AI",
  "初心者",
  "センサー",
  "IoT",
  "市場分析",
  "害虫対策",
  "ドローン",
  "有機栽培",
  "経営管理",
  "自動化",
  "ロボット",
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  // 選択されたすべての "tags" の値を配列として取得
  const tags = formData.getAll("tags") as string[];

  await addInterestTag(user.id, tags);
  return redirect("/mypage");
}

export default function EditInterestTagsPage() {
  return (
    <Box
      maxW="400px"
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="lg"
    >
      <Heading size="md" mb={4}>
        興味のあるタグを登録・編集
      </Heading>

      <Form method="post">
        <VStack gap={4} align="stretch">
          <Box
            p={4}
            borderWidth="1px"
            borderRadius="md"
            maxH="300px"
            overflowY="auto"
          >
            {/* 修正点1: spacing -> gap に変更 */}
            <SimpleGrid columns={2} gap={3}>
              {CANDIDATE_TAGS.map((tag) => (
                // 修正点2: v3用のカスタムCheckboxコンポーネントを使用
                <CustomCheckbox key={tag} value={tag} label={tag} />
              ))}
            </SimpleGrid>
          </Box>

          <Button
            type="submit"
            colorPalette="teal" // 修正点3: colorScheme -> colorPalette (v3推奨)
            loadingText="保存中"
            width="full"
          >
            保存する
          </Button>
        </VStack>
      </Form>
    </Box>
  );
}

// ------------------------------------------
// Chakra UI v3 用のチェックボックス部品
// ------------------------------------------
function CustomCheckbox({ value, label }: { value: string; label: string }) {
  return (
    <Checkbox.Root name="tags" value={value} colorPalette="teal">
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        {/* チェックが入ったときのアイコン（チェックマーク） */}
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
