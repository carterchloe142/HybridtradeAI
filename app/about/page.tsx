"use client"
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { useI18n } from '@/hooks/useI18n'
import { usePathname } from 'next/navigation'
import TiltCard from '@/components/ui/TiltCard'

import FuturisticBackground from '@/components/ui/FuturisticBackground'
const TechSphere = dynamic(() => import('@/components/3d/TechSphere'), { ssr: false })

import { 
  Bot, 
  Coins, 
  Users, 
  Megaphone, 
  CheckSquare, 
  BrainCircuit, 
  Sprout, 
  Rocket, 
  Crown,
  ArrowRight,
  ShieldCheck,
  Zap,
  PieChart
} from 'lucide-react'

export default function AboutPage() {
  const { t } = useI18n()
  const pathname = usePathname() || '/about'
  const base = process.env.NEXT_PUBLIC_SITE_URL || ''

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const streamIcons: Record<string, React.ReactNode> = {
    alg_trading: <Bot className="w-8 h-8 text-blue-400" />,
    staking_yield: <Coins className="w-8 h-8 text-purple-400" />,
    copy_trading: <Users className="w-8 h-8 text-green-400" />,
    ads_affiliate: <Megaphone className="w-8 h-8 text-yellow-400" />,
    task_engagement: <CheckSquare className="w-8 h-8 text-indigo-400" />,
    ai_allocator: <BrainCircuit className="w-8 h-8 text-orange-400" />,
  }

  const planIcons: Record<string, React.ReactNode> = {
    starter: <Sprout className="w-12 h-12 text-blue-400 mb-4" />,
    pro: <Rocket className="w-12 h-12 text-purple-400 mb-4" />,
    elite: <Crown className="w-12 h-12 text-amber-400 mb-4" />,
  }

  return (
    <div className="space-y-24 pb-12">
      <Head>
        <title>{t('about_page.title')}</title>
        <meta name="description" content={t('about_page.overview')} />
        <link rel="canonical" href={`${base}${pathname}`} />
        <link rel="alternate" hrefLang="x-default" href={`${base}${pathname}`} />
      </Head>

      {/* Global Background Mesh */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <FuturisticBackground />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/10 p-10 md:p-24 text-center shadow-2xl shadow-blue-900/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] opacity-20 dark:opacity-100" />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-10 right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/5 border border-border/10 mb-8 backdrop-blur-sm hover:bg-muted/10 transition-colors cursor-default"
          >
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-muted-foreground">Next-Gen Hybrid Investing</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6 }} 
            className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50 mb-6 drop-shadow-2xl"
          >
            {t('about_page.title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.6 }} 
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            {t('about_page.overview')}
          </motion.p>
        </div>
      </section>

      {/* Live Metrics Strip */}
      <div className="overflow-hidden py-4 border-y border-border/5 bg-muted/20 backdrop-blur-sm -mx-4 md:-mx-8 lg:-mx-12">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap px-4"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16 text-sm font-mono text-muted-foreground">
              <span className="flex items-center gap-2"><span className="text-green-400">●</span> BTC/USD $98,420 <span className="text-green-400">+2.4%</span></span>
              <span className="flex items-center gap-2"><span className="text-green-400">●</span> ETH/USD $3,840 <span className="text-green-400">+1.8%</span></span>
              <span className="flex items-center gap-2"><span className="text-blue-400">●</span> AI Accuracy 94.2%</span>
              <span className="flex items-center gap-2"><span className="text-purple-400">●</span> Total AUM $142M+</span>
              <span className="flex items-center gap-2"><span className="text-green-400">●</span> 24h Vol $12.5M</span>
              <span className="flex items-center gap-2"><span className="text-yellow-400">●</span> Active Bots 1,240</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Revenue Streams Grid */}
      <section>
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            {t('about_page.revenue_streams')}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { key: 'alg_trading', color: 'hover:shadow-blue-500/20 hover:border-blue-500/50' },
            { key: 'staking_yield', color: 'hover:shadow-purple-500/20 hover:border-purple-500/50' },
            { key: 'copy_trading', color: 'hover:shadow-green-500/20 hover:border-green-500/50' },
            { key: 'ai_allocator', color: 'hover:shadow-orange-500/20 hover:border-orange-500/50' },
            { key: 'ads_affiliate', color: 'hover:shadow-yellow-500/20 hover:border-yellow-500/50' },
            { key: 'task_engagement', color: 'hover:shadow-indigo-500/20 hover:border-indigo-500/50' },
          ].map((item) => (
            <motion.div 
              key={item.key}
              variants={fadeIn}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-xl border border-border/5 p-8 transition-all duration-300 ${item.color}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Animated corner accent */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-muted/5 blur-2xl group-hover:bg-muted/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="mb-6 p-3 bg-muted/5 w-fit rounded-xl border border-border/10 group-hover:scale-110 group-hover:bg-muted/10 transition-all duration-300 shadow-lg">
                  {streamIcons[item.key]}
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-foreground/80 transition-colors">{t(`about_page.streams.${item.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors">
                  {t(`about_page.streams.${item.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Profit Allocation Visualization */}
      <section className="py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Smart Capital <span className="text-blue-400">Allocation</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg leading-relaxed mb-8"
            >
              Our AI dynamically balances your portfolio between high-yield algorithmic trading strategies and stable decentralized finance protocols to maximize returns while minimizing risk.
            </motion.p>
            
            <div className="space-y-6">
              {[
                { label: 'DeFi Staking & Yield Farming', value: 60, color: 'bg-purple-500' },
                { label: 'Algorithmic Trading (HFT)', value: 30, color: 'bg-blue-500' },
                { label: 'Liquidity Reserves', value: 10, color: 'bg-green-500' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                      className={`h-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative h-[400px] flex items-center justify-center w-full">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
             <TechSphere />
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl -z-10" />
        <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 border border-border/10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('about_page.investment_plans')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose the tier that aligns with your financial goals. Upgrade anytime.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { key: 'starter', border: 'border-blue-500/20 group-hover:border-blue-500/50', glow: 'shadow-blue-500/10 group-hover:shadow-blue-500/30', delay: 0 },
              { key: 'pro', border: 'border-purple-500/50 group-hover:border-purple-500/80', glow: 'shadow-purple-500/20 group-hover:shadow-purple-500/40', popular: true, delay: 0.1 },
              { key: 'elite', border: 'border-amber-500/20 group-hover:border-amber-500/50', glow: 'shadow-amber-500/10 group-hover:shadow-amber-500/30', delay: 0.2 }
            ].map((plan) => (
              <motion.div 
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: plan.delay }}
                className="h-full"
              >
                <TiltCard className={`flex flex-col rounded-3xl bg-card/80 p-8 border ${plan.border} ${plan.glow} shadow-2xl transition-all duration-300 h-full`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg z-10">
                      MOST POPULAR
                    </div>
                  )}
                  
                  {/* Glow effect behind card */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

                  <div className="flex flex-col items-center mb-8 relative z-10">
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {planIcons[plan.key]}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-foreground/90 transition-colors">{t(`about_page.plans.${plan.key}.title`)}</h3>
                    <div className="mt-2 text-xs font-mono text-muted-foreground uppercase tracking-widest border border-border/10 px-3 py-1 rounded group-hover:border-border/20 transition-colors">
                      {t(`about_page.plans.${plan.key}.allocation`)}
                    </div>
                  </div>
                  
                  <div className="space-y-6 flex-1 relative z-10">
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 p-1 rounded-full bg-green-500/20">
                          <PieChart className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">{t(`about_page.plans.${plan.key}.streams`)}</span>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 p-1 rounded-full bg-blue-500/20">
                          <Zap className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">{t(`about_page.plans.${plan.key}.weekly`)}</span>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="mt-1 p-1 rounded-full bg-purple-500/20">
                          <ShieldCheck className="w-3 h-3 text-purple-400" />
                        </div>
                        <span className="text-sm text-muted-foreground">{t(`about_page.plans.${plan.key}.benefits`)}</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href="/plans" 
                    className={`mt-8 w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all relative overflow-hidden group/btn z-10 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20' 
                        : 'bg-muted/5 hover:bg-muted/10 text-foreground border border-border/10'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/btn:animate-shimmer" />
                    <span className="relative z-10">{t('choose_plan')}</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
