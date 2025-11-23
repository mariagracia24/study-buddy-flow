import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UploadSyllabus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please upload a PDF file",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      // Upload to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('syllabi')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('syllabi')
        .getPublicUrl(filePath);

      // Navigate to AI processing
      navigate(`/ai-processing/${filePath}?url=${encodeURIComponent(publicUrl)}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(207,100%,57%)] relative overflow-hidden p-6">
      {/* Blob shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[hsl(270,80%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(45,98%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(25,95%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(340,100%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-md mx-auto pt-20 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-3">
            Upload your syllabus
          </h1>
          <p className="text-xl text-white/80">
            Just one file per class. Nudge will handle the rest.
          </p>
        </div>

        {/* Upload dropzone */}
        <label className="block">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="border-4 border-dashed border-white/60 rounded-3xl p-12 text-center cursor-pointer hover:border-white/80 transition-all bg-white/5 backdrop-blur-sm">
            {selectedFile ? (
              <>
                <FileText className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                <p className="text-white/70 text-sm mt-2">Click to change</p>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white font-semibold text-lg">Tap to upload PDF</p>
                <p className="text-white/70 text-sm mt-2">PDF files only</p>
              </>
            )}
          </div>
        </label>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full h-16 bg-[hsl(45,98%,70%)] hover:bg-[hsl(45,98%,65%)] text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
        >
          {uploading ? 'Uploading...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default UploadSyllabus;
