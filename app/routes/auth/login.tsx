import { Button, Input } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import {
  Form,
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

export const meta = () => [{ title: "Login" }];

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
    <div className="flex h-screen flex-col justify-center items-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <input type="hidden" name="_action" value="user-pass" />
          <div>
            <div className="mt-1">
              <Input
                placeholder="Email"
                ref={emailRef}
                id="email"
                required
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mt-1">
              <Input
                placeholder="Password"
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          {actionData?.e ? (
            <div className=" text-red-700">{actionData.e}</div>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </Form>
      </div>
    </div>
  );
}
