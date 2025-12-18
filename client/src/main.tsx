import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// Build version
const BUILD_VERSION = "4.1.0-urlfix";

/**
 * Get the correct base URL for API calls
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    console.log("[tRPC] Browser origin:", origin);
    return origin;
  }
  
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log("[tRPC] Vercel URL:", url);
    return url;
  }
  
  console.log("[tRPC] Localhost");
  return "http://localhost:5000";
}

function redirectToLoginIfUnauthorized(error: unknown): void {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (error.message === UNAUTHED_ERR_MSG) {
    window.location.href = getLoginUrl();
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.query.state.error);
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    redirectToLoginIfUnauthorized(event.mutation.state.error);
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

// CRITICAL: Construct URL as a proper URL object first to validate
const baseUrl = getBaseUrl();
const apiPath = "/api/trpc";
const fullUrl = `${baseUrl}${apiPath}`;

// Validate URL construction
try {
  new URL(fullUrl);
  console.log("[tRPC] URL validated:", fullUrl);
} catch (err) {
  console.error("[tRPC] Invalid URL:", fullUrl, err);
  throw new Error(`Invalid tRPC URL: ${fullUrl}`);
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: fullUrl,
      transformer: superjson,
      fetch(url, options) {
        console.log("[tRPC] Fetching:", url);
        return globalThis.fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

console.log(`[App] IAPOS v${BUILD_VERSION} initialized`);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
