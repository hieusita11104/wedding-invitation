import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  timeLeft: number;
  failedAttempts?: number;
  onComplete?: () => void;
}

export function CountdownTimer({ timeLeft, failedAttempts = 0, onComplete }: CountdownTimerProps) {
  const [currentTime, setCurrentTime] = useState(timeLeft);

  useEffect(() => {
    setCurrentTime(timeLeft);
    
    // Tạo interval để đếm ngược mỗi giây
    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          // Gọi callback khi đếm ngược xong
          onComplete?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup interval khi component unmount hoặc timeLeft thay đổi
    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const getNextLockoutDuration = () => {
    const nextAttempt = failedAttempts + 1;
    const minutes = Math.pow(2, nextAttempt - 5);
    return minutes;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="text-4xl font-bold text-red-500 transition-all duration-200 transform">
        {currentTime} <span className="text-2xl">giây</span>
      </div>
      <div className="text-sm text-gray-500">
        {currentTime > 0 ? (
          <span>
            Vui lòng đợi. Nếu nhập sai tiếp, thời gian khóa sẽ tăng lên {getNextLockoutDuration()} phút
          </span>
        ) : (
          'Bạn có thể thử lại, nhưng hãy cẩn thận!'
        )}
      </div>
    </div>
  );
}