import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  CloudRain, 
  Zap, 
  Waves, 
  Wind, 
  Flame, 
  Bird, 
  Coffee, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoundConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  volume: number;
  isPlaying: boolean;
}

const defaultSounds: SoundConfig[] = [
  { id: 'rain', name: 'Rain', icon: CloudRain, color: 'text-blue-500', volume: 50, isPlaying: false },
  { id: 'thunder', name: 'Thunder', icon: Zap, color: 'text-purple-500', volume: 30, isPlaying: false },
  { id: 'waves', name: 'Waves', icon: Waves, color: 'text-cyan-500', volume: 40, isPlaying: false },
  { id: 'wind', name: 'Wind', icon: Wind, color: 'text-gray-500', volume: 35, isPlaying: false },
  { id: 'fire', name: 'Fire', icon: Flame, color: 'text-orange-500', volume: 25, isPlaying: false },
  { id: 'birds', name: 'Birds', icon: Bird, color: 'text-green-500', volume: 45, isPlaying: false },
  { id: 'coffee', name: 'Coffee Shop', icon: Coffee, color: 'text-amber-600', volume: 30, isPlaying: false },
  { id: 'white-noise', name: 'White Noise', icon: Sparkles, color: 'text-gray-400', volume: 20, isPlaying: false },
];

export const MeditationCard: React.FC = () => {
  const [sounds, setSounds] = useState<SoundConfig[]>(defaultSounds);
  const [masterVolume, setMasterVolume] = useState(70);
  const [isGloballyPlaying, setIsGloballyPlaying] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  // Initialize audio elements (in a real app, you'd load actual audio files)
  useEffect(() => {
    sounds.forEach(sound => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio();
        // For demo purposes, we're creating silent audio contexts
        // In a real implementation, you'd load actual ambient sound files
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const toggleSound = (soundId: string) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const newIsPlaying = !sound.isPlaying;
        const audio = audioRefs.current[soundId];
        
        if (newIsPlaying) {
          // In a real app, you'd play the actual audio file
          audio.volume = (sound.volume / 100) * (masterVolume / 100);
          audio.play().catch(() => {
            // Handle audio play errors (browser restrictions, etc.)
          });
        } else {
          audio.pause();
        }
        
        return { ...sound, isPlaying: newIsPlaying };
      }
      return sound;
    }));
  };

  const updateSoundVolume = (soundId: string, volume: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const audio = audioRefs.current[soundId];
        if (audio && sound.isPlaying) {
          audio.volume = (volume / 100) * (masterVolume / 100);
        }
        return { ...sound, volume };
      }
      return sound;
    }));
  };

  const updateMasterVolume = (volume: number) => {
    setMasterVolume(volume);
    sounds.forEach(sound => {
      if (sound.isPlaying) {
        const audio = audioRefs.current[sound.id];
        if (audio) {
          audio.volume = (sound.volume / 100) * (volume / 100);
        }
      }
    });
  };

  const toggleGlobalPlayback = () => {
    const newGlobalState = !isGloballyPlaying;
    setIsGloballyPlaying(newGlobalState);
    
    if (newGlobalState) {
      // Start some default sounds for quick meditation
      const defaultActiveSounds = ['rain', 'birds', 'waves'];
      setSounds(prev => prev.map(sound => {
        if (defaultActiveSounds.includes(sound.id)) {
          const audio = audioRefs.current[sound.id];
          audio.volume = (sound.volume / 100) * (masterVolume / 100);
          audio.play().catch(() => {});
          return { ...sound, isPlaying: true };
        }
        return sound;
      }));
    } else {
      // Stop all sounds
      setSounds(prev => prev.map(sound => {
        const audio = audioRefs.current[sound.id];
        audio.pause();
        return { ...sound, isPlaying: false };
      }));
    }
  };

  const activeSounds = sounds.filter(sound => sound.isPlaying);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Meditate
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {activeSounds.length} active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ambient sounds to help you focus and relax
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={toggleGlobalPlayback}
              variant={isGloballyPlaying ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isGloballyPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isGloballyPlaying ? 'Pause All' : 'Quick Start'}
            </Button>
            
            <div className="flex items-center gap-2 flex-1 max-w-32 ml-4">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => updateMasterVolume(value[0])}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-2 gap-3">
          {sounds.map((sound) => {
            const IconComponent = sound.icon;
            return (
              <div
                key={sound.id}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
                  sound.isPlaying 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
                onClick={() => toggleSound(sound.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={cn("h-4 w-4", sound.color)} />
                    <span className="text-sm font-medium">{sound.name}</span>
                  </div>
                  {sound.isPlaying && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150" />
                    </div>
                  )}
                </div>
                
                {sound.isPlaying && (
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                    <Slider
                      value={[sound.volume]}
                      onValueChange={(value) => updateSoundVolume(sound.id, value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Sounds Summary */}
        {activeSounds.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-1">
              {activeSounds.map(sound => {
                const IconComponent = sound.icon;
                return (
                  <Badge key={sound.id} variant="secondary" className="text-xs">
                    <IconComponent className="h-3 w-3 mr-1" />
                    {sound.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};