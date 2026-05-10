import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// simple mock responses based on keywords
const getBotResponse = (msg: string) => {
  const lower = msg.toLowerCase();
  
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! I am your AI Tourist Guide. How can I help you today? (Hola, Bonjour, Ciao, こんにちは!)";
  }
  if (lower.includes("hola")) {
    return "¡Hola! Soy tu guía turística. ¿En qué puedo ayudarte hoy?";
  }
  if (lower.includes("bonjour") || lower.includes("salut")) {
    return "Bonjour! Je suis votre guide touristique. Comment puis-je vous aider?";
  }
  if (lower.includes("ciao")) {
    return "Ciao! Sono la tua guida turistica. Come posso aiutarti?";
  }
  if (lower.includes("recommend") || lower.includes("place") || lower.includes("visit")) {
    return "I recommend checking out the local historical center or taking a scenic walk! You can use our 'AI Plan' feature to generate a detailed itinerary based on your vibe.";
  }
  if (lower.includes("food") || lower.includes("eat") || lower.includes("restaurant") || lower.includes("hungry")) {
    return "There are some amazing authentic restaurants nearby. Check the 'Activities' tab to discover highly-rated local food tours and dining experiences!";
  }
  if (lower.includes("language") || lower.includes("speak")) {
    return "I can understand and reply to multiple languages! Try saying hello in Español, Français, or Italiano!";
  }
  if (lower.includes("help") || lower.includes("guide")) {
    return "I can help you discover new cities, plan your trip itinerary, find activities, and track your budget. What would you like to do first?";
  }
  
  // default
  return "That sounds interesting! I am your multilingual travel guide. I can help you find great places to visit, eat, or answer basic travel questions. Where are you planning to go?";
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "bot", text: string}[]>([
    { role: "bot", text: "Hi there! I'm your multilingual travel guide. Ask me anything! (¡Hola! Bonjour! Ciao!)" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: getBotResponse(userMsg) }]);
    }, 600);
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
            <h3 className="font-semibold tracking-wide">Tourist Guide</h3>
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
              <div className={`p-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/60 text-foreground rounded-tl-sm border border-border/50'}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} className="h-1" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t bg-muted/30 rounded-b-2xl flex gap-2 items-center">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Ask me anything..." 
            className="flex-1 bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary shadow-none"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="bg-gradient-hero shrink-0 rounded-xl shadow-md h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </div>
    </>
  );
}
