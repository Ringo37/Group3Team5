import { Button, Input, Box, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  Form,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { addInterestTag } from "~/models/user.server";
import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const tags = formData.get("tags") as string;
  console.log(tags);
  const tagList = tags.split(",").map((s) => s.trim());
  await addInterestTag(user.id, tagList);
  return {};
}
export default function EditInterestTagsPage() {
  const [tags, setTags] = useState("");

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
      {/* 中央寄せのカードボックス */}
      <Heading size="md" mb={4}>
        興味のあるタグを登録・編集
      </Heading>
      {/* 見出し */}
      <Form method="post">
        {/* フォームの submit を handleSubmit に接続 */}
        <VStack gap={4}>
          {/* 縦に並べるレイアウト（間隔4）,spacing -> gap（CSSのgap） */}
          <Input
            placeholder="例: スマート農業,AI,初心者,センサー" // プレースホルダの例
            value={tags} // Input の値を state と連動
            onChange={(e) => setTags(e.target.value)} // 入力変更時に state を更新
            name="tags"
          />
          <Button
            type="submit" // submit ボタン
            colorScheme="teal" // カラースキーム
            loadingText="保存中" // ローディング時のテキスト
          >
            保存する
          </Button>
        </VStack>
      </Form>
    </Box>
  );
}
