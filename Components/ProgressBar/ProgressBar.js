const ProgressBar = ({ percentage = 0 }) => {
  return (
    <div className="w-full">
      {/* Outer container with rounded top corners only */}
      <div className="h-3 bg-gray-50 rounded-t-md overflow-hidden">
        {/* Inner fill, square edges */}
        <div
          className="h-3 bg-violet-700 transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Progress text */}
      <p className="text-sm text-violet-700 font-medium text-center mt-2">
        {percentage}% Completed
      </p>
    </div>
  );
};

export default ProgressBar;
