import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Menu as MuiMenu, MenuItem } from "@mui/material";
import toast from "react-hot-toast";
import {
  ChevronDown,
  Copy,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  ShoppingBag,
  User2,
  UserCheck,
  X,
} from "lucide-react";

import ApplicationLogo from "@/config/ApplicationLogo";
import ApplicationUser from "@/config/ApplicationUser";
import LoginModal from "@/Components/LoginModal/LoginModal";
import { Login } from "@/api/loginApi";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";
import { GetIdVerification } from "@/api/IdVerificationApi";
import { GetPrescriptionEvidence } from "@/api/PrescriptionEvidenceApi";
import Fetcher from "@/library/Fetcher";
import useAbandonCardStore from "@/store/abandonCardStore";
import useAuthStore from "@/store/authStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useBmiStore from "@/store/bmiStore";
import useCartStore from "@/store/useCartStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useImpersonate from "@/store/useImpersonateStore";
import useLastBmi from "@/store/useLastBmiStore";
import lastOrderStore from "@/store/lastOrderStore";
import useLoginModalStore from "@/store/useLoginModalStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import usePasswordReset from "@/store/usePasswordReset";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import useReorder from "@/store/useReorderStore";
import useReturning from "@/store/useReturningPatient";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useSignupStore from "@/store/signupStore";
import useUserDataStore from "@/store/userDataStore";

const dashboardRoutes = [
  "/dashboard/",
  "/orders/",
  "/address/",
  "/change-password/",
  "/order-detail/",
  "/profile/",
  "/weight-loss-journey/",
];

const menuItemSx = {
  borderRadius: "12px",
  fontFamily: "var(--mont-medium)",
  fontSize: "12px",
  color: "#1e293b",
  gap: "11px",
  minHeight: "44px",
  px: 1.5,
  "&:hover": {
    backgroundColor: "rgba(71,49,124,0.06)",
    color: "#47317c",
  },
};

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const { clearLastOrder } = lastOrderStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();

  useCartStore();

  const { clearBmi } = useBmiStore();
  const { clearCheckout } = useCheckoutStore();
  const { clearConfirmationInfo } = useConfirmationInfoStore();
  const { clearGpDetails } = useGpDetailsStore();
  const { clearMedicalInfo } = useMedicalInfoStore();
  const { clearPatientInfo } = usePatientInfoStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();

  const { authUserDetail, clearAuthUserDetail, setAuthUserDetail } =
    useAuthUserDetailStore();

  const { token, clearToken, setToken, setIsImpersonationLogout } =
    useAuthStore();

  const { clearShipping, clearBilling, setBillingSameAsShipping } =
    useShippingOrBillingStore();

  const { clearProductId } = useProductId();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { setIsReturningPatient } = useReturning();
  const { impersonate, setImpersonate } = useImpersonate();
  const { reorder } = useReorder();
  const { imageUploaded, setImageUploaded } = useImageUploadStore();

  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();

  const { setExplainenationEvidence, setExplainenationEvidenceDetails } =
    useExplanationEvidenceStore();

  const {
    firstName,
    setFirstName,
    setLastName,
    setEmail,
    email,
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
  } = useSignupStore();

  const pathname = usePathname();
  const normalizedPathname = pathname?.endsWith("/")
    ? pathname
    : `${pathname || "/"}/`;

  const router = useRouter();
  const { setIsPasswordReset, setShowResetPassword } = usePasswordReset();
  const { abandonCard, clearAbandonCard } = useAbandonCardStore();

  const isDashboardRoute = dashboardRoutes.includes(normalizedPathname);

  const clearUserSession = () => {
    clearBmi();
    clearCheckout();
    clearConfirmationInfo();
    clearGpDetails();
    clearMedicalInfo();
    clearPatientInfo();
    clearBilling();
    clearShipping();
    clearAuthUserDetail();
    clearMedicalQuestions();
    clearConfirmationQuestions();
    clearProductId();
    clearLastBmi();
    clearUserData();
    clearFirstName();
    clearLastName();
    clearEmail();
    clearConfirmationEmail();
    setBillingSameAsShipping(false);
    setIsReturningPatient(false);
    clearLastOrder();
    clearAbandonCard();
  };

  const handleLogout = () => {
    setAnchorEl(null);
    clearUserSession();
    clearToken();
    setIsPasswordReset(true);
    setShowResetPassword(true);
    setImpersonate(false);
    router.push("/login");
  };

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;

      setAuthUserDetail(user);
      setToken(user.token);
      toast.success("Login Successfully");
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      setShowLoader(false);
      closeLoginModal();
      setFirstName(user?.fname);
      setLastName(user?.lname);
      setEmail(user?.email);

      if (abandonCard?.type === "abandoned-cart") {
        router.push("/gathering-data");
      } else {
        router.push("/dashboard");
      }

      setIsPasswordReset(false);
      setShowResetPassword(user?.show_password_reset);
      setIsReturningPatient(user?.isReturning);
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;

      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((err) => {
          if (Array.isArray(err)) {
            err.forEach((message) => toast.error(message));
          } else {
            toast.error(err);
          }
        });
      }

      setShowLoader(false);
    },
  });

  const handleRemovedImpersonate = () => {
    setAnchorEl(null);
    clearUserSession();
    setIsPasswordReset(true);
    setShowResetPassword(true);
    clearToken();
    setIsImpersonationLogout(true);
    setImpersonate(false);
    window.location.href =
      "https://app.mayfairweightlossclinic.co.uk/dashboard";
  };

  const redirectTo = isDashboardRoute ? "/dashboard" : "/";

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ reorder });
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  useEffect(() => {
    const fetchIdStatus = async () => {
      try {
        const res = await GetIdVerification({ reorder });
        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch ID status:", error);
      }
    };

    fetchIdStatus();
  }, [reorder]);

  useEffect(() => {
    const getEvidence = async () => {
      try {
        const res = await GetPrescriptionEvidence({ token });
        setExplainenationEvidence(res?.data?.require_evidence);
        setExplainenationEvidenceDetails(res?.data);
      } catch (error) {
        console.error("Failed to fetch prescription evidence status:", error);
      }
    };

    getEvidence();
  }, []);

  const displayName = authUserDetail?.fname?.trim()
    ? authUserDetail.fname
    : firstName;

  return (
    <>
      {/* {(!imageUploaded || !idVerificationUpload) && isDashboardRoute && (
        <UploadTopPrompt />
      )} */}

      {impersonate && (
        <div className="mont-medium-font flex flex-col items-center justify-center gap-2 bg-red-500 px-4 py-2.5 text-center text-[12px] text-white sm:flex-row">
          <div className="flex items-center gap-2">
            <Copy size={15} strokeWidth={2} />
            <span>You are impersonating another user.</span>
          </div>

          <button
            type="button"
            className="mont-semibold-font flex cursor-pointer items-center gap-1.5 text-[11px] underline transition-colors hover:text-red-100"
            onClick={handleRemovedImpersonate}
          >
            <UserCheck size={14} strokeWidth={2} />
            Stop impersonation
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-[#47317c]/[0.07] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] w-full max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
          {/* Left side */}
          <div className="flex min-w-0 items-center gap-3">
            {isDashboardRoute && (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-[11px] border border-[#47317c]/10
            bg-[#47317c]/[0.045] text-[#47317c]
            transition-all duration-200
            hover:border-[#47317c]/20
            hover:bg-[#47317c]/[0.08]
            active:scale-[0.96]
            lg:hidden
          "
              >
                {isOpen ? (
                  <X size={17} strokeWidth={2.2} />
                ) : (
                  <MenuIcon size={17} strokeWidth={2.2} />
                )}
              </button>
            )}

            <Link href={redirectTo} className="flex shrink-0 items-center">
              <ApplicationLogo width={148} height={56} />
            </Link>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {!pathname?.startsWith("/login") && token && (
              <>
                <button
                  type="button"
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  aria-haspopup="menu"
                  aria-expanded={Boolean(anchorEl)}
                  className={`
              group flex min-h-[44px] items-center gap-2
              rounded-[13px] border bg-white
              py-1.5 pl-1.5 pr-2
              transition-all duration-200

              ${
                Boolean(anchorEl)
                  ? `
                    border-[#47317c]/20
                    bg-[#47317c]/[0.025]
                  `
                  : `
                    border-[#47317c]/10
                    hover:border-[#47317c]/20
                    hover:bg-[#47317c]/[0.02]
                  `
              }
            `}
                >
                  <ApplicationUser className="h-8 w-8 rounded-[10px] object-cover ring-1 ring-[#47317c]/10" />

                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="mont-medium-font block max-w-[130px] truncate text-[13px] leading-4 text-slate-900">
                      {displayName}
                    </span>
                  </span>

                  <ChevronDown
                    size={13}
                    strokeWidth={2.2}
                    className={`
                ml-0.5 text-[#47317c]/70
                transition-transform duration-200 cursor-pointer

                ${Boolean(anchorEl) ? "rotate-180" : ""}
              `}
                  />
                </button>

                <MuiMenu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  PaperProps={{
                    sx: {
                      width: 250,
                      mt: 1,
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(71,49,124,0.1)",
                      boxShadow: "0 16px 40px rgba(71,49,124,0.12)",
                      backgroundImage: "none",
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      p: 0,
                    },
                  }}
                >
                  {/* Account summary */}
                  <div className="border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-4 py-3.5">
                    <p className="mont-medium-font m-0 text-[8px] uppercase tracking-[0.11em] text-slate-800">
                      Logged in as
                    </p>

                    <p className="mont-medium-font mt-1 truncate text-[13px] text-slate-900">
                      {displayName}
                    </p>

                    <p
                      title={email}
                      className="mont-reg-font mt-0.5 truncate text-[12px] text-slate-500"
                    >
                      {email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <MenuItem
                      onClick={() => {
                        router.push("/dashboard");
                        setAnchorEl(null);
                      }}
                      sx={{
                        minHeight: 42,
                        borderRadius: "10px",
                        gap: "10px",
                        px: "10px",
                        fontFamily: "var(--mont-medium)",
                        fontSize: "10.5px",
                        color: "#334155",

                        "&:hover": {
                          backgroundColor: "rgba(71,49,124,0.05)",
                          color: "#47317c",
                        },
                      }}
                    >
                      <LayoutDashboard
                        size={15}
                        strokeWidth={2}
                        color="#47317c"
                      />
                      My Account
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        router.push("/orders");
                        setAnchorEl(null);
                      }}
                      sx={{
                        minHeight: 42,
                        borderRadius: "10px",
                        gap: "10px",
                        px: "10px",
                        fontFamily: "var(--mont-medium)",
                        fontSize: "10.5px",
                        color: "#334155",

                        "&:hover": {
                          backgroundColor: "rgba(71,49,124,0.05)",
                          color: "#47317c",
                        },
                      }}
                    >
                      <ShoppingBag size={15} strokeWidth={2} color="#47317c" />
                      My Orders
                    </MenuItem>

                    <div className="mx-2 my-1 h-px bg-[#47317c]/[0.07]" />

                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        minHeight: 42,
                        borderRadius: "10px",
                        gap: "10px",
                        px: "10px",
                        fontFamily: "var(--mont-medium)",
                        fontSize: "10.5px",
                        color: "#dc2626",

                        "&:hover": {
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                        },
                      }}
                    >
                      <LogOut size={15} strokeWidth={2} color="#ef4444" />
                      Logout
                    </MenuItem>
                  </div>
                </MuiMenu>
              </>
            )}

            {!pathname?.startsWith("/login") && !token && (
              <div className="flex items-center gap-3">
                <span className="mont-reg-font hidden text-[10.5px] text-slate-500 sm:block">
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={openLoginModal}
                  className="
              mont-medium-font inline-flex min-h-[40px]
              items-center gap-2 rounded-[11px]
              bg-[#47317c] px-4 py-2
              text-[10.5px] text-white
              transition-all duration-200
              hover:bg-[#392765]
              active:scale-[0.98]
            "
                >
                  <User2 size={14} strokeWidth={2.2} />
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        modes="login"
        show={showLoginModal}
        onClose={closeLoginModal}
        onLogin={(data) => {
          setEmail(data.email);
          setShowLoader(true);
          loginMutation.mutate({ ...data, company_id: 1 });
        }}
        isLoading={showLoader}
      />
    </>
  );
};

export default StepsHeader;
