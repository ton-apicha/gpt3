import "@testing-library/jest-dom/vitest";
import "whatwg-fetch";

// No-op for jsdom environments
if (!(Element.prototype as any).scrollIntoView) {
  (Element.prototype as any).scrollIntoView = function () {};
}

// Mock relative fetches used by components during tests
const realFetch: typeof fetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : (input as URL).toString();
  if (url === "/api/models" || url.endsWith("/api/models")) {
    return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (url.endsWith("/api/integrations/ollama/models")) {
    return new Response(JSON.stringify([{ id: "llama3", label: "Llama 3", provider: "ollama", enabled: true }]), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (typeof input === "string" && input.startsWith("/")) {
    return realFetch(new URL(input, "http://localhost").toString(), init as any);
  }
  return realFetch(input as any, init as any);
}) as any;


