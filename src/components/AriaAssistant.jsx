import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000';

const AriaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', content: "Hi! I'm Aria, your Hostel AI. How can I assist you today?" }]);
  const [input, setInput] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [context, setContext] = useState(null);
  const chatEndRef = useRef(null);

  // Web Speech API
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    fetchContext();
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

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/ai/context`);
      setContext(res.data);
    } catch { console.error('AI Context error'); }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    // Choose a nice female voice if available
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    synthRef.current.speak(utterance);
  };

  const processResponse = (query) => {
    const q = query.toLowerCase();
    if (!context) return "I'm still loading current hostel data. One second!";

    if (q.includes('food') || q.includes('menu') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast')) {
      const menu = context.food.menu;
      if (!menu) return "The menu for today hasn't been uploaded yet.";
      return `For today, ${context.food.today}, the menu is: Breakfast is ${menu.breakfast}, Lunch is ${menu.lunch}, and Dinner is ${menu.dinner}. Sounds delicious, right?`;
    }

    if (q.includes('room') || q.includes('available') || q.includes('vacancy')) {
      return `We currently have ${context.rooms.available} rooms available out of ${context.rooms.total}. Prices range from ${context.rooms.priceRange} per month.`;
    }

    if (q.includes('complaint') || q.includes('issue')) {
      return `There are currently ${context.stats.pendingComplaints} pending complaints being reviewed by the administration. You can file a new one in the Complaints tab.`;
    }

    if (q.includes('laundry')) {
      const free = context.laundry?.available;
      if (free === undefined) return "Laundry services are complimentary! You'll be able to see the status of machines in your dashboard soon.";
      if (free === 0) return "All laundry machines are currently in use. I'd recommend checking back in about 20 minutes!";
      return `We have ${free} machines free right now. Better hurry before they're gone!`;
    }

    if (q.includes('dinner') || q.includes('food') || q.includes('eat')) {
      const menu = context.food.menu;
      if (!menu) return "The menu for today hasn't been uploaded yet, but usually, it's something special on Sundays!";
      return `For tonight's dinner, we have ${menu.dinner}. Sounds good, doesn't it?`;
    }

    if (q.includes('payment') || q.includes('fee') || q.includes('due') || q.includes('pay') || q.includes('wallet')) {
      return "Currently, your total outstanding cycle balance is ₹12,450, and the next deadline is April 5th, 2026. \n\nWe currently support the following payment options:\n💳 **Cards / NFC** (Visa, MasterCard, RuPay)\n📱 **UPI / GPay** (Zero transaction fee)\n💼 **Internal Hostel Wallet** (Instant Settlement)\n\nYou can explicitly authorize these through the 'Payments' tab on your dashboard!";
    }

    if (q.includes('who are you') || q.includes('aria')) {
      return "I'm Aria, your intelligent hostel companion. I was designed to make your hostel life effortless and curated.";
    }

    if (q.includes('hostel') || q.includes('about this place') || q.includes('where am i')) {
      return "This is the next-generation Student Intelligence Hostel! It's a curated network of academic excellence featuring modern smart living, AI-powered assistance, automated tracking, and premium facilities designed specifically for you.";
    }

    if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
      return "Hello there! I'm Aria. How can I make your day at the hostel better?";
    }

    return "That's a great question! I'm mainly designed to help you with the menu, room bookings, and hostel updates. Is there something specific about those you'd like to know?";
  };

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsAIProcessing(true);

    const q = msg.toLowerCase();

    // 0. Intercept Global News Query
    if (q.includes('news') || q.includes('update me') || q.includes('world update') || q.includes('what is happening')) {
      try {
        const res = await axios.get(`${BACKEND}/api/news/trending?limit=3`);
        if (res.data && res.data.success && res.data.articles) {
          const articles = res.data.articles;
          let newsText = "Here are the top global news updates circulating right now. ";
          let displayContent = "Here are the top global news updates:\n\n";
          
          articles.forEach((art, index) => {
            newsText += `Story ${index + 1}: ${art.title}. `;
            displayContent += `📰 **${art.title}**\n${art.description}\n\n`;
          });
          newsText += "I have placed the summaries in the chat for you to read.";
          
          setMessages(prev => [...prev, { role: 'ai', content: displayContent.trim() }]);
          speak(newsText); // Speak the abbreviated text, display the full text
          setIsAIProcessing(false);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch AI news:', err);
        const errorMsg = "I'm having trouble connecting to the global news network right now. Please try again later.";
        setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        speak(errorMsg);
        setIsAIProcessing(false);
        return;
      }
    }

    // 1. Check Hostel Context first (Fast local response)
    const localResponse = processResponse(msg);
    if (!localResponse.includes("That's a great question! I'm mainly designed to help you with the menu")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: localResponse }]);
        speak(localResponse);
        setIsAIProcessing(false);
      }, 600);
      return;
    }

    // 2. Global AI Mode (External LLM API for general knowledge)
    try {
      // Connect to genuine OpenAI Architecture
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';
      
      if (apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
         console.warn("Please add your OpenAI API Key to use the Global Intelligence mode.");
         const fakeResponse = "My connection to the OpenAI mainframe requires an API Key. Please insert your VITE_OPENAI_API_KEY into the environment configuration to enable my advanced neural network!";
         setMessages(prev => [...prev, { role: 'ai', content: fakeResponse }]);
         speak(fakeResponse);
         setIsAIProcessing(false);
         return;
      }

      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are Aria, an intelligent, extremely polite, and helpful AI assistant for a modern futuristic student hostel environment." },
            { role: "user", content: msg }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const response = res.data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      speak(response);
    } catch (err) {
      console.error("OpenAI Error:", err);
      const fallback = "I'm currently connected to a high-speed orbital satellite for deep thinking. It seems I hit a minor frequency interference, but I can tell you everything about the hostel locally!";
      setMessages(prev => [...prev, { role: 'ai', content: fallback }]);
      speak(fallback);
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
      {/* Floating Button */}
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

      {/* Assistant Modal */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[550px] bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
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

          {/* Messages */}
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

          {/* Input */}
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
