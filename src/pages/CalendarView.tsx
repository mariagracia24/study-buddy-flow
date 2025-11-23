import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudyBlock {
  id: string;
  block_date: string;
  start_time: string;
  duration_minutes: number;
  class_id: string;
  class_name?: string;
}

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocks = async () => {
      if (!user) return;

      try {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data, error } = await supabase
          .from('study_blocks')
          .select(`
            *,
            classes (name)
          `)
          .eq('user_id', user.id)
          .gte('block_date', startOfWeek.toISOString().split('T')[0])
          .lte('block_date', endOfWeek.toISOString().split('T')[0])
          .order('start_time');

        if (error) throw error;

        const enrichedBlocks = (data || []).map((block: any) => ({
          ...block,
          class_name: block.classes?.name,
        }));

        setStudyBlocks(enrichedBlocks);
      } catch (error) {
        console.error('Error loading study blocks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlocks();
  }, [user, currentDate]);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const getBlocksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return studyBlocks.filter(block => block.block_date === dateStr);
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] pb-24">
      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2">Study Plan</h1>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <span className="text-white font-semibold text-lg min-w-[140px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Week View */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center text-white/70 font-semibold text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const hasBlocks = getBlocksForDate(date).length > 0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-white transition-all ${
                    isSelected
                      ? 'bg-white text-[hsl(207,100%,57%)] font-bold scale-110'
                      : isToday
                      ? 'bg-white/30 border-2 border-white'
                      : hasBlocks
                      ? 'bg-white/20'
                      : 'bg-white/10'
                  }`}
                >
                  <span className="text-lg font-bold">{date.getDate()}</span>
                  {hasBlocks && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(45,98%,70%)] mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Schedule */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'short',
              day: 'numeric' 
            })}
          </h2>

          {loading ? (
            <div className="text-center text-white py-8">Loading...</div>
          ) : getBlocksForDate(selectedDate).length === 0 ? (
            <div className="text-center text-white/70 py-8">
              No study sessions scheduled
            </div>
          ) : (
            getBlocksForDate(selectedDate).map((block) => (
              <div
                key={block.id}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">
                    {block.class_name || 'Study Session'}
                  </span>
                  <span className="text-white/70 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {block.duration_minutes}m
                  </span>
                </div>
                <div className="text-white/80">
                  {formatTime(block.start_time)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
