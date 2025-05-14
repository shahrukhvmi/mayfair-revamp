import React, { useState, useEffect } from "react";
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

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const [isOpenDrop, setIsOpenDrop] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const { showLoginModal, closeLoginModal, openLoginModal } = useLoginModalStore();
  const { firstName } = useSignupStore();
  const [name, setUserData] = useState("");

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

  const router = useRouter();
  const { setIsPasswordReset } = usePasswordReset();
  const toggleDropdown = () => {
    setIsOpenDrop((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownMenu = document.querySelector(".dropdown-menu");
      if (dropdownMenu && !dropdownMenu.contains(event.target)) {
        setIsOpenDrop(false);
      }
    };

    if (isOpenDrop) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenDrop]);

  const handleLogout = () => {
    setIsOpenDrop(false);
    // logout();
    setIsOpenDrop(false);
    // logout();
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
    setIsPasswordReset(false)
    router.push("/login/");
  };

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;
      setUserData(user);
      setToken(user.token);
      toast.success("Login Successfully");
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      setShowLoader(false);
      closeLoginModal();
      router.push("/dashboard");
      setIsPasswordReset(true)
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;

      if (errors && typeof errors === "object") {
        Object.values(errors).forEach((err) => {
          // If error is an array (like from Laravel validation), loop through that too
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
      <LoginModal
        modes="login"
        show={showLoginModal}
        onClose={closeLoginModal}
        onLogin={(data) => {
          setShowLoader(true);
          loginMutation.mutate({ ...data, company_id: 1 });
        }}
        isLoading={showLoader}
      />
      <div className="bg-white px-4 sm:px-6 lg:px-6 flex items-center justify-between relative py-2">
        {/* Hamburger Button (only visible on mobile) */}
        <button onClick={toggleSidebar} className="text-2xl text-violet-700 sm:hidden">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Logo */}
        <div className="w-32 sm:w-40">
          <Link href="/">
            <ApplicationLogo width={140} height={80} />
          </Link>
        </div>

        {/* User Info */}
        <div className="relative">
          {/* Dropdown Trigger */}
          {token && (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <ApplicationUser className="w-10 h-10 rounded-full" />
              <span className="reg-font text-[#1C1C29] truncate">{firstName ? firstName : ""}</span>
            </div>
          )}

          {token && isOpenDrop && (
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <ul className="py-1">
                <li className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="/dashboard" onClick={toggleDropdown}>
                    My Account
                  </Link>
                </li>
                <li className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="/profile" onClick={toggleDropdown}>
                    My Profile
                  </Link>
                </li>
                <li className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            </div>
          )}

          {/* If not logged in, show login button */}
          {!token && (
            <div className="w-1/2 items-center justify-end lg:w-[100%] sm:flex hidden">
              <p className="hidden md:block text-black reg-font">Already have an account?</p>
              <span
                className="cursor-pointer inline-flex items-center px-6 py-2 bg-violet-800 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-violet-700 focus:bg-bg-violet-700 active:bg-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition ease-in-out duration-150 false ml-4"
                onClick={openLoginModal}
              >
                Login
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StepsHeader;
