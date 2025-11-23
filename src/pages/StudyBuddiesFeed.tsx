import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedPost {
  id: string;
  photo_url: string;
  front_photo_url: string | null;
  back_photo_url: string | null;
  caption: string | null;
  minutes_studied: number;
  created_at: string;
  user_id: string;
  class_id: string | null;
  author: {
    display_name: string;
    username: string;
  };
  class_name?: string;
}

const StudyBuddiesFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) return;

      try {
        // Get feed posts with author info
        const { data: postsData, error } = await supabase
          .from('feed_posts')
          .select(`
            *,
            profiles!feed_posts_user_id_fkey (
              display_name,
              username
            ),
            classes (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const enrichedPosts = (postsData || []).map((post: any) => ({
          ...post,
          author: post.profiles,
          class_name: post.classes?.name,
        }));

        setPosts(enrichedPosts);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user]);

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] flex items-center justify-center pb-24">
        <div className="text-white text-xl">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] pt-6 pb-4 px-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-black text-white">Nudge</h1>
            <div className="flex items-center justify-center gap-8">
              <button className="text-white font-semibold text-lg border-b-2 border-white pb-1">
                My Study Buddies
              </button>
              <button 
                className="text-white/70 font-semibold text-lg hover:text-white transition-colors"
                onClick={() => navigate('/leaderboard')}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="px-4 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-white/80">
              No posts yet. Start studying and post your first nudge!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-[hsl(250,40%,8%)] rounded-3xl overflow-hidden border border-white/10"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{post.author.display_name}</div>
                    <div className="text-sm text-white/60">
                      {post.author.username} • {formatTimeAgo(post.created_at)}
                    </div>
                  </div>
                  <button className="text-white/60 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </div>

                {/* BeReal-style dual photos */}
                <div className="relative aspect-[4/5] bg-[hsl(250,40%,10%)]">
                  {/* Back (main) photo */}
                  {post.back_photo_url ? (
                    <img
                      src={post.back_photo_url}
                      alt="Study session"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={post.photo_url}
                      alt="Study session"
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Front (selfie) photo overlay */}
                  {post.front_photo_url && (
                    <div className="absolute top-4 left-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl">
                      <img
                        src={post.front_photo_url}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="p-4 space-y-3">
                  {/* Study info */}
                  <div className="flex items-center gap-3 text-sm">
                    {post.class_name && (
                      <span className="px-3 py-1 rounded-full bg-[hsl(207,100%,57%)] text-white font-semibold">
                        {post.class_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-white/70">
                      <Clock className="w-4 h-4" />
                      {post.minutes_studied}m
                    </span>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-white">{post.caption}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-2">
                    <button className="flex items-center gap-2 text-white/70 hover:text-[hsl(340,100%,70%)] transition-colors">
                      <Heart className="w-6 h-6" />
                      <span className="font-semibold">24</span>
                    </button>
                    <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-semibold">5</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyBuddiesFeed;
