import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import ApplicationLogo from "@/config/ApplicationLogo";
import ApplicationUser from "@/config/ApplicationUser";
import Link from "next/link";
import useSignupStore from "@/store/signupStore";
import useAuthStore from "@/store/authStore";

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const [isOpenDrop, setIsOpenDrop] = useState(false);

  const { firstName } = useSignupStore();
  const [name, setUserData] = useState("");

  // RTk Query Fetch user /GetUserData 🔥🔥
  // const { data } = useProfileUserDataQuery();
  // const data = [];
  // useEffect(() => {
  //   if (data) {
  //     const userName = data.profile?.user ?? "";
  //     setUserData(userName);
  //   }
  // }, [data]);

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
    alert("logout");
  };

  const handleRemovePid = () => {
    localStorage.removeItem("previous_id");
  };

  const [impersonat, setImpersonat] = useState(null);

  useEffect(() => {
    const impersonateEmail = localStorage.getItem("impersonate_email");
    setImpersonat(impersonateEmail);
  }, []);

  const handleRemovedImpersonate = () => {
    setImpersonat(null);
    logout();
  };

  const { token } = useAuthStore();

  return (
    <>
      <div className="bg-white px-4 sm:px-6 lg:px-6 flex items-center justify-between relative py-2">
        {/* Hamburger Button (only visible on mobile) */}
        <button onClick={toggleSidebar} className="text-2xl text-violet-700 sm:hidden">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
    
        {/* Logo */}
        <div className="w-32 sm:w-40">
          <Link href="/" onClick={handleRemovePid}>
            <ApplicationLogo width={140} height={80} />
          </Link>
        </div>

        {/* User Info */}
        <div className="relative">
          {/* Dropdown Trigger */}
          {token && <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
            <ApplicationUser className="w-10 h-10 rounded-full" />
            <span className="reg-font text-[#1C1C29] truncate">{firstName ? firstName : ""}</span>
          </div>
          }

          {token && isOpenDrop && (
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <ul className="py-1">
                <li className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="/dashboard/" onClick={toggleDropdown}>
                    My Account
                  </Link>
                </li>
                <li className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="my-profile" onClick={toggleDropdown}>
                    My Profile
                  </Link>
                </li>
                <li
                  className="reg-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}

          {/* If not logged in, show login button */}
          {!token && (
            <div className="w-1/2 items-center justify-end lg:w-[100%] sm:flex hidden">
              <p className="hidden md:block text-black reg-font">Already have an account?</p>
              <a
                className="inline-flex items-center px-6 py-2 bg-violet-800 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-violet-700 focus:bg-bg-violet-700 active:bg-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition ease-in-out duration-150 false ml-4"
                href="/login/"
              >
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StepsHeader;
