import "@/styles/globals.css";
import "@/styles/fonts.css";
import "@/styles/paymentpage.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import RouteGuard from "@/utils/RouteGuard";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { initMayfairAnalytics } from "@/library/mayfairAnalytics";

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (window._cl) window._cl.pageview();
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  // Visitor ID, first/last touch, sessions, page views and consultation stages
  // come from the Mayfair Analytics plugin's tracker (shared with WordPress),
  // which also keeps localStorage "mayfair_attribution" up to date.
  useEffect(() => initMayfairAnalytics(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerClassName="reg-font"
      />
    </QueryClientProvider>
  );
}
