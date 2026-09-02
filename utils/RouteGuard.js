import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loginRoute, publicRoutes } from "./routes";
import useAuthStore from "@/store/authStore";
import PageLoader from "@/Components/PageLoader/PageLoader";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const { token, review, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return; // Zustand hydrate hone ka wait karo

    const path = router.pathname;
    const isPublic = publicRoutes.includes(path);
    const isLogin = path === loginRoute;

    const reviewParam =
      new URLSearchParams(window.location.search).get("review") === "true";

    if (!isPublic && !token) {
      router.push("/login");
    } else if (isLogin && token && (review || reviewParam)) {
      router.push("/review");
    } else if (isLogin && token) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [router.pathname, token, hasHydrated]);

  if (loading)
    return <PageLoader />;

  return children;

  // //  else if (isPublic && token) {
  //     router.push("/dashboard/");
  // }
}