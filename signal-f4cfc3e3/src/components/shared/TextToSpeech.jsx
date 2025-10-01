import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function TextToSpeech({ text, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    
    u.rate = rate;
    u.pitch = pitch;
    u.voice = synth.getVoices().find(voice => voice.lang.startsWith('en')) || synth.getVoices()[0];
    
    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setUtterance(u);

    return () => {
      synth.cancel();
    };
  }, [text, rate, pitch]);

  const handlePlay = useCallback(() => {
    const synth = window.speechSynthesis;
    
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (utterance) {
      synth.cancel();
      synth.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [isPaused, utterance]);

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!isPlaying ? (
        <Button
          onClick={handlePlay}
          size="sm"
          variant="outline"
          className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
        >
          <Play className="w-4 h-4 mr-2" />
          {isPaused ? "Resume" : "Listen"}
        </Button>
      ) : (
        <Button
          onClick={handlePause}
          size="sm"
          variant="outline"
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
      )}
      
      {(isPlaying || isPaused) && (
        <Button
          onClick={handleStop}
          size="sm"
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <Square className="w-3 h-3" />
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-gray-900 border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Speed: {rate.toFixed(1)}x
              </label>
              <Slider
                value={[rate]}
                onValueChange={(value) => setRate(value[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Pitch: {pitch.toFixed(1)}
              </label>
              <Slider
                value={[pitch]}
                onValueChange={(value) => setPitch(value[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}