import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Flame, Clock, BookOpen, Grid3X3, Film, BarChart3, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  username: string;
  display_name: string;
  bio: string;
  photo_url: string;
  streak: number;
  longest_streak: number;
  total_minutes: number;
}

interface Post {
  id: string;
  photo_url: string;
  timelapse_url?: string;
  minutes_studied: number;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'timelapses' | 'stats'>('posts');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

    } catch (error: any) {
      toast({
        title: "Failed to load profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin text-primary">
          <Flame className="h-12 w-12" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-border/50">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Profile Info */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-primary p-1 glow-primary animate-float">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-5xl font-black">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.display_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    profile.display_name[0]
                  )}
                </div>
              </div>
              {profile.streak > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-primary rounded-full px-3 py-1 flex items-center gap-1 glow-primary">
                  <Flame className="h-4 w-4 text-white" />
                  <span className="text-white font-black">{profile.streak}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-black text-foreground">{profile.display_name}</h1>
              <p className="text-lg text-muted-foreground font-medium">@{profile.username}</p>
              {profile.bio && (
                <p className="text-foreground/80 font-medium">{profile.bio}</p>
              )}
            </div>

            {/* Edit Button */}
            <Button className="rounded-full hover-scale" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border-2 border-border rounded-3xl p-4 text-center hover-scale">
              <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-primary mb-1">
                {profile.streak}
              </div>
              <div className="text-sm text-muted-foreground font-bold flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-primary" />
                Day Streak
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-4 text-center hover-scale">
              <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-secondary mb-1">
                {formatTime(profile.total_minutes)}
              </div>
              <div className="text-sm text-muted-foreground font-bold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4 text-secondary" />
                Total Time
              </div>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-4 text-center hover-scale">
              <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-accent mb-1">
                {posts.length}
              </div>
              <div className="text-sm text-muted-foreground font-bold flex items-center justify-center gap-1">
                <BookOpen className="h-4 w-4 text-accent" />
                Sessions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 font-bold transition-all ${
              activeTab === 'posts'
                ? 'text-primary border-b-4 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3X3 className="h-5 w-5 mx-auto mb-1" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('timelapses')}
            className={`flex-1 py-4 font-bold transition-all ${
              activeTab === 'timelapses'
                ? 'text-primary border-b-4 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Film className="h-5 w-5 mx-auto mb-1" />
            Timelapses
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-4 font-bold transition-all ${
              activeTab === 'stats'
                ? 'text-primary border-b-4 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-5 w-5 mx-auto mb-1" />
            Stats
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground font-medium">No Nudge posts yet</p>
              <p className="text-sm text-muted-foreground">Complete a study session to post!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-card border-2 border-border rounded-2xl overflow-hidden hover-scale cursor-pointer group"
                >
                  {post.timelapse_url ? (
                    <div className="relative w-full h-full">
                      <video src={post.timelapse_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <Film className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : post.photo_url ? (
                    <img src={post.photo_url} alt="Nudge" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'timelapses' && (
          <div className="grid grid-cols-2 gap-4">
            {posts.filter(p => p.timelapse_url).map((post) => (
              <div
                key={post.id}
                className="aspect-video bg-card border-2 border-border rounded-3xl overflow-hidden hover-scale cursor-pointer group"
              >
                <video src={post.timelapse_url!} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-card border-2 border-border rounded-3xl p-6">
              <h3 className="text-2xl font-black text-foreground mb-4">Study Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Longest Streak</span>
                  <span className="text-2xl font-black text-gradient-primary">
                    {profile.longest_streak} days 🔥
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total Sessions</span>
                  <span className="text-2xl font-black text-gradient-secondary">
                    {posts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total Study Time</span>
                  <span className="text-2xl font-black text-gradient-accent">
                    {formatTime(profile.total_minutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;