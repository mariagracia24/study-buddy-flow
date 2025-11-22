import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ClassDetail = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { state, updateClass } = useOnboarding();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classItem = state.classes.find(c => c.id === classId);

  if (!classItem) {
    navigate('/dashboard');
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // Upload to Supabase Storage
      const fileName = `${user.id}/${classId}/${Date.now()}-${file.name}`;
      setUploadProgress(30);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('syllabi')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('syllabi')
        .getPublicUrl(fileName);

      // Call edge function to parse syllabus
      setUploadProgress(60);
      
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-syllabus', {
        body: {
          syllabusUrl: fileName,
          classId,
          userId: user.id,
          weekdayHours: state.weekdayHours,
          weekendHours: state.weekendHours,
        },
      });

      if (parseError) throw parseError;

      setUploadProgress(100);

      // Update local state
      updateClass(classId!, { syllabusUploaded: true });

      toast({
        title: "Success! ✨",
        description: `Found ${parseData.assignments?.length || 0} assignments and created your study plan!`,
      });

      // Navigate to assignment summary
      setTimeout(() => {
        navigate(`/assignment-summary/${classId}`);
      }, 500);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || 'Something went wrong. Please try again.',
        variant: "destructive",
      });
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSkip = () => {
    updateClass(classId!, { syllabusUploaded: true });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mb-4 glow-primary animate-float">
            <FileText className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-foreground leading-tight">
            Upload syllabus for<br/>{classItem.name} 📄
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            AI will scan it and build your personalized study plan
          </p>
        </div>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full h-18 text-lg font-bold bg-gradient-primary hover:opacity-90 transition-all hover-scale glow-primary rounded-3xl relative overflow-hidden"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="flex flex-col items-start">
                  <span>Processing...</span>
                  <span className="text-xs opacity-80">{uploadProgress}% complete</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6" />
                <span>Upload PDF or Word Doc</span>
              </div>
            )}
          </Button>

          <Button
            onClick={handleSkip}
            disabled={isProcessing}
            variant="outline"
            className="w-full h-16 text-lg font-bold bg-card border-2 border-border hover:border-primary transition-all hover-scale rounded-3xl"
            size="lg"
          >
            Skip for now
          </Button>
        </div>

        {isProcessing && (
          <div className="text-center space-y-2 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground font-medium">
              ✨ AI is reading your syllabus...
            </p>
            <p className="text-xs text-muted-foreground">
              This might take a moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
