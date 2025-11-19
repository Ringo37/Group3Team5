import { Table } from "@chakra-ui/react";
import { useLoaderData } from "react-router";

import { getAllAccessLog } from "~/models/accessLog.server";
import { formatDate } from "~/utils/formatDate";

export async function loader() {
  const logs = await getAllAccessLog();
  return { logs };
}

export default function AccessLog() {
  const { logs } = useLoaderData<typeof loader>();
  return (
    <Table.Root>
      <Table.Caption />
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>日時</Table.ColumnHeader>
          <Table.ColumnHeader>ユーザー名</Table.ColumnHeader>
          <Table.ColumnHeader>ユーザーID</Table.ColumnHeader>
          <Table.ColumnHeader>アクション</Table.ColumnHeader>
          <Table.ColumnHeader>ノウハウ名</Table.ColumnHeader>
          <Table.ColumnHeader>ノウハウID</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {logs.map((log) => (
          <Table.Row key={log.id}>
            <Table.Cell>{formatDate(log.timestamp)}</Table.Cell>
            <Table.Cell>{log.user.name}</Table.Cell>
            <Table.Cell>{log.userId}</Table.Cell>
            <Table.Cell>{log.action}</Table.Cell>
            <Table.Cell>{log.knowhow.title}</Table.Cell>
            <Table.Cell>{log.knowhowId}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
