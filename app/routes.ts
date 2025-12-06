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
    route("worklogformat", "routes/worklogformat/index.tsx"),
    route("worklogformat/worklogpost", "routes/worklogformat/worklogpost.tsx"),
    route("worklogformat/worklogpost/submit", "routes/worklogformat/worklogpost.submit.ts"),
    route("worklogformat/list", "routes/worklogformat/list.tsx"),
    route("worklogformat/complete", "routes/worklogformat/complete.tsx"),
    route("worklogformat/:id", "routes/worklogformat/detail.tsx"),
    route("worklogformat/:id/edit", "routes/worklogformat/edit.tsx"),
    route("mypage", "routes/user/mypage.tsx"),
    route("settings", "routes/user/settings.tsx"),
    route("edit-interest-tags", "routes/editInterestTags.tsx"),
    route("explore", "routes/knowhow/explore.tsx"),
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
