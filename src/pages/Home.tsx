import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home as HomeIcon, Users, User } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'buddies' | 'leaderboard'>('buddies');

  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.display_name || 
                      user?.email?.split('@')[0]?.toUpperCase() || 
                      'FRIEND';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred background - placeholder for now, will be real study photo */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 backdrop-blur-2xl"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Nudge</h1>
          
          {/* Tabs */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setActiveTab('buddies')}
              className={`text-base font-semibold pb-1 transition-all ${
                activeTab === 'buddies'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70'
              }`}
            >
              My Study Buddies
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`text-base font-semibold pb-1 transition-all ${
                activeTab === 'leaderboard'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Main Content - Centered Nudge Card */}
        <div className="flex-1 flex items-center justify-center px-6 pb-32">
          <div 
            className="w-full max-w-md rounded-3xl p-8 text-center space-y-6"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(48, 125, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(48, 125, 255, 0.2)',
            }}
          >
            <h2 className="text-4xl font-black text-white">
              HEY {displayName}
            </h2>
            
            <p className="text-lg text-white/90 leading-relaxed">
              Are you ready? Your next nudge is for CS 241. Be ready to share with friends.
            </p>

            <Button
              onClick={() => navigate('/nudge-camera')}
              className="w-full h-16 bg-[hsl(207,100%,57%)] hover:bg-[hsl(207,100%,50%)] text-white font-bold text-lg rounded-full shadow-lg"
              style={{
                boxShadow: '0 8px 24px rgba(35, 155, 255, 0.4)',
              }}
            >
              Post your nudge
            </Button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div 
          className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-8 pb-safe"
          style={{
            background: 'linear-gradient(135deg, hsl(207, 100%, 57%), hsl(270, 80%, 60%))',
          }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-1 text-[hsl(340,100%,70%)]"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>

          <button
            onClick={() => navigate('/buddies')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-semibold">Friends</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-semibold">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
