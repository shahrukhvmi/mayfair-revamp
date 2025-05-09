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
        if (!isPublic && !token) {
            router.push("/");
        }else {
            setLoading(false);
        }
    }, [router.pathname, token]);

    if (loading) return <div>Loading...</div>;

    return children;

    // //  else if (isPublic && token) {
    //     router.push("/dashboard/");
    // } 
}
