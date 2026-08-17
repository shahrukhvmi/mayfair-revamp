const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === selectedTab),
  );

  return (
    <div
      className="relative mb-8 grid w-full grid-cols-2 gap-1 rounded-xl border border-[#47317c]/10 bg-[#f0ecf6] p-1"
      role="tablist"
      aria-label="Select measurement unit"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 rounded-[9px] border border-[#47317c]/20 bg-[#d8cdea] shadow-[0_3px_10px_rgba(71,49,124,0.14)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          width: "calc(50% - 6px)",
          transform:
            activeIndex === 0
              ? "translateX(0)"
              : "translateX(calc(100% + 4px))",
        }}
      />

      {tabs.map((tab) => {
        const isActive = selectedTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={`inter-bold-font relative z-10 min-h-[44px] w-full cursor-pointer rounded-[9px] border border-transparent bg-transparent px-4 py-2.5 text-[14px] uppercase transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47317c]/25 focus-visible:ring-offset-1
              ${
                isActive
                  ? "text-[#3f2b70]"
                  : "text-slate-500 hover:text-[#47317c]"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
export default SwitchTabs;
