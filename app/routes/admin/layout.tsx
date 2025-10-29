import { Role } from "@prisma/client";
import {
  redirect,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
} from "react-router";

import Header from "~/components/header";
import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  if (user.role !== Role.ADMIN) {
    return redirect("/");
  }
  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
}
