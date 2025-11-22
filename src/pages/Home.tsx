import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Calendar, Flame, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { state } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">Ready to lock in?</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">7 day streak</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl p-6 text-primary-foreground glow-primary hover-scale cursor-pointer">
          <h2 className="text-2xl font-bold mb-2">Today's Nudge</h2>
          <p className="text-lg opacity-90 mb-4">Time to tackle BIO101 reading!</p>
          <Button size="lg" variant="secondary" className="w-full font-black text-lg h-14">
            Start Nudge Session
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 rounded-3xl hover-scale border-2" 
            onClick={() => navigate('/feed')}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs font-bold">Feed</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 rounded-3xl hover-scale border-2"
            onClick={() => navigate('/leaderboard')}
          >
            <Trophy className="h-6 w-6" />
            <span className="text-xs font-bold">Leaderboard</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex-col gap-2 rounded-3xl hover-scale border-2"
            onClick={() => navigate('/profile')}
          >
            <Flame className="h-6 w-6" />
            <span className="text-xs font-bold">Profile</span>
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">Your Classes</h3>
          <div className="grid gap-3">
            {state.classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h4 className="font-semibold text-foreground">{classItem.name}</h4>
                <p className="text-sm text-muted-foreground">Next session: Tomorrow at 4:00 PM</p>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full h-14" size="lg" onClick={() => navigate('/calendar')}>
          <Calendar className="h-5 w-5 mr-2" />
          View Full Calendar
        </Button>
      </div>
    </div>
  );
};

export default Home;
