import React, { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import ApplicationLogo from "@/config/ApplicationLogo";
import ApplicationUser from "@/config/ApplicationUser";
import Link from "next/link";
import useSignupStore from "@/store/signupStore";
import useAuthStore from "@/store/authStore";
import LoginModal from "@/Components/LoginModal/LoginModal";
import useLoginModalStore from "@/store/useLoginModalStore";
import { Login } from "@/api/loginApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import { useRouter } from "next/router";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useCheckoutStore from "@/store/checkoutStore";
import useBmiStore from "@/store/bmiStore";
import usePasswordReset from "@/store/usePasswordReset";
import { usePathname } from "next/navigation";
import useProductId from "@/store/useProductIdStore";
import { Menu, MenuItem } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import useLastBmi from "@/store/useLastBmiStore";
import useUserDataStore from "@/store/userDataStore";
import useImpersonate from "@/store/useImpersonateStore";
import useReturning from "@/store/useReturningPatient";
import UploadTopPrompt from "@/Components/UploadTopPrompt/UploadTopPrompt";
import useReorder from "@/store/useReorderStore";
import useCartStore from "@/store/useCartStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();

  const [showLoader, setShowLoader] = useState(false);
  const { orderId } = useCartStore();
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

  const {
    firstName,
    setFirstName,
    setLastName,
    setEmail,
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
  } = useSignupStore();
  const pathname = usePathname();

  const router = useRouter();
  const { setIsPasswordReset, setShowResetPassword } = usePasswordReset();

  const handleLogout = () => {
    setAnchorEl(null);
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
    clearToken();
    setIsPasswordReset(true);
    clearProductId();
    clearLastBmi();
    clearUserData();
    clearFirstName();
    clearLastName();
    clearEmail();
    clearConfirmationEmail();
    setShowResetPassword(true);
    setImpersonate(false);
    setBillingSameAsShipping(false);
    setIsReturningPatient(false);
    router.push("/login");
  };

  const validPathDashboard =
    pathname === "/dashboard/" ||
    pathname === "/profile/" ||
    pathname === "/orders/" ||
    pathname === "/address/" ||
    pathname === "/change-password/";

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;
      setAuthUserDetail(user);
      console.log(data?.data?.data, "data?.data?.data");
      setToken(user.token);
      toast.success("Login Successfully");
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      setShowLoader(false);
      closeLoginModal();
      setFirstName(data?.data?.data?.fname);
      setLastName(data?.data?.data?.lname);
      setEmail(data?.data?.data?.email);
      router.push("/dashboard");
      setIsPasswordReset(false);
      setShowResetPassword(data?.data?.data?.show_password_reset);
      setIsReturningPatient(user?.isReturning);
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;
      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((err) => {
          if (Array.isArray(err)) {
            err.forEach((msg) => toast.error(msg));
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
    setIsPasswordReset(true);
    clearProductId();
    clearLastBmi();
    clearUserData();
    clearFirstName();
    clearLastName();
    clearEmail();
    clearConfirmationEmail();
    setShowResetPassword(true);
    clearToken();
    setIsImpersonationLogout(true);
    setImpersonate(false);
    setBillingSameAsShipping(false);
    setIsReturningPatient(false);
    window.location.href =
      "https://staging.mayfairweightlossclinic.co.uk/dashboard";
  };

  const specialRoutes = [
    "/dashboard/",
    "/orders/",
    "/address/",
    "/change-password/",
    "/order-detail/",
    "/profile/",
  ];

  const redirectTo = specialRoutes.includes(pathname) ? "/dashboard" : "/";
  console.log(reorder, "reorderreorder");

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ reorder });
        console.log("Image Upload Response", res);
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  return (
    <>
      {!imageUploaded && specialRoutes.includes(pathname) && (
        <UploadTopPrompt />
      )}

      {impersonate && (
        <div className="bg-gray-100">
          <div className="bg-red-500 text-white text-center p-2 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm sm:text-base reg-font">
            <div className="flex items-center gap-2">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="text-xl"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H8v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V16z"></path>
              </svg>
              <span>You are impersonating another user.</span>
            </div>
            <button
              className="ml-0 sm:ml-2 underline flex items-center gap-1 text-xs sm:text-sm reg-font cursor-pointer"
              onClick={handleRemovedImpersonate}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="text-xl"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H8v-1.5c0-1.99 4-3 6-3s6 1.01 6 3V16z"></path>
              </svg>
              <span>Stop Impersonation</span>
            </button>
          </div>
        </div>
      )}
      <header className="bg-white w-full py-2 sm:px-14 px-4 relative">
        <div className="sm:px-6 lg:px-6 flex items-center justify-between py-2">
          {/* Hamburger (Mobile) */}
          {validPathDashboard && (
            <button
              onClick={toggleSidebar}
              className="text-2xl text-violet-700 sm:hidden"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          )}

          {/* Logo */}
          <div className="w-32 sm:w-40">
            <Link href={redirectTo}>
              <ApplicationLogo width={140} height={80} />
            </Link>
          </div>

          {/* User Info or Login CTA */}
          <div className="relative">
            {!pathname?.startsWith("/login") && token && (
              <>
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <ApplicationUser className="w-10 h-10 rounded-full" />
                  <span className="reg-font text-[#1C1C29] truncate">
                    {authUserDetail?.fname?.trim()
                      ? authUserDetail.fname
                      : firstName}
                  </span>
                  <IoIosArrowDown
                    className={`text-gray-700 transform transition-transform duration-200 ${
                      Boolean(anchorEl) ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </div>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{ style: { width: 200 } }}
                >
                  <MenuItem
                    onClick={() => {
                      router.push("/dashboard");
                      setAnchorEl(null);
                    }}
                    className="reg-font"
                  >
                    My Account
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      router.push("/orders");
                      setAnchorEl(null);
                    }}
                    className="reg-font"
                  >
                    My Orders
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className="reg-font">
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}

            {!pathname?.startsWith("/login") && !token && (
              <div className="w-1/2 items-center justify-end lg:w-[100%] sm:flex">
                <p className="md:block text-black reg-font lg:w-[100%] sm:flex hidden">
                  Already have an account?
                </p>
                <span
                  className="cursor-pointer inline-flex items-center px-6 py-2 bg-primary border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-violet-700 focus:bg-bg-violet-700 active:bg-primary focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition ease-in-out duration-150 ml-4"
                  onClick={openLoginModal}
                >
                  Login
                </span>
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
