import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { publicRoutes } from "./routes";
import useAuthStore from "@/store/authStore";

export default function RouteGuard({ children }) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const path = router.pathname;
        const isPublic = publicRoutes.includes(path);
        console.log(isPublic, "isPublic")
        if (!isPublic && !token) {
            router.push("/");
        } else if (isPublic && token && path === "/login") {
            router.push("/dashboard/");
        } else {
            setLoading(false);
        }
    }, [router.pathname, token]);

    if (loading) return <div>Loading...</div>;

    return children;
}
