import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Flame, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  photo_url: string;
  streak: number;
  total_minutes: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [sortBy, setSortBy] = useState<'streak' | 'minutes'>('streak');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboard();
  }, [sortBy]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, photo_url, streak, total_minutes')
        .order(sortBy === 'streak' ? 'streak' : 'total_minutes', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);

    } catch (error: any) {
      toast({
        title: "Failed to load leaderboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin text-primary">
          <Trophy className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero border-b border-border/50">
        <div className="max-w-4xl mx-auto p-6 text-center space-y-4">
          <div className="inline-block mx-auto w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center glow-primary animate-float">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-gradient-primary">Leaderboard</h1>
          <p className="text-lg text-muted-foreground font-medium">
            See who's crushing it this week 💪
          </p>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setSortBy('streak')}
            className={`flex-1 py-4 font-bold transition-all ${
              sortBy === 'streak'
                ? 'text-primary border-b-4 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="h-5 w-5 mx-auto mb-1" />
            Streak
          </button>
          <button
            onClick={() => setSortBy('minutes')}
            className={`flex-1 py-4 font-bold transition-all ${
              sortBy === 'minutes'
                ? 'text-primary border-b-4 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-5 w-5 mx-auto mb-1" />
            Total Time
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-w-4xl mx-auto p-6">
        {users.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground font-medium">No users yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <div
                key={user.id}
                className={`
                  bg-card border-2 rounded-3xl p-5 flex items-center gap-4 hover-scale cursor-pointer
                  ${index === 0 ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent glow-primary' : ''}
                  ${index === 1 ? 'border-secondary bg-gradient-to-r from-secondary/10 to-transparent' : ''}
                  ${index === 2 ? 'border-accent bg-gradient-to-r from-accent/10 to-transparent' : ''}
                  ${index > 2 ? 'border-border' : ''}
                `}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {getMedalEmoji(index) ? (
                    <span className="text-3xl">{getMedalEmoji(index)}</span>
                  ) : (
                    <span className="text-2xl font-black text-muted-foreground">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`
                  w-14 h-14 rounded-full p-0.5
                  ${index === 0 ? 'bg-gradient-primary' : ''}
                  ${index === 1 ? 'bg-gradient-secondary' : ''}
                  ${index === 2 ? 'bg-gradient-accent' : ''}
                  ${index > 2 ? 'bg-border' : ''}
                `}>
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-xl font-black">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={user.display_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.display_name[0]
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-foreground truncate">
                    {user.display_name}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    @{user.username}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right space-y-1">
                  {sortBy === 'streak' ? (
                    <>
                      <div className="flex items-center gap-2 justify-end">
                        <Flame className={`h-5 w-5 ${user.streak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-2xl font-black text-foreground">{user.streak}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">day streak</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 justify-end">
                        <Clock className="h-5 w-5 text-secondary" />
                        <span className="text-2xl font-black text-foreground">{formatTime(user.total_minutes)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">total time</div>
                    </>
                  )}
                </div>

                {/* Trending Badge for top 3 */}
                {index < 3 && (
                  <div className="ml-2">
                    <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;