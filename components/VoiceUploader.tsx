import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Play, Pause, Activity, CheckCircle2 } from 'lucide-react';
import { VoiceSample } from '../types';
import { Waveform } from './Waveform';

interface VoiceUploaderProps {
  onVoiceLoaded: (sample: VoiceSample) => void;
}

export const VoiceUploader: React.FC<VoiceUploaderProps> = ({ onVoiceLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedSample, setUploadedSample] = useState<VoiceSample | null>(null);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const processFile = async (file: File) => {
    setAnalyzing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Extract data for visualization
      const rawData = audioBuffer.getChannelData(0); // Left channel
      // Take a simplified sample set for the chart
      const samples = 200;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i * blockSize + j]);
        }
        filteredData.push(sum / blockSize); // Average amplitude
      }
      setAudioData(filteredData);

      const sample: VoiceSample = {
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        buffer: audioBuffer,
        duration: audioBuffer.duration
      };

      // Simulate "Learning" delay
      setTimeout(() => {
        setUploadedSample(sample);
        onVoiceLoaded(sample);
        setAnalyzing(false);
      }, 2000);

    } catch (error) {
      console.error("Error processing audio:", error);
      setAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const togglePlayback = () => {
    if (!uploadedSample || !uploadedSample.buffer || !audioContextRef.current) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = uploadedSample.buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  if (uploadedSample) {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Voice Cloned Successfully</h3>
                    <p className="text-sm text-zinc-400">Ready for generation</p>
                </div>
            </div>
            <button 
                onClick={() => setUploadedSample(null)}
                className="text-xs text-zinc-500 hover:text-white underline"
            >
                Reset
            </button>
        </div>
        
        <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50 relative overflow-hidden group">
             <div className="flex items-center gap-4 relative z-10">
                <button 
                    onClick={togglePlayback}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors"
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="flex-1 h-12 flex items-center">
                    <Waveform data={audioData} color="#10b981" />
                </div>
                <div className="text-xs font-mono text-emerald-500">
                    MATCH: 99.8%
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-500/5' 
          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="audio/*" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        disabled={analyzing}
      />
      
      <div className="flex flex-col items-center justify-center text-center gap-4">
        {analyzing ? (
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-emerald-500 animate-pulse" size={24} />
                    </div>
                </div>
                <div>
                    <h3 className="font-medium text-white text-lg">Analyzing Voice Patterns...</h3>
                    <p className="text-zinc-500 text-sm">Extracting tone, pitch, and timbre</p>
                </div>
            </div>
        ) : (
            <>
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                    <Upload size={32} />
                </div>
                <div>
                    <h3 className="font-medium text-white text-lg">Upload Voice Sample</h3>
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto mt-1">
                        Drag & drop an audio file of your voice (MP3, WAV). 
                        We will analyze it to create your digital twin.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <Mic size={12} />
                    <span>High quality audio recommended</span>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
