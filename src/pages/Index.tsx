import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Target, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(207,100%,57%)] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[hsl(270,80%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(45,98%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(25,95%,60%)] rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[hsl(340,100%,70%)] rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-24 pt-12">
          <h1 className="text-7xl font-black text-white mb-4 tracking-tight">
            Nudge
          </h1>
          <h2 className="text-3xl font-bold text-white mb-6">
            Like BeReal, but for studying.
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-4">
            You get a daily notification to post a quick picture of you studying.
            When you show up, you stay on track and unlock your friends' posts.
            When you don't, you fall behind — and that's the motivation.
          </p>
          <p className="text-2xl font-bold text-[hsl(45,98%,70%)] mb-8">
            One tap → Nudge syncs your classes, reads your syllabi, and tells you exactly when to study.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="h-16 px-12 bg-[hsl(45,98%,70%)] hover:bg-[hsl(45,98%,65%)] text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg"
          >
            Get Started
          </Button>
        </div>

        {/* How It Works Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-white text-center mb-12">
            How it works in 10 seconds
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "1",
                title: "Connect classes",
                desc: "Tap once → Nudge pulls your Canvas/Blackboard schedule. Upload a syllabus → it automatically extracts all due dates.",
                icon: Calendar
              },
              {
                number: "2",
                title: "Nudge creates your plan",
                desc: "The app figures out how long things will take and suggests the best times to study.",
                icon: Sparkles
              },
              {
                number: "3",
                title: "You just tap the time",
                desc: "Pick a suggested time slot that works for you. Nudge adds it to your schedule.",
                icon: Target
              },
              {
                number: "4",
                title: "When it's time, you post",
                desc: "You get a BeReal-style ping. Take a quick study pic → keep your streak and unlock the feed.",
                icon: CheckCircle
              }
            ].map((step) => (
              <div key={step.number} className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-[hsl(45,98%,70%)] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-black text-[hsl(207,100%,57%)]">{step.number}</span>
                </div>
                <step.icon className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why It Works Section */}
        <div className="mb-24 bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <h2 className="text-4xl font-black text-white text-center mb-8">
            Why this actually works
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "You study because your friends are also studying.",
              "You stay consistent because you want to keep your streak.",
              "You don't forget assignments because Nudge reads your syllabus.",
              "You don't cram because Nudge schedules work before deadlines.",
              "You don't overthink because it's just one snapshot a day."
            ].map((reason, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-[hsl(45,98%,70%)] flex-shrink-0 mt-1" />
                <p className="text-white text-lg">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The App Handles Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-white text-center mb-8">
            The app handles the boring part
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-[hsl(45,98%,70%)] mb-4">Nudge does this automatically:</h3>
              <ul className="space-y-3 text-white/90">
                <li>• Reads your syllabus</li>
                <li>• Finds every assignment, quiz, exam</li>
                <li>• Predicts how much time each one needs</li>
                <li>• Suggests study blocks</li>
                <li>• Reminds you at the right moment</li>
                <li>• Tracks your progress each time you post</li>
              </ul>
            </div>
            <div className="bg-[hsl(45,98%,70%)] rounded-3xl p-8 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[hsl(207,100%,57%)] mb-4">You only do this:</h3>
                <p className="text-3xl font-black text-[hsl(207,100%,57%)]">Post one real moment of studying.</p>
              </div>
            </div>
          </div>
          <p className="text-center text-2xl font-bold text-white mt-8">
            You do the work. Nudge plans it.
          </p>
        </div>

        {/* The Social Rule Section */}
        <div className="mb-24 bg-gradient-to-br from-[hsl(340,100%,70%)] to-[hsl(270,80%,60%)] rounded-3xl p-12 text-center">
          <Users className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-6">
            The social rule
          </h2>
          <p className="text-2xl font-bold text-white mb-4">
            You can only see your friends' study posts if you post yours.
          </p>
          <p className="text-xl text-white/90">
            That's it. Instant accountability. Simple. No pressure. No faking.
          </p>
        </div>

        {/* What You See Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-white text-center mb-12">
            What you see inside the app
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Daily streak", desc: "Shows how many days you've shown up.", icon: TrendingUp },
              { title: "Class progress bars", desc: "Shows how close you are to finishing tasks.", icon: Target },
              { title: "Feed of real moments", desc: "Not aesthetic — just proof you're working.", icon: Users },
              { title: "Today's plan", desc: "Your next study session, already scheduled.", icon: Calendar },
              { title: "Upcoming deadlines", desc: "Everything organized automatically.", icon: CheckCircle },
              { title: "Friend activity", desc: "See who's showing up and staying consistent.", icon: Sparkles }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <feature.icon className="w-8 h-8 text-[hsl(45,98%,70%)] mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-white text-center mb-12">
            What students say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "The daily check-in is the only thing keeping me alive in CS.",
              "Seeing my friends show up makes me show up.",
              "The syllabus reader is insane — I don't miss deadlines anymore."
            ].map((quote, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-white text-lg italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center pb-12">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to stay on track without overthinking?
          </h2>
          <Button
            onClick={() => navigate('/login')}
            className="h-16 px-12 bg-[hsl(45,98%,70%)] hover:bg-[hsl(45,98%,65%)] text-[hsl(207,100%,57%)] font-bold text-xl rounded-full shadow-lg mb-4"
          >
            Get Started
          </Button>
          <p className="text-white/70 text-sm">
            One tap. One study moment. Real progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
