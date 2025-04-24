const ProgressBar = ({ percentage = 0 }) => {
    return (
      <div className="w-full">
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-green-600 transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-green-700 font-medium text-center mt-2">{percentage}% Complete</p>
      </div>
    );
  };
  
  export default ProgressBar;
  