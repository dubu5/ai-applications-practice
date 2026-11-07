import { useEffect, useState } from 'react';

interface TimerProps {
  initialMs: number;
  onTimeUp: () => void;
  onTick?: (remainingMs: number) => void;
}

const Timer = ({ initialMs, onTimeUp, onTick }: TimerProps) => {
  const [timeRemainingMs, setTimeRemainingMs] = useState(initialMs);

  useEffect(() => {
    if (timeRemainingMs <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemainingMs(prev => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        onTick?.(newTime);
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeRemainingMs, onTimeUp, onTick]);

  const seconds = Math.ceil(timeRemainingMs / 1000);
  const displaySeconds = Math.max(0, seconds);
  const isLow = timeRemainingMs < 5000;

  return (
    <div
      className={`flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold transition-colors ${
        isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
      }`}
      aria-label={`남은 시간: ${displaySeconds}초`}
    >
      {displaySeconds}
    </div>
  );
};

export default Timer;
