import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  route("join", "routes/auth/join.tsx"),
  layout("routes/layout.tsx", [
    route("sample", "routes/sample.tsx"),
    route("worklogformat", "routes/worklogformat.tsx"),
    route("mypage", "routes/user/mypage.tsx"),
    route("settings", "routes/user/settings.tsx"),
    route("edit-interest-tags", "routes/editInterestTags.tsx"),
  ]),
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/index.tsx"),
      route("tag", "routes/admin/tag.tsx"),
      route("category", "routes/admin/category.tsx"),
      route("accessLog", "routes/admin/accessLog.tsx"),
      route("user", "routes/admin/user.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
