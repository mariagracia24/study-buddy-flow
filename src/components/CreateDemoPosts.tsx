import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function CreateDemoPosts() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDemoPosts = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        setIsLoading(false);
        return;
      }

      // Get user's classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('user_id', user.id)
        .limit(6);

      if (classesError) {
        console.error('Error fetching classes:', classesError);
        toast.error("Failed to load classes");
        setIsLoading(false);
        return;
      }

      if (!classes || classes.length === 0) {
        toast.error("Please add some classes first");
        setIsLoading(false);
        return;
      }

      const classIds = classes.map(c => c.id);

      toast.info("Generating demo study posts with AI photos... This may take a minute ⏳");

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 2 minutes')), 120000);
      });

      const functionPromise = supabase.functions.invoke('create-demo-posts', {
        body: { 
          userId: user.id,
          classIds 
        }
      });

      const result = await Promise.race([functionPromise, timeoutPromise]);
      const { data, error } = result as { 
        data: { postsCreated?: number; error?: string; details?: string } | null; 
        error: { message?: string } | null 
      };

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create demo posts');
      }

      if (!data) {
        throw new Error('No response from server');
      }

      // Check if the response contains an error (edge function returned error in data)
      if (data.error) {
        console.error('Edge function returned error:', data.error, data.details);
        throw new Error(data.error);
      }

      toast.success(`✨ Created ${data.postsCreated || 0} demo posts! Check out the Feed tab`);
      
      // Refresh the page to show new posts
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error creating demo posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create demo posts. Please try again.';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateDemoPosts}
      disabled={isLoading}
      className="gap-2 bg-gradient-neon"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Create Demo Posts
        </>
      )}
    </Button>
  );
}