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
    if (!hasHydrated || !router.isReady) return; // Zustand aur URL query dono ka wait karo

    const path = router.pathname;
    const isPublic = publicRoutes.includes(path);
    const isLogin = path === loginRoute;

    if (!isPublic && !token) {
      router.push("/login");
    } else if (
      isLogin &&
      token &&
      (router.query.review === "true" || review)
    ) {
      const orderId = router.query.order_id;
      router.replace(
        orderId
          ? { pathname: "/review", query: { order_id: orderId } }
          : "/review",
      );
    } else if (isLogin && token) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }, [router.isReady, router.pathname, router.query.order_id, router.query.review, token, review, hasHydrated]);

  if (loading)
    return <PageLoader />;

  return children;

  // //  else if (isPublic && token) {
  //     router.push("/dashboard/");
  // }
}
