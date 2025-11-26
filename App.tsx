import React, { useState, useEffect } from 'react';
import { VoiceUploader } from './components/VoiceUploader';
import { HistoryItem } from './components/HistoryItem';
import { VoiceSample, GeneratedAudio, Emotion, PrebuiltVoice } from './types';
import { generateSpeech } from './services/geminiService';
import { createAudioBlobFromBase64 } from './services/audioUtils';
import { Mic2, Sparkles, Settings2, Volume2, User, Info, Loader2 } from 'lucide-react';

export default function App() {
  const [voiceSample, setVoiceSample] = useState<VoiceSample | null>(null);
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [targetVoice, setTargetVoice] = useState<PrebuiltVoice>(PrebuiltVoice.Kore); // Default robust male voice
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    try {
      // API Call
      const base64Audio = await generateSpeech(text, emotion, targetVoice);
      
      // Convert to Blob
      const blob = createAudioBlobFromBase64(base64Audio);
      const url = URL.createObjectURL(blob);

      const newItem: GeneratedAudio = {
        id: crypto.randomUUID(),
        text,
        style: emotion,
        timestamp: Date.now(),
        audioUrl: url,
        duration: 0 // Will be determined by audio element or approx
      };

      setHistory(prev => [newItem, ...prev]);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate speech. Please check your API Key configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500/30">
        
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <Mic2 size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              NADEEM DASHTI <span className="text-emerald-500">TTS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Online
            </div>
            <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
                <Settings2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* Section: Voice Calibration */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-emerald-500" size={20} />
                        <h2 className="text-lg font-semibold text-white">Voice Calibration</h2>
                    </div>
                    <VoiceUploader onVoiceLoaded={setVoiceSample} />
                    
                    {voiceSample && (
                         <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Base Voice Profile (Fine-tuning)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {Object.values(PrebuiltVoice).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setTargetVoice(v)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                            targetVoice === v 
                                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                                            : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                        }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1.5">
                                <Info size={12} />
                                Select the profile closest to your vocal range for best cloning results.
                            </p>
                        </div>
                    )}
                </section>

                {/* Section: Text Input */}
                <section className={`transition-opacity duration-500 ${!voiceSample ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-emerald-500" size={20} />
                            <h2 className="text-lg font-semibold text-white">Generation</h2>
                        </div>
                        <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                             {Object.values(Emotion).map(em => (
                                <button
                                    key={em}
                                    onClick={() => setEmotion(em)}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                                        emotion === em 
                                        ? 'bg-emerald-500/20 text-emerald-500 font-medium' 
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {em}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to speak..."
                            className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-all shadow-inner"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-zinc-600 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                            {text.length} chars
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleGenerate}
                            disabled={!text.trim() || isGenerating}
                            className={`
                                relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-white transition-all
                                ${!text.trim() || isGenerating 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95'
                                }
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Synthesizing...
                                    </>
                                ) : (
                                    <>
                                        <Volume2 size={20} />
                                        Generate Speech
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </section>

            </div>

            {/* Right Column: History */}
            <div className="lg:col-span-5">
                <div className="sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Output History</h2>
                        <span className="text-xs font-mono text-zinc-500">{history.length} GENERATIONS</span>
                    </div>

                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-20">
                        {history.length === 0 ? (
                            <div className="h-64 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 gap-3 bg-zinc-900/20">
                                <Volume2 size={32} className="opacity-50" />
                                <p className="text-sm">No generations yet</p>
                            </div>
                        ) : (
                            history.map(item => (
                                <HistoryItem 
                                    key={item.id} 
                                    item={item} 
                                    onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))}
                                    isActive={activeAudioId === item.id}
                                    onPlay={setActiveAudioId}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
