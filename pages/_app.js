import "@/styles/globals.css";
import queryClient from "@/utils/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import "@/styles/fonts.css";
import { Toaster } from "react-hot-toast"; // <-- ✅ YEH IMPORT KARO

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      
      {/* ✅ Toaster yehin lagana hai taake saari app me kaam kare */}
      <Toaster position="bottom-center" reverseOrder={false} containerClassName="reg-font" />
    </QueryClientProvider>
  );
}
