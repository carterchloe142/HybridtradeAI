import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link'
import { Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything about HybridTradeAI.' }
  ]);
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const suggestions = useMemo(() => ([
    'What are your plans?',
    'How do withdrawals work?',
    'How do I deposit?',
    'Help me contact support'
  ]), [])

  function Inline({ text }: { text: string }) {
    const parts = useMemo(() => {
      const out: (string | React.ReactNode)[] = []
      const s = String(text || '')
      let i = 0
      const re = /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^(\s)]+)\)|`([^`]+)`/g
      for (;;) {
        const m = re.exec(s)
        if (!m) { out.push(s.slice(i)); break }
        if (m.index > i) out.push(s.slice(i, m.index))
        if (m[1] && m[2]) {
          const href = m[2]
          if (/^https?:/.test(href)) {
            out.push(<a key={`a-${m.index}`} href={href} className="underline" target="_blank" rel="noopener noreferrer">{m[1]}</a>)
          } else {
            out.push(<Link key={`l-${m.index}`} href={href} className="underline">{m[1]}</Link>)
          }
        }
        else if (m[3]) out.push(<code key={`c-${m.index}`} className="px-1 bg-muted rounded">{m[3]}</code>)
        i = m.index + m[0].length
      }
      return out
    }, [text])
    return <>{parts.map((p, idx) => typeof p === 'string' ? <span key={idx}>{p}</span> : p)}</>
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input } as const;
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token || ''
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content })
      });
      const data = await res.json();
      const msg = String(data.message ?? 'I am here to help.')
      const extra = data.escalate ? [{ role: 'assistant', content: 'If you need more help, open Support at /support.' } as const] : []
      setMessages((m) => [...m, { role: 'assistant', content: msg }, ...extra]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false)
  };

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
      {open && (
        <motion.div className="glass w-80 rounded-2xl p-4 mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          aria-live="polite"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bot className="text-neon-blue" />
            <span className="font-semibold">AI Support</span>
          </div>
          <div ref={listRef} className="h-48 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.role === 'assistant' ? 'bg-secondary' : 'bg-primary/20'}`}>
                <strong className="mr-1">{m.role === 'assistant' ? 'AI:' : 'You:'}</strong>
                <Inline text={m.content} />
              </div>
            ))}
            {loading && (
              <div className="p-2 rounded-lg bg-secondary w-fit flex items-center gap-1">
                <motion.div
                  className="w-1.5 h-1.5 bg-foreground/50 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-foreground/50 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-foreground/50 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                />
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input-neon"
              placeholder="Ask about plans, investing tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
            />
            <button className="btn-neon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue rounded-md" onClick={sendMessage} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button key={i} className="btn-minimal rounded-md" onClick={() => { setInput(s); setTimeout(sendMessage, 0) }}>{s}</button>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      <button className="btn-neon rounded-full p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue" onClick={() => setOpen(!open)} aria-label="Toggle AI chat" aria-expanded={open} aria-controls="chat-widget">
        <Bot />
      </button>
    </div>
  );
}
