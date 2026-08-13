const ProgressBar = ({ percentage = 0 }) => {
  return (
    <div className="w-full">
      {/* Track */}
      <div className="h-1 w-full bg-slate-100 rounded-t-2xl overflow-hidden">
        <div
          className="h-full bg-[#47317c] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {percentage > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="h-1.5 w-1.5 rounded-full bg-[#47317c]/40" />
          <p className="inter-medium-font text-[11px] uppercase tracking-[0.1em] text-[#47317c]/70">
            {percentage}% Completed
          </p>
          <div className="h-1.5 w-1.5 rounded-full bg-[#47317c]/40" />
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
