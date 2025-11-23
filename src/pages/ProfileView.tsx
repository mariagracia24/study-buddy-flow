import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface UserProfile {
  display_name: string;
  username: string;
  bio?: string;
  streak: number;
  total_minutes: number;
}

interface UserClass {
  id: string;
  name: string;
}

const ProfileView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<UserClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Load classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name')
          .eq('user_id', user.id)
          .limit(3);

        if (classesData) setClasses(classesData);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(270,80%,60%)] via-[hsl(207,100%,57%)] to-[hsl(340,100%,70%)] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const initials = profile?.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const nudgeCount = Math.floor((profile?.total_minutes || 0) / 30); // Rough estimate

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(270,80%,60%)] via-[hsl(207,100%,57%)] to-[hsl(340,100%,70%)] pb-24">
      <div className="max-w-md mx-auto p-6 space-y-8">
        {/* Header with settings */}
        <div className="flex justify-end pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>

        {/* Profile Avatar */}
        <div className="text-center space-y-4">
          <Avatar className="w-32 h-32 mx-auto border-4 border-white/30 bg-[hsl(207,100%,57%)]">
            <AvatarFallback className="text-4xl font-black text-white bg-[hsl(207,100%,57%)]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-black text-white">
            {profile?.display_name || 'User'}
          </h1>
        </div>

        {/* Class Pills */}
        <div className="space-y-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-[hsl(207,100%,57%)] rounded-full px-6 py-4 text-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate(`/class/${classItem.id}`)}
            >
              <span className="text-2xl font-bold text-white">
                {classItem.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">
              {nudgeCount}
            </div>
            <div className="text-white/80 font-semibold">Nudges</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">75</div>
            <div className="text-white/80 font-semibold">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">23</div>
            <div className="text-white/80 font-semibold">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
