import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronRight,
  Headphones,
  LayoutDashboard,
  Lock,
  MapPin,
  Phone,
  ShoppingBag,
  TrendingUp,
  X,
} from "lucide-react";
import ApplicationLogo from "@/config/ApplicationLogo";

const navItems = [
  {
    href: "/dashboard",
    label: "My Account",
    description: "Dashboard overview",
    icon: LayoutDashboard,
    key: "tab-home",
    match: ["/dashboard"],
  },
  {
    href: "/orders",
    label: "My Orders",
    description: "Orders and refills",
    icon: ShoppingBag,
    key: "tab-orders",
    match: ["/orders", "/order-detail"],
  },
  {
    href: "/address",
    label: "My Address Book",
    description: "Delivery details",
    icon: MapPin,
    key: "tab-address",
    match: ["/address"],
  },
  {
    href: "/change-password",
    label: "Change Password",
    description: "Account security",
    icon: Lock,
    key: "tab-password",
    match: ["/change-password"],
  },
  {
    href: "/weight-loss-journey",
    label: "Weight Loss Journey",
    description: "Progress and BMI",
    icon: TrendingUp,
    key: "tab-weight",
    match: ["/weight-loss-journey"],
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const supportPhone =
    process.env.NEXT_PUBLIC_SUPPORT_PHONE || "Add support number";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        role="navigation"
        aria-label=""
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col
          bg-[#f4f5fb] p-3
          shadow-[18px_0_50px_rgba(35,24,67,0.16)]
          transition-transform duration-300 ease-out

          lg:sticky lg:top-[72px] lg:z-20
          lg:h-[calc(100vh-72px)] lg:w-[276px]
          lg:shrink-0 lg:translate-x-0 lg:p-4
          lg:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#47317c]/10 bg-white shadow-[0_14px_36px_rgba(71,49,124,0.07)]">
          {/* Mobile close button */}
          <div className="flex items-center justify-start border-b border-[#47317c]/[0.07] p-4 sm:hidden block">
            <ApplicationLogo width={148} height={56} />
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close navigation"
            className="
              absolute right-3 top-3 z-20 flex h-9 w-9
              items-center justify-center rounded-[11px]
              border border-[#47317c]/10 bg-white
              text-[#47317c] shadow-sm
              transition-all duration-200
              hover:bg-[#47317c]/[0.05]
              lg:hidden
            "
          >
            <X size={17} strokeWidth={2.2} />
          </button>

          {/* Navigation heading */}
          <div className="px-4 pb-2 pt-5">
            {/* <p className="mont-semibold-font m-0 text-[8.5px] uppercase tracking-[0.14em] text-[#47317c]/55">
              Account navigation
            </p> */}
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-2 pb-3">
            {navItems.map(
              ({ href, label, description, icon: Icon, key, match }) => {
                const active = match.some((path) =>
                  currentPath.startsWith(path),
                );

                return (
                  <Link href={href} legacyBehavior key={key}>
                    <a
                      onClick={toggleSidebar}
                      aria-current={active ? "page" : undefined}
                      className={`
                        ${key}
                        group relative flex min-h-[55px] items-center
                        gap-3 overflow-hidden rounded-[15px]
                        px-3 py-2.5 no-underline outline-none
                        transition-all duration-200

                        ${
                          active
                            ? `
                              bg-[#47317c] text-white
                              shadow-[0_9px_22px_rgba(71,49,124,0.22)]
                            `
                            : `
                              text-slate-700
                              hover:bg-[#47317c]/[0.045]
                              hover:text-[#47317c]
                            `
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {active && (
                        <span className="absolute  rounded-r-full bg-white/90" />
                      )}

                      {/* Icon */}
                      <span
                        className={`
                          flex h-9 w-9 shrink-0 items-center
                          justify-center rounded-[11px]
                          transition-all duration-200

                          ${
                            active
                              ? `
                                bg-white/15 text-white
                                ring-1 ring-inset ring-white/15
                              `
                              : `
                                bg-[#47317c]/[0.065]
                                text-[#47317c]
                                ring-1 ring-inset
                                ring-[#47317c]/[0.06]
                                group-hover:bg-white
                                group-hover:shadow-sm
                              `
                          }
                        `}
                      >
                        <Icon size={16} strokeWidth={active ? 2.35 : 2} />
                      </span>

                      {/* Text */}
                      <span className="min-w-0 flex-1">
                        <span className="mont-bold-font  block truncate text-[13px] leading-[17px]">
                          {label}
                        </span>

                        {/* <span
                          className={`
                            mont-reg-font mt-0.5 block truncate
                            text-[9px] leading-[14px]

                            ${active ? "text-white/65" : "text-slate-400"}
                          `}
                        >
                          {description}
                        </span> */}
                      </span>

                      <ChevronRight
                        size={13}
                        strokeWidth={2.2}
                        className={`
                          shrink-0 transition-all duration-200
                          group-hover:translate-x-0.5

                          ${
                            active
                              ? "text-white/70"
                              : "text-slate-300 group-hover:text-[#47317c]"
                          }
                        `}
                      />
                    </a>
                  </Link>
                );
              },
            )}
          </nav>

          {/* Empty flexible space */}
          <div className="min-h-3 flex-1" />

          {/* Compact support */}
          <div className="border-t border-[#47317c]/[0.07] p-3">
            <a
              href={`tel:${supportPhone.replace(/[^\d+]/g, "")}`}
              className="
                group flex min-h-[58px] w-full items-center
                gap-3 rounded-[15px] border
                border-[#47317c]/10 bg-[#f8f6fb]
                px-3 py-2.5 text-slate-900
                no-underline transition-all duration-200
                hover:border-[#47317c]/20
                hover:bg-[#f5f1fa]
              "
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#47317c] text-white shadow-[0_6px_14px_rgba(71,49,124,0.18)]">
                <Headphones size={16} strokeWidth={2.1} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="mont-medium-font block text-[12px] leading-4 text-slate-900">
                  Need help?
                </span>

                <span className="mont-medium-font mt-0.5 flex items-center gap-1.5 truncate text-[11px] leading-4 text-[#47317c]">
                  <Phone size={10.5} strokeWidth={2.2} />
                  <a href="tel:+44 (0)20 7550 6515">+44 (0)20 7550 6515</a>
                </span>
              </span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
