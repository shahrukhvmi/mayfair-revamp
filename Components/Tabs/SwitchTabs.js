const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  return (
    <div
      className="mb-8 grid w-full grid-cols-2 gap-1 rounded-xl bg-[#47317c]/[0.055] p-1"
      role="tablist"
      aria-label="Select measurement unit"
    >
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.value)}
            className={`inter-semibold-font relative min-h-[44px] w-full rounded-[9px] border px-4 py-2.5 text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47317c]/25 focus-visible:ring-offset-1
              ${
                isActive
                  ? "border-[#47317c]/15 bg-white text-[#47317c] shadow-[0_3px_12px_rgba(71,49,124,0.12)]"
                  : "border-transparent text-slate-500 hover:bg-white/60 hover:text-[#47317c]"
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
