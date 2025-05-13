// src/api/forgotPasswordApi.js
import Fetcher from "@/library/Fetcher";

export const ChangePassword = async ({ data }) => {
    return Fetcher.post("/password/ChangePassword", { data });
};
