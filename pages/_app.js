import "@/styles/globals.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/styles/fonts.css";

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
