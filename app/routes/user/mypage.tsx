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
import {
  Calendar,
  Edit,
  Mail,
  Phone,
  User,
  Check,
  X,
  Building2, // 組織用アイコンを追加
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { getOrganizationsByUserId } from "~/models/organization.server";
import { updateUser } from "~/models/user.server";
import { getUserId, requireUser } from "~/services/auth.server";

// LoaderとActionはそのまま変更なし
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const organizations = await getOrganizationsByUserId(user.id);
  if (!user) {
    return redirect("/login");
  }
  return { user, organizations };
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

// InfoRowコンポーネントもそのまま
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
  const { user, organizations } = useLoaderData<typeof loader>();
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
          {/* ヘッダーエリア */}
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

          {/* ユーザー情報セクション */}
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            bg="white"
          >
            <HStack gap={8} align="start">
              <Avatar.Root size="2xl">
                <Avatar.Fallback name={user.name} />
                <Avatar.Image src={user.avatar?.url ?? undefined} />
              </Avatar.Root>
              <VStack gap={4} align="stretch" w="100%">
                <Heading size="md" mb={2}>
                  基本情報
                </Heading>
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

          {/* 組織情報セクション (新規追加) */}
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            bg="white"
          >
            <VStack align="stretch" gap={4}>
              <HStack>
                <Icon as={Building2} color="gray.500" boxSize={6} />
                <Heading size="md">所属組織</Heading>
              </HStack>

              <Separator />

              {organizations.length === 0 ? (
                <Text color="gray.500" py={2}>
                  所属している組織はありません。
                </Text>
              ) : (
                <VStack align="stretch" gap={3}>
                  {organizations.map((org) => (
                    <Link to={`/organization/${org.id}`}>
                      <Box
                        key={org.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        _hover={{ bg: "gray.50" }}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap={1}>
                            <HStack>
                              <Text fontWeight="bold" fontSize="lg">
                                {org.name}
                              </Text>
                            </HStack>
                            {org.detail && (
                              <Text color="gray.600" fontSize="sm">
                                {org.detail}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    </Link>
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </Form>
    </Box>
  );
}
