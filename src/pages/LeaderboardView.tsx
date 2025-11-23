import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Flame, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardUser {
  id: string;
  display_name: string;
  username: string;
  streak: number;
  total_minutes: number;
  photo_url: string | null;
}

const LeaderboardView = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'week' | 'all'>('week');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, streak, total_minutes, photo_url')
          .order('total_minutes', { ascending: false })
          .limit(20);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-[hsl(45,98%,70%)] to-[hsl(25,95%,60%)]'; // Gold
    if (index === 1) return 'from-[hsl(0,0%,80%)] to-[hsl(0,0%,70%)]'; // Silver
    if (index === 2) return 'from-[hsl(25,95%,60%)] to-[hsl(20,90%,55%)]'; // Bronze
    return 'from-[hsl(207,100%,57%)] to-[hsl(270,80%,60%)]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] flex items-center justify-center pb-24">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(207,100%,57%)] via-[hsl(270,80%,60%)] to-[hsl(340,100%,70%)] pb-24">
      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-2">
            <Trophy className="w-10 h-10 text-[hsl(45,98%,70%)]" />
          </div>
          <h1 className="text-4xl font-black text-white">Leaderboard</h1>
          <p className="text-white/80">See who's locked in the most</p>
        </div>

        {/* Time Toggle */}
        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setView('week')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              view === 'week'
                ? 'bg-white text-[hsl(207,100%,57%)]'
                : 'text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              view === 'all'
                ? 'bg-white text-[hsl(207,100%,57%)]'
                : 'text-white'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {users.map((leaderUser, index) => {
            const isCurrentUser = user?.id === leaderUser.id;
            
            return (
              <div
                key={leaderUser.id}
                className={`relative overflow-hidden rounded-2xl ${
                  isCurrentUser
                    ? 'bg-white/25 border-2 border-white'
                    : 'bg-white/15'
                } backdrop-blur-sm p-4`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {index < 3 ? (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-black text-white">
                          {index + 1}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-black text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-12 h-12 border-2 border-white/30">
                    <AvatarFallback className="bg-[hsl(207,100%,57%)] text-white font-bold">
                      {getInitials(leaderUser.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg truncate">
                      {leaderUser.display_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-sm font-semibold text-[hsl(45,98%,70%)]">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/70">
                      @{leaderUser.username}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <Clock className="w-4 h-4" />
                        {formatTime(leaderUser.total_minutes)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <Flame className="w-4 h-4 text-[hsl(25,95%,60%)]" />
                        {leaderUser.streak}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardView;
