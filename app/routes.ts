import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/auth/login.tsx"),
  route("logout", "routes/auth/logout.ts"),
  layout("routes/layout.tsx", [
    index("routes/index.tsx"),
    route("sample", "routes/sample.tsx"),
    route("worklogformat", "routes/worklogformat.tsx"),
  ]),
] satisfies RouteConfig;
