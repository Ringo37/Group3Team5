import { Button, Input, Table } from "@chakra-ui/react";
import {
  Form,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
} from "react-router";

import { createTags, deleteTagById, getAllTags } from "~/models/tag.server";

export async function loader() {
  const tags = await getAllTags();
  return { tags };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _action = formData.get("_action");
  if (_action == "delete") {
    const id = formData.get("id") as string;
    if (!id) {
      return null;
    }
    await deleteTagById(id);
  } else {
    const tags = formData.get("tags") as string;
    const tagList = tags.split(",").map((s) => s.trim());
    await createTags(tagList);
  }
  return null;
}

export default function AccessLog() {
  const { tags } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  return (
    <>
      <p>タグを追加</p>
      <Form method="post" className="w-full flex gap-2">
        <Input
          placeholder="例: スマート農業,AI,初心者,センサー"
          name="tags"
        ></Input>
        <input type="text" value="create" hidden name="_action" />
        <Button type="submit">追加</Button>
      </Form>
      <Table.Root>
        <Table.Caption />
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>タグ</Table.ColumnHeader>
            <Table.ColumnHeader>操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tags.map((tag) => (
            <Table.Row key={tag.id}>
              <Table.Cell>{tag.id}</Table.Cell>
              <Table.Cell>{tag.tag}</Table.Cell>
              <Table.Cell>
                <Button
                  onClick={async () => {
                    const confirmed =
                      window.confirm("削除してもよろしいですか？");
                    if (!confirmed) return;

                    await fetcher.submit(
                      { id: tag.id, _action: "delete" },
                      {
                        method: "post",
                      },
                    );
                  }}
                >
                  削除
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}
