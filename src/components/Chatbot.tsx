import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Advanced Heuristic "Fake" AI Engine
const getSmartResponse = (msg: string) => {
  const lower = msg.toLowerCase();
  
  // Greetings
  if (/hello|hi |hey|hola|bonjour|ciao/.test(lower)) {
    return "Hello there! I'm your Traveloop Guide. 🌍 How can I help you plan your next adventure today?";
  }
  
  // Trip generation / planning
  if (/plan|generate|create.*trip|build.*itinerary/.test(lower)) {
    return "You can use our 'AI Generate' feature on the Dashboard to instantly build a complete itinerary! Just tell it your destination, budget, and travel style, and it handles the rest. ✈️";
  }

  // Budget
  if (/cost|budget|expensive|cheap|money/.test(lower)) {
    return "To track your expenses, click into any of your trips and go to the 'Budget' tab. We'll automatically calculate your health score and tell you if you're overspending! 💸";
  }

  // Packing
  if (/pack|checklist|bring|luggage|suitcase/.test(lower)) {
    return "Don't forget the essentials! Your trip has a 'Checklist' tab that automatically generates packing items based on whether you're going to the beach, mountains, or a city. 🎒";
  }

  // Activities / Food
  if (/food|eat|restaurant|hungry|dinner|lunch|breakfast/.test(lower)) {
    return "I love talking about food! 🍜 In the 'Activities' tab of your itinerary, you can add local food tours or highly-rated dinner spots. You can even generate them automatically!";
  }

  if (/recommend|visit|see|activities|tour|attraction/.test(lower)) {
    return "Looking for things to do? You can click the '+' button on any day in your timeline to add activities. Try adding 'Sightseeing' or 'Culture' tags to keep things organized. 🏛️";
  }

  // Navigation / App help
  if (/where|how to|help me|stuck|dashboard/.test(lower)) {
    return "Navigate using the bottom tabs! You have your Timeline, Itinerary Map, Budget tracker, and Checklist all available for your current trip. What specifically are you trying to find?";
  }

  // Specific Locations (Simulated Knowledge)
  if (/paris/.test(lower)) return "Paris is beautiful! 🗼 Make sure to budget at least €20/day for croissants and coffee. The 'Comfort' travel style is recommended there.";
  if (/tokyo/.test(lower)) return "Tokyo! 🍣 The public transit is amazing there. I recommend packing light (use the Checklist tab) because you'll be walking a lot!";
  if (/bali/.test(lower)) return "Bali is the ultimate relaxation spot. 🌴 It's very budget-friendly, so you can easily stay under a $50/day budget. Have you generated your Bali trip yet?";
  if (/rome/.test(lower)) return "Rome! 🏛️ Prepare for incredible pasta. Add a 'Sightseeing' activity for the Colosseum in your Itinerary Builder!";

  // Default Fallbacks (Randomized for realism)
  const fallbacks = [
    "That sounds amazing! As your virtual guide, I'm here to help you navigate Traveloop. Are you looking to plan a new trip or manage an existing one?",
    "Interesting! Tell me more about your travel plans. Which city are you heading to?",
    "I'm currently running in offline mode, but I can still help you navigate the app! Head over to the Dashboard to create a new trip.",
    "Got it! Let me know if you need help generating an itinerary, tracking your budget, or building a packing list."
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "bot", text: string}[]>([
    { role: "bot", text: "Hi there! I'm your Traveloop Guide. Ask me anything about planning your trip! 🌎" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: getSmartResponse(userMsg) }]);
      setIsLoading(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-hero rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-110 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open tourist guide chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-hero text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h3 className="font-semibold tracking-wide">AI Tourist Guide</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'bot' && <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-primary" /></div>}
              <div className={`p-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/60 text-foreground rounded-tl-sm border border-border/50'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 justify-start animate-fade-up">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-primary" /></div>
              <div className="p-3 rounded-2xl max-w-[85%] bg-muted/60 text-muted-foreground rounded-tl-sm border border-border/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} className="h-1" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t bg-muted/30 rounded-b-2xl flex gap-2 items-center">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask me anything..." 
            className="flex-1 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary shadow-none"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="bg-gradient-hero shrink-0 rounded-xl shadow-md h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>
    </>
  );
}
