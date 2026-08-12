import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Headphones,
  LayoutDashboard,
  Lock,
  MapPin,
  Phone,
  ShoppingBag,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import ApplicationLogo from "@/config/ApplicationLogo";

const navItems = [
  { href: "/dashboard", label: "My Account", icon: LayoutDashboard, key: "tab-home", match: ["/dashboard"] },
  { href: "/orders", label: "My Orders", icon: ShoppingBag, key: "tab-orders", match: ["/orders", "/order-detail"] },
  { href: "/address", label: "My Address Book", icon: MapPin, key: "tab-address", match: ["/address"] },
  { href: "/change-password", label: "Change Password", icon: Lock, key: "tab-password", match: ["/change-password"] },
  { href: "/weight-loss-journey", label: "Weight Loss Journey", icon: TrendingUp, key: "tab-weight", match: ["/weight-loss-journey"] },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        role="navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col
          bg-white border-r border-slate-100
          shadow-[4px_0_24px_rgba(0,0,0,0.05)]
          transition-transform duration-300 ease-out
          lg:sticky lg:top-[72px] lg:z-20
          lg:h-[calc(100vh-72px)] lg:w-[220px] 2xl:w-[260px]
          lg:shrink-0 lg:translate-x-0 lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:hidden">
          <div className="flex items-center gap-2.5">
              
              {/* <span className="inter-bold-font text-[15px] tracking-[-0.01em] text-slate-900">Mayfair</span> */}
                <ApplicationLogo className="h-12 w-auto text-white" />
            </div>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close navigation"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Menu label */}
        <div className="px-5 pt-6 pb-1.5">
          <p className="inter-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">
            Menu
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 pb-3">
          {navItems.map(({ href, label, icon: Icon, key, match }) => {
            const active = match.some((path) => currentPath.startsWith(path));
            return (
              <Link href={href} legacyBehavior key={key}>
                <a
                  onClick={toggleSidebar}
                  aria-current={active ? "page" : undefined}
                  className={`
                    ${key} group flex items-center gap-2.5
                    rounded-md px-3 py-2.5 2xl:px-4 2xl:py-3 no-underline outline-none
                    transition-all duration-150
                    ${active
                      ? "bg-[#47317c]/[0.09] text-[#47317c]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >
                  <Icon
                    size={15}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={active ? "text-[#47317c]" : "text-slate-400 group-hover:text-slate-600"}
                  />
                  <span className={`inter-medium-font text-[13px] lg:text-[14px] 2xl:text-[16px] leading-none ${active ? "text-[#47317c]" : ""}`}>
                    {label}
                  </span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Support */}
        <div className="border-t border-slate-100 p-4">
          <a
            href={`tel:+44 (0)20 7550 6515`}
            className="group flex items-center gap-3 rounded-md px-3 py-2.5 no-underline transition-colors duration-150 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Phone size={14} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="inter-medium-font block text-[12.5px] leading-4 text-slate-700">
               Call:
              </span>
              <span className="inter-reg-font mt-0.5 flex items-center gap-1 text-[11px] leading-4 text-slate-500">
                 {/* <Phone size={10} strokeWidth={2} /> */}
                +44 (0)20 7550 6515
              </span>
            </span>
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
