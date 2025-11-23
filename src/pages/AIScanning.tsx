import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AIScanning = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const processSyllabus = async () => {
      if (!user || !classId) return;

      try {
        const syllabusUrl = searchParams.get('url');
        if (!syllabusUrl) throw new Error('No syllabus URL provided');

        // Call the edge function to parse syllabus
        const { data, error } = await supabase.functions.invoke('parse-syllabus', {
          body: { 
            classId,
            syllabusUrl,
            userId: user.id 
          }
        });

        if (error) throw error;

        // Wait a bit for dramatic effect
        setTimeout(() => {
          navigate(`/study-plan-preview/${classId}`);
        }, 3000);

      } catch (error: any) {
        console.error('Syllabus processing error:', error);
        toast({
          variant: "destructive",
          title: "Processing failed",
          description: error.message || "Unable to process syllabus",
        });
        setTimeout(() => navigate('/add-classes'), 2000);
      }
    };

    processSyllabus();
  }, [user, classId, searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(270,80%,60%)] via-[hsl(207,100%,57%)] to-[hsl(340,100%,70%)] relative overflow-hidden flex items-center justify-center p-6">
      <div className="text-center space-y-8 animate-in fade-in duration-700">
        <h1 className="text-4xl font-black text-white">
          AI is scanning your syllabus...
        </h1>

        {/* Animated scanning circle */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(207,100%,57%)] to-[hsl(270,80%,60%)] animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <div className="relative">
              <FileText className="w-16 h-16 text-white" />
              <Sparkles className="w-8 h-8 text-[hsl(45,98%,70%)] absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-[hsl(340,100%,70%)] border-t-transparent animate-spin" />
        </div>

        <div className="space-y-3">
          <p className="text-xl text-white/90">
            Nudge will extract assignment
          </p>
          <p className="text-xl text-white/90">
            deadlines and topics.
          </p>
        </div>

        <div className="pt-4">
          <div className="inline-block px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm">
            <p className="text-white/70 text-sm font-semibold">
              This usually takes 10-30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScanning;
