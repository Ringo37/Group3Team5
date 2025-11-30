import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  route("join", "routes/auth/join.tsx"),
  layout("routes/layout.tsx", [
    index("routes/index.tsx"),
    route("sample", "routes/sample.tsx"),
    route("debug/setup", "routes/debug/setup.tsx"),
    route("worklogformat", "routes/worklogformat.tsx"),
    route("worklog", "routes/worklog/index.tsx"),
    route("worklogformat/submit", "routes/worklogformat.submit.ts"),
    route("worklog/list", "routes/worklog/list.tsx"),
    route("worklog/complete", "routes/worklog/complete.tsx"),
    route("worklog/:id", "routes/worklog/detail.tsx"),
    route("mypage", "routes/user/mypage.tsx"),
    route("settings", "routes/user/settings.tsx"),
    route("edit-interest-tags", "routes/editInterestTags.tsx"),
  ]),
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/index.tsx"),
      route("tag", "routes/admin/tag.tsx"),
      route("accessLog", "routes/admin/accessLog.tsx"),
      route("user", "routes/admin/user.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
