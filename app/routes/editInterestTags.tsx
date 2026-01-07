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
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { farmKeyword } from "~/data/farmKeyword";
import { addInterestTag, getUserById } from "~/models/user.server";
import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  // #修正: ユーザーが現在持っているタグを取得してクライアントに渡す
  const userWithTags = await getUserById(user.id);
  const currentTags = userWithTags?.InterestTag.map((t) => t.tag) || [];

  return { currentTags };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  // 選択されたすべての "tags" の値を配列として取得
  const tags = formData.getAll("tags") as string[];

  // addInterestTag内で 'set' を使うようになったため、これでリセットと更新が同時に行われる
  await addInterestTag(user.id, tags);
  return redirect("/mypage");
}

export default function EditInterestTagsPage() {
  // #修正: loaderから現在のタグリストを取得
  const { currentTags } = useLoaderData<typeof loader>();
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
            {/*  spacing -> gap に変更 */}
            <SimpleGrid columns={3} gap={6}>
              {Array.from(farmKeyword).map((tag) => (
                //  v3用のカスタムCheckboxコンポーネントを使用
                <CustomCheckbox
                  key={tag}
                  value={tag}
                  label={tag}
                  defaultChecked={currentTags.includes(tag)}
                />
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
function CustomCheckbox({
  value,
  label,
  defaultChecked,
}: {
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <Checkbox.Root
      name="tags"
      value={value}
      colorPalette="teal"
      defaultChecked={defaultChecked}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        {/* チェックが入ったときのアイコン（チェックマーク） */}
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
