import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Clock, Volume2 } from 'lucide-react';
import { GeneratedAudio } from '../types';

interface HistoryItemProps {
  item: GeneratedAudio;
  onDelete: (id: string) => void;
  isActive: boolean;
  onPlay: (id: string) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onDelete, isActive, onPlay }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      onPlay(item.id);
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className={`group p-4 rounded-xl border transition-all ${isActive ? 'bg-zinc-900 border-emerald-500/50' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.style === 'Cheerful' ? 'bg-yellow-500/10 text-yellow-500' :
                    item.style === 'Serious' ? 'bg-blue-500/10 text-blue-500' :
                    item.style === 'Sad' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-zinc-700/30 text-zinc-400'
                }`}>
                    {item.style}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p className="text-sm text-zinc-300 line-clamp-2 font-light">{item.text}</p>
        </div>
        <button 
            onClick={() => onDelete(item.id)}
            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2"
        >
            <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button 
            onClick={togglePlay}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                playing ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
        >
            {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
            <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
            />
        </div>

        <a 
            href={item.audioUrl} 
            download={`nadeem-dashti-tts-${item.id}.wav`}
            className="text-zinc-500 hover:text-white transition-colors"
        >
            <Download size={16} />
        </a>
      </div>

      <audio 
        ref={audioRef} 
        src={item.audioUrl} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={handleEnded} 
      />
    </div>
  );
};
