import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  estimated_minutes: number;
  type: string;
}

const StudyPlanPreview = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !classId) return;

      try {
        // Get class name
        const { data: classData } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .single();

        if (classData) setClassName(classData.name);

        // Get assignments
        const { data: assignmentsData, error } = await supabase
          .from('syllabus_assignments')
          .select('*')
          .eq('class_id', classId)
          .order('due_date');

        if (error) throw error;
        setAssignments(assignmentsData || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading plan",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, classId, toast]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] relative overflow-hidden p-6">
      <div className="relative z-10 max-w-md mx-auto pt-12 pb-24 space-y-8">
        {/* Success animation */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="w-16 h-16 text-white animate-in zoom-in duration-500" />
          </div>
          <h1 className="text-4xl font-black text-white">
            Your smart study plan
            <br />
            is ready!
          </h1>
          <p className="text-lg text-white/80">
            {className}
          </p>
        </div>

        {/* Assignments list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center text-white/80">
              No assignments found in syllabus
            </div>
          ) : (
            assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 animate-in slide-in-from-left duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[hsl(45,98%,70%)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-lg mb-1">
                      {assignment.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due {formatDate(assignment.due_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(assignment.estimated_minutes)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/time-preferences')}
          className="w-full h-16 bg-white hover:bg-white/90 text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
        >
          Add to my calendar
        </Button>
      </div>
    </div>
  );
};

export default StudyPlanPreview;
