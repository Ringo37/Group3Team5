import type { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { getUserById, verifyLogin } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");
const USER_SESSION_KEY = "userId";

// Create a session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production",
  },
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return
export const authenticator = new Authenticator<User>();

async function login(email: string, password: string): Promise<User> {
  // Verify credentials
  const user = await verifyLogin(email, password);
  // Return user data or throw an error
  if (user) {
    return user;
  } else {
    throw new Error("Invalid email or password");
  }
}

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    return await login(email, password);
  }),
  "user-pass",
);

export async function getSession(request: Request) {
  const cookie = request.headers.get("cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request,
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
