interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

const ProgressBar = ({ current, total, showLabel = true }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 text-sm font-semibold text-gray-700">
          {current} / {total}
        </div>
      )}
      <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
