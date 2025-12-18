import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// ============================================
// CONFIGURATION - FORCED REBUILD v4.0.0
// ============================================

const FORCE_REBUILD = true; // This line forces new hash
const BUILD_VERSION = "4.0.0-final";

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get the correct base URL for API calls
 * Works in browser, SSR, and local development
 */
function getBaseUrl(): string {
  // Browser environment - use current origin
  if (typeof window !== "undefined") {
    console.log("[tRPC Config] Using browser origin:", window.location.origin);
    return window.location.origin;
  }
  
  // Vercel deployment - use VERCEL_URL
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log("[tRPC Config] Using Vercel URL:", url);
    return url;
  }
  
  // Local development fallback
  console.log("[tRPC Config] Using localhost");
  return "http://localhost:5000";
}

/**
 * Redirect to login if unauthorized
 */
function redirectToLoginIfUnauthorized(error: unknown): void {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
}

// ============================================
// QUERY CLIENT SETUP
// ============================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Subscribe to query errors
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

// Subscribe to mutation errors
queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// ============================================
// TRPC CLIENT SETUP
// ============================================

const apiUrl = `${getBaseUrl()}/api/trpc`;
console.log("[tRPC Config] API URL:", apiUrl);

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// ============================================
// RENDER APP
// ============================================

console.log(`[App] Starting IAPOS v${BUILD_VERSION}`);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
