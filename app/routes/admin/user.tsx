import {
  Button,
  createListCollection,
  Input,
  Select,
  Table,
} from "@chakra-ui/react";
import type { Role } from "@prisma/client";
import { useState } from "react";
import {
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
} from "react-router";

import { getAllUsers, updateUser } from "~/models/user.server";
import { formatDate } from "~/utils/formatDate";

export async function loader() {
  const users = await getAllUsers();
  return { users };
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("id") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const tel = formData.get("tel") as string;
  const role = formData.get("role") as Role;

  await updateUser(userId, email, name, tel, role);

  return null;
}

export default function User() {
  const { users } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const startEditing = (user: any) => {
    setEditingId(user.id);
    setEditValues({ ...user });
  };

  const handleChange = (key: string, value: any) => {
    setEditValues((prev: any) => ({ ...prev, [key]: value }));
  };

  const roles = createListCollection({
    items: [
      { label: "ADMIN", value: "ADMIN" },
      { label: "USER", value: "USER" },
      { label: "FARMER", value: "FARMER" },
    ],
  });
  return (
    <Table.Root>
      <Table.Caption />
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>ユーザーID</Table.ColumnHeader>
          <Table.ColumnHeader>ユーザー名</Table.ColumnHeader>
          <Table.ColumnHeader>メールアドレス</Table.ColumnHeader>
          <Table.ColumnHeader>電話番号</Table.ColumnHeader>
          <Table.ColumnHeader>ロール</Table.ColumnHeader>
          <Table.ColumnHeader>登録日</Table.ColumnHeader>
          <Table.ColumnHeader>操作</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.id}</Table.Cell>
            <Table.Cell>
              {editingId === user.id ? (
                <Input
                  value={editValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              ) : (
                user.name
              )}
            </Table.Cell>
            <Table.Cell>
              {editingId === user.id ? (
                <Input
                  value={editValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              ) : (
                user.email
              )}
            </Table.Cell>
            <Table.Cell>
              {editingId === user.id ? (
                <Input
                  value={editValues.tel}
                  onChange={(e) => handleChange("tel", e.target.value)}
                />
              ) : (
                user.tel
              )}
            </Table.Cell>
            <Table.Cell>
              {" "}
              {editingId === user.id ? (
                <Select.Root
                  collection={roles}
                  onValueChange={(val) => {
                    handleChange("role", val.value);
                  }}
                  defaultValue={[user.role as string]}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="-" />
                  </Select.Trigger>

                  <Select.Content>
                    {roles.items.map((role) => (
                      <Select.Item item={role} key={role.value}>
                        {role.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                user.role
              )}
            </Table.Cell>
            <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
            <Table.Cell>
              {editingId === user.id ? (
                <Button
                  onClick={async () => {
                    await fetcher.submit(
                      { ...editValues, id: editingId },
                      {
                        method: "post",
                      },
                    );
                    setEditingId(null);
                  }}
                >
                  保存
                </Button>
              ) : (
                <Button onClick={() => startEditing(user)}>編集</Button>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
