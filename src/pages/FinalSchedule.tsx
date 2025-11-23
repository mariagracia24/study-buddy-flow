import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle } from 'lucide-react';

const FinalSchedule = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] flex items-center justify-center p-6">
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-[hsl(340,100%,70%)] to-[hsl(270,80%,60%)] shadow-2xl">
          <Calendar className="w-16 h-16 text-white" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[hsl(45,98%,70%)]">
            <CheckCircle className="w-6 h-6" />
            <span className="text-xl font-bold">All set!</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            You're all set!
          </h1>
        </div>

        <p className="text-xl text-white/90 max-w-md mx-auto leading-relaxed">
          Your study blocks are now in your calendar. Nudge will notify you when it's time.
        </p>

        <Button
          onClick={() => navigate('/dashboard')}
          className="h-16 px-12 bg-white hover:bg-white/90 text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
        >
          Go to Home Feed
        </Button>

        <div className="pt-4">
          <p className="text-white/60 text-sm">
            You can adjust your schedule anytime in Settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalSchedule;
