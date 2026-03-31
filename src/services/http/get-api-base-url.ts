import { siteConfig } from "@/lib/site";

export function getApiBaseUrl() {
  return siteConfig.apiUrl.replace(/\/$/, "");
}
