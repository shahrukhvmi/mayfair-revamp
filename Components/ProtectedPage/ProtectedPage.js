import { useRouter } from "next/router";
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function ProtectedPage({ children }) {
  const { token, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token]);

  if (!hasHydrated || !token) return null;

  return children;
}
