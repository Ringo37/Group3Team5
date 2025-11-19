import {
  Button,
  Input,
  Box,
  Flex,
  Heading,
  VStack,
  Checkbox,
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

import {
  authenticator,
  createUserSession,
  getUserId,
} from "~/services/auth.server";
import { safeRedirect } from "~/utils/safeRedirect";
import { validateEmail } from "~/utils/validateEmail";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const requestClone = request.clone();
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  try {
    if (!validateEmail(email)) {
      return {
        errors: { email: "Email is invalid", password: null },
      };
    }
    if (typeof password !== "string" || password.length === 0) {
      return { errors: { email: null, password: "Password is required" } };
    }
    if (password.length < 8) {
      return { errors: { email: null, password: "Password is too short" } };
    }
    const user = await authenticator.authenticate("user-pass", requestClone);
    if (!user) {
      return {
        errors: { email: "Invalid email or password", password: null },
      };
    }

    return createUserSession({
      redirectTo,
      remember: remember === "on" ? true : false,
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

export const meta = () => [{ title: "ログイン" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
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
          ログイン
        </Heading>

        {/* React RouterのFormはそのまま使用 */}
        <Form method="post">
          {/* VStackでフォーム要素の間隔を管理 */}
          <VStack gap={4}>
            <input type="hidden" name="_action" value="user-pass" />

            {/* Emailフィールド */}
            <Field.Root invalid={!!actionData?.errors?.email}>
              {/* <FormLabel htmlFor="email">Email address</FormLabel> */}
              <Input
                placeholder="Email address"
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby="email-error"
              />
              <Field.ErrorText id="email-error">
                {actionData?.errors?.email}
              </Field.ErrorText>
            </Field.Root>

            {/* Passwordフィールド */}
            <Field.Root invalid={!!actionData?.errors?.password}>
              {/* <FormLabel htmlFor="password">Password</FormLabel> */}
              <Input
                placeholder="Password"
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-describedby="password-error"
              />
              <Field.ErrorText id="password-error">
                {actionData?.errors?.password}
              </Field.ErrorText>
            </Field.Root>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            {/* 汎用エラー表示 */}
            {actionData?.e && (
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Title>{actionData.e}</Alert.Title>
              </Alert.Root>
            )}

            {/* Remember me チェックボックス */}
            <Flex justify="space-between" w="full">
              <Checkbox.Root id="remember" name="remember" value="on">
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>ログインを記憶する</Checkbox.Label>
              </Checkbox.Root>
            </Flex>

            {/* ログインボタン */}
            <Button type="submit" colorScheme="blue" w="full" size="lg">
              ログイン
            </Button>

            <Text textAlign="center" mt={4}>
              アカウントをお持ちでない場合
              <Link to="/join">
                <Text as="span" color="blue.500" ml={2}>
                  登録
                </Text>
              </Link>
            </Text>
          </VStack>
        </Form>
      </Box>
    </Flex>
  );
}
