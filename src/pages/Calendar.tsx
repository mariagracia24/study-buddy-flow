import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudyBlock {
  id: string;
  block_date: string;
  start_time: string;
  duration_minutes: number;
  class_id: string;
  classes: {
    name: string;
  };
  assignments: {
    title: string;
  } | null;
}

const Calendar = () => {
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStudyBlocks();
  }, []);

  const loadStudyBlocks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('study_blocks')
        .select(`
          *,
          classes(name),
          assignments(title)
        `)
        .eq('user_id', user.id)
        .order('block_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setStudyBlocks(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load calendar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group blocks by date
  const groupedBlocks = studyBlocks.reduce((acc, block) => {
    const date = block.block_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(block);
    return acc;
  }, {} as Record<string, StudyBlock[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin text-primary">
          <CalendarIcon className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 animate-in fade-in duration-500">
          <div className="inline-block mx-auto w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center glow-primary animate-float">
            <CalendarIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-gradient-primary">
            Your Study Calendar
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            AI-powered schedule to keep you locked in ✨
          </p>
        </div>

        {/* Calendar Content */}
        {Object.keys(groupedBlocks).length === 0 ? (
          <div className="text-center space-y-4 py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">No study blocks yet</p>
            <p className="text-sm text-muted-foreground">
              Upload a syllabus to generate your personalized study plan
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBlocks).map(([date, blocks]) => (
              <div 
                key={date} 
                className="space-y-3 animate-in slide-in-from-bottom-4 duration-500"
              >
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg py-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {formatDate(date)}
                  </h2>
                  <div className="h-1 w-16 bg-gradient-primary rounded-full mt-2" />
                </div>

                {/* Study Blocks for this date */}
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`
                        bg-card border-2 border-border rounded-3xl p-5
                        hover:border-primary transition-all duration-200 hover-scale
                        ${index % 3 === 0 ? 'bg-gradient-to-br from-primary/5 to-transparent' : ''}
                        ${index % 3 === 1 ? 'bg-gradient-to-br from-secondary/5 to-transparent' : ''}
                        ${index % 3 === 2 ? 'bg-gradient-to-br from-accent/5 to-transparent' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Class Name */}
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-3 h-3 rounded-full
                              ${index % 3 === 0 ? 'bg-primary' : ''}
                              ${index % 3 === 1 ? 'bg-secondary' : ''}
                              ${index % 3 === 2 ? 'bg-accent' : ''}
                            `} />
                            <h3 className="text-lg font-bold text-foreground">
                              {block.classes.name}
                            </h3>
                          </div>

                          {/* Assignment Title */}
                          {block.assignments && (
                            <p className="text-sm text-muted-foreground font-medium pl-5">
                              {block.assignments.title}
                            </p>
                          )}
                        </div>

                        {/* Time Info */}
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2 text-foreground font-bold">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(block.start_time)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {block.duration_minutes} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;