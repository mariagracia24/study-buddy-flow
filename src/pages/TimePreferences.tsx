import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TimePreferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [weekdayHours, setWeekdayHours] = useState([2]);
  const [weekendHours, setWeekendHours] = useState([2]);
  const [loading, setLoading] = useState(false);

  const getHoursLabel = (value: number) => {
    if (value === 1) return '😌 1-2 hours';
    if (value === 2) return '😊 2-3 hours';
    return '💪 3-4 hours';
  };

  const getHoursRange = (value: number) => {
    if (value === 1) return '1-2';
    if (value === 2) return '2-3';
    return '3-4';
  };

  const handleContinue = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          weekday_study_range: getHoursRange(weekdayHours[0]),
          weekend_study_range: getHoursRange(weekendHours[0]),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      navigate('/final-schedule');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving preferences",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] p-6">
      <div className="max-w-md mx-auto pt-20 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-3">
            When do you usually
            <br />
            like to study?
          </h1>
          <p className="text-lg text-white/80">
            This helps Nudge create your perfect schedule
          </p>
        </div>

        <div className="space-y-8">
          {/* Weekdays */}
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-2">Weekdays</h3>
            <p className="text-white/70 mb-6">Monday - Friday</p>
            
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-black text-white">
                  {getHoursLabel(weekdayHours[0])}
                </span>
              </div>
              <Slider
                value={weekdayHours}
                onValueChange={setWeekdayHours}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Weekends */}
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-2">Weekends</h3>
            <p className="text-white/70 mb-6">Saturday - Sunday</p>
            
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-black text-white">
                  {getHoursLabel(weekendHours[0])}
                </span>
              </div>
              <Slider
                value={weekendHours}
                onValueChange={setWeekendHours}
                min={1}
                max={3}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-16 bg-white hover:bg-white/90 text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default TimePreferences;
