import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const StudyReminder = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(270,80%,60%)] via-[hsl(207,100%,57%)] to-[hsl(340,100%,70%)] flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-4xl font-black text-white leading-tight">
          It's Time to Study!
        </h1>
        <p className="text-2xl text-white/90 font-semibold">
          Nudge for CS 241
        </p>

        {/* Clock Icon with gradient background */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[hsl(340,100%,70%)] to-[hsl(207,100%,57%)] shadow-2xl" />
          <div className="absolute inset-0 rounded-3xl flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
              <Clock className="w-16 h-16 text-[hsl(0,84%,60%)]" />
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-8xl font-black text-white tracking-tight">
          {formatTime(timeLeft)}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/nudge-camera')}
          className="w-full h-16 bg-white hover:bg-white/90 text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
        >
          Open Camera
        </Button>

        {/* Info text */}
        <div className="space-y-2">
          <p className="text-white/80 text-lg">
            Nudge will ping you when it's time.
          </p>
          <p className="text-white/80 text-lg">
            Be ready to snap your streak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyReminder;
