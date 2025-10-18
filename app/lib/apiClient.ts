import { createClient } from "~/api/client";

export const apiClient = createClient({
  baseUrl: "http://localhost:8000",
});
