import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";
import {
  HiLocationMarker,
  HiOutlineLockClosed,
  HiShoppingBag,
  HiUser,
} from "react-icons/hi";
import { GiMedicines } from "react-icons/gi";
import ApplicationLogo from "@/config/ApplicationLogo";
import styles from "@/styles/sidebar.module.css"; // ✅ Import as module

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();

  const navItems = [
    { href: "/dashboard/", label: "My Account", icon: <GiMedicines />, key: "tab-home" },
    { href: "/my-orders/", label: "My Orders", icon: <HiShoppingBag />, key: "tab-orders" },
    { href: "/profile/", label: "My Profile", icon: <HiUser />, key: "tab-profile" },
    { href: "/address/", label: "My Address Book", icon: <HiLocationMarker />, key: "tab-address" },
    { href: "/change-password/", label: "Change Password", icon: <HiOutlineLockClosed />, key: "tab-password" },
  ];
  const normalizePath = (path) => {
    return path.endsWith("/") ? path : `${path}/`;
  };
  return (
    <div
      className={`m-4 sm:rounded-lg fixed top-0 left-0 lg:relative h-full bg-[#F9FAFB] py-4 px-3 flex flex-col shadow-md transform transition-transform duration-300 ease-in-out z-50 sm:relative sm:translate-x-0 sm:w-64 ${isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex justify-between p-1 mb-3 md:hidden">
        <ApplicationLogo className="w-32 sm:w-40" />
        <div
          className="align-middle ms-2 pt-2 text-2xl text-[#7c3aed]"
          onClick={toggleSidebar}
        >
          <FiX size={30} />
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ href, label, icon, key }) => {
          const isActive = normalizePath(router.pathname).startsWith(normalizePath(href));
          console.log(router.pathname, "isActive")
          return (
            <Link href={href} legacyBehavior key={key}>
              <a
                onClick={toggleSidebar}
                className={`flex items-center p-2 rounded-md ${key} ${isActive
                    ? `bg-[#7c3aed] text-white ${styles["active-tab"]}`
                    : "hover:bg-gray-200 text-[#111827]"
                  } reg-font`}
              >
                {React.cloneElement(icon, {
                  className: `text-2xl mr-3 ${isActive ? "text-white" : "text-[#6b7280]"}`,
                })}
                <span className={styles[`tab-text-${key.split("tab-")[1]}`]}>{label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
