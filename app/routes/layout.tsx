import { Outlet } from "react-router";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import Header from "~/components/header";
import { getUserById } from "~/models/user.server";
import { getUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    return { user: null };
  }
  const user = await getUserById(userId);
  return { user };
}

export default function Layout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <Header user={user} />
      <Outlet />
    </>
  );
}
