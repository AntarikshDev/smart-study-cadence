import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const motivationalQuotes = [
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  }
];

interface MotivationalSectionProps {
  currentStreak: number;
  bestStreak: number;
}

export const MotivationalSection = ({ currentStreak, bestStreak }: MotivationalSectionProps) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => 
      prev === 0 ? motivationalQuotes.length - 1 : prev - 1
    );
  };

  const currentQuote = motivationalQuotes[currentQuoteIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Streak Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="h-6 w-6 text-primary animate-pulse" />
                <h3 className="text-lg font-semibold text-foreground">Study Streak</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="text-3xl font-bold text-primary">{currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current</div>
                </div>
                <div className="text-muted-foreground text-xl">/</div>
                <div>
                  <div className="text-2xl font-semibold text-muted-foreground">{bestStreak}</div>
                  <div className="text-sm text-muted-foreground">Best</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge 
                variant={currentStreak >= 7 ? "default" : currentStreak >= 3 ? "secondary" : "outline"}
                className="mb-2"
              >
                {currentStreak >= 7 ? "🔥 On Fire!" : currentStreak >= 3 ? "⚡ Great!" : "📚 Keep Going!"}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {currentStreak === bestStreak && currentStreak > 0 ? "New Record!" : ""}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-secondary/10 via-secondary/5 to-background border-secondary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Quote className="h-5 w-5 text-secondary" />
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Daily Inspiration
                </h3>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  "{currentQuote.text}"
                </p>
                <p className="text-sm text-muted-foreground">
                  — {currentQuote.author}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={prevQuote}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextQuote}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quote indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {motivationalQuotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuoteIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentQuoteIndex 
                    ? 'bg-secondary w-6' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};