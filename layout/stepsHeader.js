import React, { useState } from "react";
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

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showLoginModal, closeLoginModal, openLoginModal } = useLoginModalStore();

  const [showLoader, setShowLoader] = useState(false);

  const { clearBmi } = useBmiStore();
  const { clearCheckout } = useCheckoutStore();
  const { clearConfirmationInfo } = useConfirmationInfoStore();
  const { clearGpDetails } = useGpDetailsStore();
  const { clearMedicalInfo } = useMedicalInfoStore();
  const { clearPatientInfo } = usePatientInfoStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { clearAuthUserDetail } = useAuthUserDetailStore();
  const { token, clearToken, setToken } = useAuthStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearProductId } = useProductId();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { firstName, setFirstName, setLastName, setEmail, clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } = useSignupStore();
  const pathname = usePathname();

  const router = useRouter();
  const { setIsPasswordReset } = usePasswordReset();

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
    router.push("/login");
  };

  const validPathDashboard =
    pathname === "/dashboard/" || pathname === "/profile/" || pathname === "/orders/" || pathname === "/address/" || pathname === "/change-password/";

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;
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

  return (
    <>
      <header className="bg-white w-full py-2 sm:px-14 px-4">
        <div className="sm:px-6 lg:px-6 flex items-center justify-between py-2">
          {/* Hamburger (Mobile) */}
          {validPathDashboard && (
            <button onClick={toggleSidebar} className="text-2xl text-violet-700 sm:hidden">
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          )}

          {/* Logo */}
          <div className="w-32 sm:w-40">
            <Link href="/">
              <ApplicationLogo width={140} height={80} />
            </Link>
          </div>
          

          {/* User Info or Login CTA */}
          <div className="relative">
            {token && (
              <>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <ApplicationUser className="w-10 h-10 rounded-full" />
                  <span className="reg-font text-[#1C1C29] truncate">{firstName ?? ""}</span>
                  <IoIosArrowDown
                    className={`text-gray-700 transform transition-transform duration-200 ${Boolean(anchorEl) ? "rotate-180" : ""}`}
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
                      router.push("/profile");
                      setAnchorEl(null);
                    }}
                    className="reg-font"
                  >
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className="reg-font">
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}

            {!pathname?.startsWith("/login") && !token && (
              <div className="w-1/2 items-center justify-end lg:w-[100%] sm:flex">
                <p className="md:block text-black reg-font lg:w-[100%] sm:flex hidden">Already have an account?</p>
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
