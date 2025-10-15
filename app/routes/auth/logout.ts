import { redirect, type ActionFunctionArgs } from "react-router";

import { logout } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) =>
  logout(request);

export const loader = async () => redirect("/");
