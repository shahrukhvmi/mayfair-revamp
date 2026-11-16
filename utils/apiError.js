import toast from "react-hot-toast";

// Shows a toast for an API error. On 401 it clears the token, sends the patient
// to /login and returns true so the caller can close its UI.
export const handleApiError = (error, { clearToken, router } = {}) => {
  const status = error?.response?.status;

  if (status === 401) {
    toast.error("Session Expired");
    clearToken?.();
    router?.replace?.("/login");
    return true;
  }

  if (!error?.response) {
    toast.error("Connection problem. Please check your internet and try again.");
    return false;
  }

  const data = error.response.data;
  const firstFieldError =
    data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat()[0]
      : null;
  toast.error(
    firstFieldError ||
      data?.message ||
      "Something went wrong. Please try again.",
  );
  return false;
};

export default handleApiError;
