import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import { requireUser } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export default function Mypage() {
  const { user } = useLoaderData<typeof loader>();
  return <>{user.name}</>;
}
