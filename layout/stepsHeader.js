import React, { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import ApplicationLogo from "@/config/ApplicationLogo";
import ApplicationUser from "@/config/ApplicationUser";
import Link from "next/link";

const StepsHeader = ({ isOpen, toggleSidebar }) => {
  const [isOpenDrop, setIsOpenDrop] = useState(false);

  const [name, setUserData] = useState("");

  // RTk Query Fetch user /GetUserData 🔥🔥
  // const { data } = useProfileUserDataQuery();
  const data = [];
  useEffect(() => {
    if (data) {
      const userName = data.profile?.user ?? "";
      setUserData(userName);
    }
  }, [data]);


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
    setIsOpenDrop(false); // Close the dropdown
    // logout();
    alert("logout")

  };
  const handleRemovePid = () => {
    localStorage.removeItem("previous_id")
  }
  const [impersonat, setImpersonat] = useState(null);

  useEffect(() => {
    const impersonateEmail = localStorage.getItem("impersonate_email");
    setImpersonat(impersonateEmail);
  }, []);

  const handleRemovedImpersonate = () => {
    setImpersonat(null);
    logout();

  };
  return (

    <>


      <div className="bg-white px-4 sm:px-6 lg:px-6 flex items-center justify-between relative">
        {/* Hamburger Button (only visible on mobile) */}
        <button onClick={toggleSidebar} className="text-2xl text-violet-700 sm:hidden">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Logo */}
        <div className="w-32 sm:w-40">
          <Link href="/" onClick={handleRemovePid}>
            <ApplicationLogo width={120} height={60} />

          </Link>
        </div>

        {/* User Info */}
        <div className="relative">
          {/* Dropdown Trigger */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
            {/* <img src="/images/user.png" alt="User Avatar" className="w-10 h-10 rounded-full" /> */}
            <ApplicationUser className="w-10 h-10 rounded-full" />
            <span className="reg-font text-[#1C1C29] truncate">{name && name.fname && name.lname ? `${name.fname} ${name.lname}` : ""}</span>
          </div>

          {/* Dropdown Menu */}
          {isOpenDrop && (
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <ul className="py-1">
                <li className="ligt-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="/" onClick={toggleDropdown}>My Account</Link>
                </li>
                <li className="ligt-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer">
                  <Link href="" onClick={toggleDropdown}>
                    My Profile
                  </Link>
                </li>
                <li className="ligt-font px-4 py-2 text-[#1C1C29] hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StepsHeader;
