import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./model_api/openapi.json",
  output: "./app/api",
});
