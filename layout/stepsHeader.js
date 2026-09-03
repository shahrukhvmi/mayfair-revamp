import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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
  UserRound,
  X,
} from "lucide-react";

import ApplicationLogo from "@/config/ApplicationLogo";
import LoginModal from "@/Components/LoginModal/LoginModal";
import { Login } from "@/api/loginApi";
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
import useImpersonate from "@/store/useImpersonateStore";
import useLastBmi from "@/store/useLastBmiStore";
import lastOrderStore from "@/store/lastOrderStore";
import useLoginModalStore from "@/store/useLoginModalStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import usePasswordReset from "@/store/usePasswordReset";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
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



const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const { clearLastOrder } = lastOrderStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const closeTimer = useRef(null);
  const accountMenuRef = useRef(null);


  const supportsHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAnchorEl(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

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
    const getEvidence = async () => {
      try {
        const res = await GetPrescriptionEvidence({ token });
        setExplainenationEvidence(res?.data?.require_evidence);
        setExplainenationEvidenceDetails(res?.data);
      } catch (error) {
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

      <header className="sticky top-0 z-40 h-[66px] w-full border-b border-[#47317c]/[0.07] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
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
              <div
                ref={accountMenuRef}
                className="relative"
                onMouseEnter={() => {
                  if (!supportsHover()) return;
                  clearTimeout(closeTimer.current);
                  setAnchorEl(true);
                }}
                onMouseLeave={() => {
                  if (!supportsHover()) return;
                  closeTimer.current = setTimeout(() => setAnchorEl(null), 150);
                }}
              >
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => {
                    if (supportsHover()) return;
                    clearTimeout(closeTimer.current);
                    setAnchorEl((current) => current ? null : true);
                  }}
                  aria-expanded={Boolean(anchorEl)}
                  aria-haspopup="menu"
                  className="group flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 transition-all duration-150 hover:bg-[#47317c]/[0.04]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#47317c]">
                    <UserRound size={16} strokeWidth={2} className="text-white" />
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="inter-medium-font block max-w-[150px] truncate text-[14px] leading-4 text-slate-900 capitalize">
                      {displayName}
                    </span>
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2.2}
                    className={`ml-0.5 text-[#47317c]/70 transition-transform duration-200 ${Boolean(anchorEl) ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {Boolean(anchorEl) && (
                  <div className="absolute right-0 top-full z-50 w-[250px] overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white shadow-[0_16px_40px_rgba(71,49,124,0.12)]">
                    {/* Account summary */}
                    <div className="border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-4 py-4">
                      <p className="inter-medium-font m-0 text-[10px] uppercase tracking-[0.11em] text-slate-500">
                        Logged in as
                      </p>
                      <p className="inter-semibold-font mt-1.5 truncate text-[14px] text-slate-900 capitalize">
                        {displayName}
                      </p>
                      <p title={email} className="inter-reg-font mt-0.5 truncate text-[12px] text-slate-500">
                        {email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => { router.push("/dashboard"); setAnchorEl(null); }}
                        className="inter-medium-font flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-3 text-[13px] text-slate-700 transition-colors hover:bg-[#47317c]/[0.05] hover:text-[#47317c]"
                      >
                        <LayoutDashboard size={16} strokeWidth={2} className="text-[#47317c]" />
                        My Account
                      </button>

                      <button
                        type="button"
                        onClick={() => { router.push("/orders"); setAnchorEl(null); }}
                        className="inter-medium-font flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-3 text-[13px] text-slate-700 transition-colors hover:bg-[#47317c]/[0.05] hover:text-[#47317c]"
                      >
                        <ShoppingBag size={16} strokeWidth={2} className="text-[#47317c]" />
                        My Orders
                      </button>

                      <div className="mx-2 my-1 h-px bg-[#47317c]/[0.07]" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inter-medium-font flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-3 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={16} strokeWidth={2} className="text-red-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!pathname?.startsWith("/login") && !token && (
              <div className="flex items-center gap-3">
                <span className="mont-medium-font hidden text-[14px] text-slate-500 sm:block">
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={openLoginModal}
                  className="
              mont-medium-font inline-flex min-h-[40px]
              items-center gap-2 rounded-[11px]
              bg-[#47317c] px-4 py-2
              text-[14px] text-white
              transition-all duration-200
              hover:bg-[#392765]
              active:scale-[0.98]  cursor-pointer
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
