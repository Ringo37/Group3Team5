import {
  Avatar,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Input,
  Spacer,
  Text,
  VStack,
  Separator,
  Field,
} from "@chakra-ui/react";
import { Calendar, Edit, Mail, Phone, User, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { updateUser } from "~/models/user.server";
import { getUserId, requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const tel = formData.get("tel") as string;

  const errors: { name?: string; email?: string } = {};
  if (!name) {
    errors.name = "ユーザー名は必須です。";
  }
  if (!email) {
    errors.email = "Emailは必須です。";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const user = await updateUser(userId, email, name, tel);
  return { user };
}

const InfoRow = ({
  icon,
  label,
  value,
  name,
  error,
  isEditing,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  name?: string;
  error?: string;
  isEditing?: boolean;
  // eslint-disable-next-line
  onChange?: (value: string) => void;
}) => {
  return (
    <HStack w="100%" gap={4} align="center">
      <Icon as={icon} color="gray.500" />
      <Text fontWeight="bold" w="100px">
        {label}:
      </Text>
      {isEditing && name && onChange ? (
        <VStack align="stretch" flex="1">
          <Field.Root invalid={!!error}>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              w="auto"
              name={name}
            />
            <Field.ErrorText>{error}</Field.ErrorText>
          </Field.Root>
        </VStack>
      ) : (
        <Text>{value || "未設定"}</Text>
      )}
    </HStack>
  );
};

export default function Mypage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isEditing, setIsEditing] = useState(!!actionData?.errors);
  const [data, setData] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    tel: user.tel ?? "",
  });

  const handleChange = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (actionData && !actionData.errors) {
      setIsEditing(false);
    }
  }, [actionData]);

  return (
    <Box p={8} w="100%">
      <Form method="post">
        <VStack gap={6} align="stretch">
          <HStack>
            <Heading as="h1" size="xl">
              マイページ
            </Heading>
            <Spacer />

            {isEditing ? (
              <HStack>
                <Button colorScheme="green" type="submit">
                  <Check />
                  保存
                </Button>
                <Button colorScheme="gray" onClick={() => setIsEditing(false)}>
                  <X />
                  キャンセル
                </Button>
              </HStack>
            ) : (
              <Button onClick={() => setIsEditing(true)} colorScheme="blue">
                <Edit />
                編集
              </Button>
            )}
          </HStack>

          <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
            <HStack gap={8} align="start">
              <Avatar.Root size="2xl">
                <Avatar.Fallback name={user.name} />
                <Avatar.Image src={user.avatar ?? undefined} />
              </Avatar.Root>
              <VStack gap={4} align="stretch" w="100%">
                <InfoRow
                  icon={User}
                  label="ユーザー名"
                  value={data.name}
                  name="name"
                  error={actionData?.errors?.name}
                  onChange={(val) => handleChange("name", val)}
                  isEditing={isEditing}
                />
                <Separator />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={data.email}
                  name="email"
                  error={actionData?.errors?.email}
                  onChange={(val) => handleChange("email", val)}
                  isEditing={isEditing}
                />
                <Separator />
                <InfoRow
                  icon={Phone}
                  label="電話番号"
                  value={data.tel}
                  name="tel"
                  onChange={(val) => handleChange("tel", val)}
                  isEditing={isEditing}
                />
                <Separator />
                <InfoRow
                  icon={Calendar}
                  label="登録日"
                  value={new Date(user.createdAt).toLocaleDateString("ja-JP")}
                />
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Form>
    </Box>
  );
}
