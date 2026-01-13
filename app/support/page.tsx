'use client';

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import RequireAuth from '@/components/RequireAuth'
import { supabase } from '@/lib/supabase'
import { useUserNotifications } from '@/src/hooks/useUserNotifications'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, Search, Send, FileText } from 'lucide-react'

type Ticket = { id: string; subject: string; status: 'open'|'closed'; created_at: string; replies: { id: string; body: string; is_admin: boolean; created_at: string }[] }

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [userName, setUserName] = useState('')
  const [kbQuery, setKbQuery] = useState('')
  const suggestions = [
    { title: 'How do withdrawals work?', href: '/faqs' },
    { title: 'How do deposits work?', href: '/faqs' },
    { title: 'How can I add or change my payout method?', href: '/faqs' },
    { title: 'Which payment providers and currencies are supported?', href: '/faqs' },
    { title: 'How can I contact support?', href: '/faqs' },
  ]

  async function fetchTickets() {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      const nm = String(session.session?.user?.user_metadata?.name || session.session?.user?.email || '')
      if (nm) setUserName(nm)
      const res = await fetch('/api/user/support', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      const json = await res.json()
      if (!res.ok) {
        const err = typeof json.error === 'string' ? json.error : (json?.error?.message || 'Failed')
        throw new Error(err)
      }
      const items = (json.items as any) || []
      setTickets(items)
    } catch (e: any) { setMsg(String(e?.message || e)) }
    finally { setLoading(false) }
  }

  async function createTicket() {
    setMsg('')
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) throw new Error('Please login again')
      const res = await fetch('/api/user/support', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ subject, message }) })
      const json = await res.json()
      if (!res.ok) {
        const err = typeof json.error === 'string' ? json.error : (json?.error?.message || 'Failed')
        throw new Error(err)
      }
      setSubject(''); setMessage('')
      fetchTickets()
      setMsg('Ticket submitted')
    } catch (e: any) { setMsg(String(e?.message || e)) }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const { items: userEvents } = useUserNotifications()
  const lastEventIdRef = useRef<string>('')
  const [toast, setToast] = useState('')
  useEffect(() => {
    const hasSupportEvent = userEvents.some((ev) => ev.type === 'support_reply' || ev.type === 'support_status' || ev.type === 'support_ticket')
    if (hasSupportEvent) fetchTickets()
    const latest = userEvents[0]
    if (latest && latest.id !== lastEventIdRef.current && (latest.type === 'support_reply' || latest.type === 'support_status')) {
      lastEventIdRef.current = String(latest.id)
      setToast(latest.type === 'support_reply' ? 'New reply from admin' : 'Support ticket updated')
      setTimeout(() => setToast(''), 4000)
    }
  }, [userEvents])

  const activeTicket = tickets.find((t) => t.id === active)
  const recentTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return sorted.slice(0, 5)
  }, [tickets])
  const supportUnread = useMemo(() => userEvents.filter((ev) => !ev.read && (ev.type === 'support_reply' || ev.type === 'support_status')).length, [userEvents])
  const latestTicket = useMemo(() => {
    return [...tickets].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null
  }, [tickets])

  return (
    <RequireAuth>
      <FuturisticBackground />
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/dashboard" className="p-2 rounded-xl bg-card/40 border border-border/10 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground backdrop-blur-md group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                Support
                {supportUnread > 0 && (<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">{supportUnread}</span>)}
              </h1>
              <p className="text-muted-foreground mt-1">Get help and track your support requests</p>
            </div>
          </motion.div>

          {toast && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-2 text-sm bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg"
            >
              {toast}
            </motion.div>
          )}
          
          {msg && (
             <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-2 text-sm text-primary px-4 py-2 bg-primary/10 rounded-xl border border-primary/20"
            >
              {msg}
            </motion.div>
          )}

          {/* Greeting + Continue + KB search */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-xl font-semibold text-foreground">Hi {userName || 'there'} 👋</div>
                <div className="text-sm text-muted-foreground">Welcome to Support. Ask us anything — we’re here to help.</div>
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all border border-border/10 font-medium" onClick={() => setActive(latestTicket?.id || null)}>Continue</button>
            </div>
            
            {latestTicket && (
              <div className="mt-3 bg-muted/30 rounded-2xl p-4 flex items-center justify-between border border-border/10">
                <div>
                  <div className="text-sm font-medium text-foreground">Continue the conversation</div>
                  <div className="text-xs text-muted-foreground">{new Date(latestTicket.created_at).toLocaleString()}</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 font-medium text-sm" onClick={() => setActive(latestTicket.id)}>Open</button>
              </div>
            )}
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Search for help</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    className="w-full bg-background/50 border border-border/10 rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="Search articles…"
                    value={kbQuery}
                    onChange={(e) => setKbQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = '/faqs' }}
                  />
                </div>
                <Link className="px-6 py-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all border border-border/10 font-medium" href="/faqs">Go</Link>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((s, i) => (
                <Link key={i} href={s.href} className="bg-background/30 rounded-xl p-4 block hover:bg-accent/20 transition-all border border-border/10 group">
                  <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{s.title}</div>
                </Link>
              ))}
              <Link href="/faqs" className="bg-background/30 rounded-xl p-4 flex items-center gap-2 text-sm text-foreground border border-border/10 hover:bg-accent/20 transition-all group">
                <span className="group-hover:text-primary transition-colors underline decoration-dotted">More in the Help Center</span>
              </Link>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all border border-border/10 text-sm" onClick={() => setMsg('Glad that helped!')}>That answered my question 👍</button>
              <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 text-sm font-medium" onClick={() => setActive(latestTicket?.id || null)}>Talk to a person 🧑‍💼</button>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-primary" />
                  Open a Ticket
                </h3>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Subject</label>
                <input className="bg-background/50 border border-border/10 rounded-xl px-4 py-2.5 w-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" />
                
                <label className="block text-sm font-medium mb-1.5 mt-4 text-foreground">Message</label>
                <textarea className="bg-background/50 border border-border/10 rounded-xl px-4 py-2.5 w-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." />
                
                <button onClick={createTicket} className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!subject || !message}>
                  Submit Ticket
                </button>
              </div>

              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl max-h-[500px] flex flex-col">
                <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                  <FileText size={18} className="text-muted-foreground" />
                  Recent Tickets
                </h3>
                {recentTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tickets yet.</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto pr-1">
                    {recentTickets.map((t) => (
                      <button 
                        key={t.id} 
                        onClick={() => setActive(t.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${active===t.id ? 'bg-primary/10 border-primary/20' : 'bg-background/30 border-border/10 hover:bg-accent/20'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.status==='open'?'bg-emerald-500/10 text-emerald-500':'bg-muted text-muted-foreground'}`}>{t.status}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className={`text-sm font-medium truncate ${active===t.id ? 'text-primary' : 'text-foreground'}`}>{t.subject}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-border/10">
                   <button className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center w-full">View All History</button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              {activeTicket ? (
                <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl h-full flex flex-col min-h-[600px]">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
                    <h2 className="font-semibold text-xl text-foreground">{activeTicket.subject}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${activeTicket.status==='open'?'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20':'bg-muted text-muted-foreground border border-border/10'}`}>{activeTicket.status.toUpperCase()}</span>
                  </div>
                  
                  <div className="space-y-4 flex-1 overflow-y-auto p-2 mb-4 scrollbar-thin scrollbar-thumb-primary/10">
                    {activeTicket.replies.map((r) => (
                      <div key={r.id} className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm ${r.is_admin ? 'bg-muted/80 ml-auto rounded-tr-sm' : 'bg-primary/10 mr-auto rounded-tl-sm'}`}>
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <span className={`font-semibold text-xs ${r.is_admin ? 'text-foreground' : 'text-primary'}`}>{r.is_admin ? 'Support Agent' : 'You'}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <div className="text-foreground whitespace-pre-wrap leading-relaxed">{r.body}</div>
                      </div>
                    ))}
                    {activeTicket.replies.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <MessageSquare size={32} className="opacity-20 mb-2" />
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {activeTicket.status === 'open' && (
                    <div className="mt-auto pt-4 border-t border-border/10">
                      <label className="block text-sm font-medium mb-2 text-foreground">Your Reply</label>
                      <div className="relative">
                        <textarea 
                          className="bg-background/50 border border-border/10 rounded-xl px-4 py-3 w-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 pr-12" 
                          rows={3} 
                          value={replyText} 
                          onChange={(e) => setReplyText(e.target.value)} 
                          placeholder="Type your message..."
                        />
                        <button
                          onClick={async () => {
                            setMsg('')
                            try {
                              const { data: session } = await supabase.auth.getSession()
                              const token = session.session?.access_token
                              if (!token || !active) throw new Error('Please login again')
                              const res = await fetch('/api/user/support', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ticketId: active, body: replyText }) })
                              const json = await res.json()
                              if (!res.ok) {
                                const err = typeof json.error === 'string' ? json.error : (json?.error?.message || 'Failed')
                                throw new Error(err)
                              }
                              setReplyText('')
                              setMsg('Reply sent')
                              fetchTickets()
                            } catch (e: any) { setMsg(String(e?.message || e)) }
                          }}
                          className="absolute right-2 bottom-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!replyText.trim()}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border border-border/10 rounded-3xl bg-card/40 backdrop-blur-xl p-8 text-center">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Ticket Selected</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">Select a ticket from the list or create a new one to get started.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
