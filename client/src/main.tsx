import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./styles/mobile.css";
import "./styles/print.css";
import "./styles/animations.css";
import { performanceMonitor } from "./lib/performance";
import { registerServiceWorker } from "./lib/serviceWorker";
import { toast } from "sonner";

// Initialize performance monitoring
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    performanceMonitor.reportMetrics();
    
    // Service worker disabled temporarily for mobile compatibility
    // TODO: Re-enable after fixing mobile Safari compatibility
    // registerServiceWorker({
    //   onSuccess: () => {
    //     console.log('[PWA] App is ready for offline use');
    //   },
    //   onUpdate: () => {
    //     toast.info('New version available!', {
    //       description: 'Refresh to update the app',
    //       action: {
    //         label: 'Refresh',
    //         onClick: () => window.location.reload(),
    //       },
    //     });
    //   },
    //   onOffline: () => {
    //     toast.warning('You are offline', {
    //       description: 'Some features may be limited',
    //     });
    //   },
    //   onOnline: () => {
    //     toast.success('Back online!');
    //   },
    // });
  });
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = "/";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
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

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
