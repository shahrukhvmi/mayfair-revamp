// Components/SwitchTabs/SwitchTabs.js
const SwitchTabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex space-x-4 border-b-2 border-gray-300">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          className={`px-6 py-2 text-lg font-semibold transition-all duration-300 ${
            activeTab === index
              ? "text-blue-500 border-b-4 border-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default SwitchTabs;
