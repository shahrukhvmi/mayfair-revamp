"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { HiLocationMarker, HiOutlineLockClosed, HiShoppingBag, HiUser } from "react-icons/hi";
import { GiMedicines } from "react-icons/gi";
import ApplicationLogo from "@/config/ApplicationLogo";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const linkItems = [
    {
      href: "/dashboard/",
      icon: <GiMedicines className="text-2xl" />,
      label: "My Account",
      tabClass: "tab-home",
    },
    {
      href: "/my-orders/",
      icon: <HiShoppingBag className="text-2xl" />,
      label: "My Orders",
      tabClass: "tab-orders",
    },
    {
      href: "/my-profile/",
      icon: <HiUser className="text-2xl" />,
      label: "My Profile",
      tabClass: "tab-profile",
    },
    {
      href: "/my-address/",
      icon: <HiLocationMarker className="text-2xl" />,
      label: "My Address Book",
      tabClass: "tab-address",
    },
    {
      href: "/change-password/",
      icon: <HiOutlineLockClosed className="text-2xl" />,
      label: "Change Password",
      tabClass: "tab-password",
    },
  ];

  return (
    <div
      className={`sm:m-5 sm:rounded-lg fixed top-0 left-0 lg:relative h-full w-100 md:w-100 bg-[#F9FAFB] py-4 px-3 flex flex-col shadow-md transform ${isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 sm:relative sm:translate-x-0 sm:w-100 md:w-100`}
    >
      <div className="flex justify-between p-1 mb-3 md:hidden">
        <ApplicationLogo width={120} height={40} />

        <div className="align-middle ms-2 pt-2 text-2xl text-[#7c3aed]" onClick={toggleSidebar}>
          <FiX size={30} />
        </div>
      </div>

      <nav className="space-y-2">
        {linkItems.map(({ href, icon, label, tabClass }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={toggleSidebar}
              className={`flex items-center p-2 rounded-md ${tabClass} ${isActive
                  ? "bg-[#7c3aed] text-white active-tab"
                  : "hover:bg-gray-200 text-[#111827]"
                }`}
            >
              <span className={`${isActive ? "text-white" : "text-[#6b7280]"} text-2xl`}>{icon}</span>
              <span className="ml-3 sm:inline tab-text-home">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
