import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  layout("routes/layout.tsx", [
    route("sample", "routes/sample.tsx"),
    route("worklogformat", "routes/worklogformat.tsx"),
    route("mypage", "routes/user/mypage.tsx"),
    route("settings", "routes/user/settings.tsx"),
    route("edit-interest-tags", "routes/edit_interest_tags.tsx"),
  ]),
] satisfies RouteConfig;
