import {
  Button,
  Input,
  Box,
  Flex,
  Heading,
  VStack,
  Alert,
  Text,
  Field,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { getUserByEmail, createUser } from "~/models/user.server";
import { createUserSession, getUserId } from "~/services/auth.server";
import { safeRedirect } from "~/utils/safeRedirect";
import { validateEmail } from "~/utils/validateEmail";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name"); // 既に存在
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordConfirmation = formData.get("passwordConfirmation");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  try {
    if (typeof name !== "string" || name.length === 0) {
      return {
        errors: {
          name: "名前は必須です", // nameエラー
          email: null,
          password: null,
          passwordConfirmation: null,
        },
      };
    }

    if (!validateEmail(email)) {
      return {
        errors: {
          name: null,
          email: "有効なメールアドレスではありません",
          password: null,
          passwordConfirmation: null,
        },
      };
    }

    if (typeof password !== "string" || password.length === 0) {
      return {
        errors: {
          name: null,
          email: null,
          password: "パスワードは必須です",
          passwordConfirmation: null,
        },
      };
    }

    if (password.length < 8) {
      return {
        errors: {
          name: null,
          email: null,
          password: "パスワードは8文字以上である必要があります",
          passwordConfirmation: null,
        },
      };
    }

    if (password !== passwordConfirmation) {
      return {
        errors: {
          name: null,
          email: null,
          password: null,
          passwordConfirmation: "パスワードが一致しません",
        },
      };
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        errors: {
          name: null,
          email: "このメールアドレスは既に使用されています",
          password: null,
          passwordConfirmation: null,
        },
      };
    }

    const user = await createUser(email, password, name);

    // セッションを作成してログイン
    return createUserSession({
      redirectTo,
      remember: false,
      request,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { e: error.message };
    }
    throw error;
  }
};

export const meta = () => [{ title: "アカウント登録" }];

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.passwordConfirmation) {
      passwordConfirmationRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Flex align="center" justify="center" h="100vh" bg="gray.50">
      <Box
        mx="auto"
        w="full"
        maxW="md"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          アカウント登録
        </Heading>

        <Form method="post">
          <VStack gap={4}>
            <Field.Root invalid={!!actionData?.errors?.name}>
              <Input
                placeholder="Name"
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                type="text"
                autoComplete="name"
                aria-describedby="name-error"
              />
              <Field.ErrorText id="name-error">
                {actionData?.errors?.name}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!actionData?.errors?.email}>
              <Input
                placeholder="Email address"
                ref={emailRef}
                id="email"
                required
                autoFocus={false}
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby="email-error"
              />
              <Field.ErrorText id="email-error">
                {actionData?.errors?.email}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!actionData?.errors?.password}>
              <Input
                placeholder="Password (8文字以上)"
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-describedby="password-error"
              />
              <Field.ErrorText id="password-error">
                {actionData?.errors?.password}
              </Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!actionData?.errors?.passwordConfirmation}>
              <Input
                placeholder="Password (確認用)"
                id="passwordConfirmation"
                ref={passwordConfirmationRef}
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                aria-describedby="password-confirmation-error"
              />
              <Field.ErrorText id="password-confirmation-error">
                {actionData?.errors?.passwordConfirmation}
              </Field.ErrorText>
            </Field.Root>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            {actionData?.e && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>{actionData.e}</Alert.Title>
              </Alert.Root>
            )}

            <Button type="submit" colorScheme="blue" w="full" size="lg">
              登録する
            </Button>

            <Text textAlign="center" mt={4}>
              すでにアカウントをお持ちの場合
              <Link to="/login">
                <Text as="span" color="blue.500" ml={2}>
                  ログイン
                </Text>
              </Link>
            </Text>
          </VStack>
        </Form>
      </Box>
    </Flex>
  );
}
