import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

const AriaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', content: "Hi! I'm Aria, your Hostel AI. How can I assist you today?" }]);
  const [input, setInput] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    // Prioritize high-quality neural/female voices
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  };

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsAIProcessing(true);

    try {
      const res = await axios.post(`${BACKEND}/api/ai/chat`, { query: msg });
      
      if (res.data?.success && res.data?.answer) {
        const response = res.data.answer;
        setMessages(prev => [...prev, { role: 'ai', content: response }]);
        speak(response);
      } else {
        throw new Error(res.data?.message || 'Invalid response from AI server');
      }
    } catch (err) {
      console.error("AI Error:", err);
      const errorMsg = "I'm having trouble connecting to my brain right now. I'll use my built-in rules for now!";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsAIProcessing(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      synthRef.current.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-body">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-primary shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <span className="material-symbols-outlined text-3xl">close</span>
        ) : (
          <div className="relative">
             <span className="material-symbols-outlined text-3xl animate-pulse">auto_awesome</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[550px] bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_videocam</span>
              </div>
              <div>
                <p className="font-headline font-bold text-lg leading-tight">Aria</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-secondary-fixed rounded-full animate-pulse" />
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/60">INTELLIGENCE ACTIVE</p>
                </div>
              </div>
            </div>
            <button onClick={toggleListen} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-error animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}>
              <span className="material-symbols-outlined text-[20px]">{isListening ? 'mic' : 'mic_off'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3 shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'ai' ? 'bg-surface-container-low text-on-surface' : 'bg-primary text-white font-medium shadow-md shadow-primary/20'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isAIProcessing && (
              <div className="flex justify-start animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center mr-3 shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">sync</span>
                </div>
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-surface-container-low text-on-surface-variant italic">
                  Aria is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-outline-variant/10">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={isListening ? 'Listening...' : "Ask anything about the hostel..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="w-full bg-surface-container-low border-none rounded-2xl pl-5 pr-14 py-3.5 text-sm focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline/60"
              />
              <button
                onClick={() => handleSend()}
                className="absolute right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">north</span>
              </button>
            </div>
            <p className="text-center text-[9px] text-outline mt-3 uppercase tracking-widest font-bold opacity-40">Powered by Aria AI Framework</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AriaAssistant;
