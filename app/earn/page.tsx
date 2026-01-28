"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, CheckCircle2, Coins, Share2, Youtube, MonitorPlay, ExternalLink, X, AlertCircle } from 'lucide-react'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import RequireAuth from '@/components/RequireAuth'

type Task = {
  id: string
  title: string
  reward: number
  type: 'video' | 'social' | 'login'
  icon: React.ElementType
  completed: boolean
  actionUrl?: string
  status?: 'pending' | 'started' | 'verifying' | 'completed'
}

export default function EarnPage() {
  const [balance, setBalance] = useState(0.00)
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Watch Intro Video', reward: 0.50, type: 'video', icon: Youtube, completed: false, status: 'pending', actionUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: '2', title: 'Daily Login Bonus', reward: 0.10, type: 'login', icon: MonitorPlay, completed: false, status: 'pending' },
    { id: '3', title: 'Share on Twitter', reward: 1.00, type: 'social', icon: Share2, completed: false, status: 'pending', actionUrl: 'https://twitter.com/intent/tweet?text=Just%20joined%20HybridTradeAI%20and%20earning%20passive%20income!%20%23Crypto%20%23AI' },
    { id: '4', title: 'Watch Market Analysis', reward: 0.75, type: 'video', icon: PlayCircle, completed: false, status: 'pending', actionUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ])
  
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const startTask = (task: Task) => {
    if (task.completed || task.status === 'completed') return
    
    if (task.type === 'login') {
      // Instant claim for login
      setVerifying(true)
      setTimeout(() => completeTask(task), 1000)
      return
    }

    setActiveTask(task)
    setShowModal(true)
    
    // Update status to started
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'started' } : t))
  }

  const handleExternalLink = () => {
    if (!activeTask?.actionUrl) return
    window.open(activeTask.actionUrl, '_blank')
    // After clicking link, allow verification
  }

  const handleVerify = () => {
    if (!activeTask) return
    setVerifying(true)
    
    // Simulate API verification
    setTimeout(() => {
        completeTask(activeTask)
        setShowModal(false)
        setActiveTask(null)
        setVerifying(false)
    }, 2000)
  }

  const completeTask = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true, status: 'completed' } : t))
    setBalance(prev => prev + task.reward)
    // TODO: Real API call
  }

  return (
    <RequireAuth>
      <FuturisticBackground />
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Earn & Engagement
                </h1>
                <p className="text-muted-foreground mt-1">Complete simple tasks to boost your earnings.</p>
            </div>
            <div className="bg-card/40 backdrop-blur-md border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(var(--primary),0.15)]">
                <div className="p-2 bg-primary/20 rounded-full text-primary">
                    <Coins size={20} />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Earnings</div>
                    <div className="text-xl font-mono font-bold text-foreground">${balance.toFixed(2)}</div>
                </div>
            </div>
          </div>

          <div className="grid gap-4">
            {tasks.map((task, i) => (
                <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-card/30 backdrop-blur-xl border ${task.completed ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'} rounded-2xl p-5 flex items-center justify-between group hover:border-primary/30 transition-all`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${task.completed ? 'bg-green-500/20 text-green-500' : 'bg-primary/10 text-primary group-hover:scale-110 transition-transform'}`}>
                            {task.completed ? <CheckCircle2 size={24} /> : <task.icon size={24} />}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</h3>
                            <div className="text-sm text-green-400 font-mono">+${task.reward.toFixed(2)}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => startTask(task)}
                        disabled={task.completed || verifying}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                            task.completed 
                                ? 'bg-transparent text-green-500 cursor-default' 
                                : verifying && task.type === 'login'
                                    ? 'bg-muted/20 text-muted-foreground cursor-wait'
                                    : 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 active:scale-95'
                        }`}
                    >
                        {task.completed ? 'Completed' : (verifying && task.type === 'login') ? 'Claiming...' : 'Start Task'}
                    </button>
                </motion.div>
            ))}
          </div>

          {/* Task Modal */}
          <AnimatePresence>
            {showModal && activeTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-2xl bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <activeTask.icon size={20} className="text-primary" />
                                {activeTask.title}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {activeTask.type === 'video' ? (
                                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/5">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={activeTask.actionUrl} 
                                        title={activeTask.title}
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-8 space-y-4">
                                    <div className="p-4 bg-primary/10 text-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                        <Share2 size={32} />
                                    </div>
                                    <p className="text-lg text-muted-foreground">
                                        Share our platform on social media to earn your reward.
                                    </p>
                                    <button 
                                        onClick={handleExternalLink}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
                                    >
                                        Share Now <ExternalLink size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 text-sm text-yellow-200">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>You must complete the action above before verifying. False claims may lead to account suspension.</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleVerify}
                                disabled={verifying}
                                className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {verifying ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>Verify Completion <CheckCircle2 size={16} /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/5 text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">Want to earn more?</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
                Upgrade to the <span className="text-primary font-bold">Pro Plan</span> to unlock premium tasks and higher reward multipliers.
            </p>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10">
                View Plans
            </button>
          </div>

        </div>
      </div>
    </RequireAuth>
  )
}