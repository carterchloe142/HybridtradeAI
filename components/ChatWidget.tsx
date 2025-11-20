import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything about HybridTradeAI.' }
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input } as const;
    setMessages((m) => [...m, userMsg]);
    setInput('');
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content })
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.message ?? 'I am here to help.' }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="glass w-80 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="text-neon-blue" />
            <span className="font-semibold">AI Support</span>
          </div>
          <div className="h-48 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.role === 'assistant' ? 'bg-white/10' : 'bg-neon-blue/20'}`}>
                <strong className="mr-1">{m.role === 'assistant' ? 'AI:' : 'You:'}</strong>
                {m.content}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input-neon"
              placeholder="Ask about plans, investing tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn-neon" onClick={sendMessage} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      <button className="btn-neon rounded-full p-4" onClick={() => setOpen(!open)} aria-label="Toggle AI chat">
        <Bot />
      </button>
    </div>
  );
}
