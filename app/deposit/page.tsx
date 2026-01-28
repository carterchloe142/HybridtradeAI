'use client';

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import RequireAuth from '@/components/RequireAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { getCurrentUserId } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/hooks/useI18n'
import { ArrowLeft, CreditCard, Bitcoin, ShieldCheck, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import FuturisticBackground from '@/components/ui/FuturisticBackground'
import { useSearchParams } from 'next/navigation'

function DepositContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currency } = useCurrency('USD')
  const uidRef = useRef<string | null>(null)
  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState('paystack')
  const [plan, setPlan] = useState<'starter'|'pro'|'elite'>('starter')

  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [kycStatus, setKycStatus] = useState<'pending'|'approved'|'rejected'|''>('')
  const [kycLevel, setKycLevel] = useState<number | null>(null)
  const [cryptoCurrency, setCryptoCurrency] = useState<'usdt'|'btc'|'eth'>('usdt')
  const [loading, setLoading] = useState(false)
  
  const [showWallet, setShowWallet] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [txHash, setTxHash] = useState('')
  const [cryptoTxId, setCryptoTxId] = useState('')
  const [cryptoStatus, setCryptoStatus] = useState<string>('')
  const [cryptoPollError, setCryptoPollError] = useState<string>('')
  const [cryptoExpectedCurrency, setCryptoExpectedCurrency] = useState<string>('')
  const [cryptoExpectedAmount, setCryptoExpectedAmount] = useState<string>('')

  function nowPaymentsCurrencySymbol(sym: string) {
    const s = String(sym || '').toLowerCase()
    if (s === 'usdt') return 'usdttrc20'
    if (s === 'btc') return 'btc'
    if (s === 'eth') return 'eth'
    return s || 'usdttrc20'
  }

  const ranges: Record<'starter'|'pro'|'elite', { min: number; max: number; label: string }> = {
    starter: { min: 100, max: 500, label: 'Starter — $100 to $500' },
    pro: { min: 501, max: 2000, label: 'Pro — $501 to $2,000' },
    elite: { min: 2001, max: 10000, label: 'Elite — $2,001 to $10,000' },
  }

  const MOCK_WALLETS: Record<string, string> = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    usdt: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  }

  useEffect(() => {
    if (searchParams) {
      const qPlan = searchParams.get('plan')
      const qAmount = searchParams.get('amount')
      if (qPlan && ['starter', 'pro', 'elite'].includes(qPlan)) {
        setPlan(qPlan as any)
      }
      if (qAmount && !isNaN(Number(qAmount))) {
        setAmount(qAmount)
      }
    }
  }, [searchParams])

  useEffect(() => {
    (async () => {
      uidRef.current = await getCurrentUserId()
      // KYC fetching skipped for deposits
    })()
  }, [])

  useEffect(() => {
    if (!showWallet) return
    if (!cryptoTxId) return

    let cancelled = false
    let interval: any = null

    async function poll() {
      try {
        const { data: session } = await supabase.auth.getSession()
        const token = session.session?.access_token
        if (!token) return

        const res = await fetch(`/api/user/transactions/${cryptoTxId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json().catch(() => null)
        if (cancelled) return

        if (!res.ok) {
          setCryptoPollError(String(json?.error || 'Unable to check payment status'))
          return
        }

        const nextStatus = String(json?.status || '')
        setCryptoStatus(nextStatus)

        if (nextStatus.toUpperCase() === 'COMPLETED') {
          setShowWallet(false)
          setMsg('Deposit confirmed')
          setErr('')
          setCryptoPollError('')
          setTxHash('')
          setCryptoTxId('')

          try {
            router.push('/dashboard')
          } catch {}
        }
      } catch {
        if (!cancelled) setCryptoPollError('Unable to check payment status')
      }
    }

    poll()
    interval = setInterval(poll, 7000)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [showWallet, cryptoTxId, router])

  async function submit() {
    setErr(''); setMsg('')
    let uid = uidRef.current
    if (!uid) {
      try { uid = await getCurrentUserId() || '' } catch {}
      if (uid) uidRef.current = uid
    }

    if (!uid) { setErr(t('please_login_first')); return }
    const amt = Number(amount)
    if (!amt || amt <= 0) { setErr(t('invalid_deposit')); return }

    // Enforce per-plan amount ranges (USD-equivalent assumptions)
    const r = ranges[plan]
    if (amt < r.min || amt > r.max) {
      setErr(t('plan_amount_out_of_range'))
      return
    }

    // Crypto Flow: Show Wallet UI first
    if (provider === 'crypto' && !showWallet) {
        setLoading(true)
        try {
          // Call Backend to Create Payment and Get Wallet
          const { data: session } = await supabase.auth.getSession()
          const token = session.session?.access_token
          if (!token) throw new Error('Session lost');

          const res = await fetch('/api/payment/create', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
             body: JSON.stringify({
                 amount: amt,
                 currency: 'USD',
                 cryptoCurrency: nowPaymentsCurrencySymbol(cryptoCurrency),
                 provider: 'nowpayments',
                 planId: plan,
                 autoActivate: true
             })
          });

          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Payment creation failed');

          if (json.walletAddress) {
             setWalletAddress(json.walletAddress);
             if (json.transactionId) setCryptoTxId(String(json.transactionId))
             if (json.currencyExpected) setCryptoExpectedCurrency(String(json.currencyExpected))
             if (json.amountExpected != null) setCryptoExpectedAmount(String(json.amountExpected))
             setShowWallet(true);
          } else if (json.payUrl) {
             // Redirect flow (e.g. Coinbase hosted)
             window.location.href = json.payUrl;
             return;
          }
        } catch (e: any) {
           setErr(e.message);
        }
        setLoading(false)
        return
    }

    // If Crypto and Wallet shown, user is confirming payment
    setLoading(true)
    try {
      // Get authentication token
      const { data: session } = await supabase.auth.getSession()
      const token = session.session?.access_token
      if (!token) { setErr(t('please_login_first')); setLoading(false); return }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const useCrypto = provider === 'crypto'
      if (provider === 'paystack' || useCrypto) {
        const body: any = { amount: amt, currency, planId: plan, autoActivate: true }
        if (useCrypto) {
          body.provider = 'nowpayments' // Keeping backend logic same for compatibility
          body.cryptoCurrency = cryptoCurrency
          body.txHash = txHash // Pass the manual hash if we added an input for it
          body.transactionId = cryptoTxId
        }
        const res = await fetch('/api/user/deposit', { 
          method: 'POST', 
          headers, 
          body: JSON.stringify(body),
        })
        let json: any = null
        try { json = await res.json() } catch {}
        if (!res.ok) { setErr(String(json?.details || json?.error || 'Failed')); setLoading(false); return }
        
        // If paystack, redirect. If crypto, we are done.
        if (!useCrypto) {
             const url = String(json?.authorizationUrl || json?.invoiceUrl || json?.pay_url || '')
             if (url) { window.location.href = url; return }
        }
      }
      
      setMsg(t('deposit_recorded') || 'Deposit submitted! Waiting for blockchain confirmation.')
      setAmount('')
      setShowWallet(false)
      setTxHash('')
      setCryptoTxId('')
      setCryptoExpectedCurrency('')
      setCryptoExpectedAmount('')
    } catch (e: any) { setErr(String(e?.message || 'Error')) }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  return (
    <RequireAuth>
      <FuturisticBackground />
      
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 flex items-center gap-4"
          >
            <Link href="/dashboard" className="p-2 rounded-xl bg-card/40 border border-border/10 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground backdrop-blur-md group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex-1">
               <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/60 bg-clip-text text-transparent">Deploy Capital</h1>
               <p className="text-sm text-muted-foreground">Fund your wallet and activate a strategy in one step</p>
            </div>
            {kycStatus && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${kycStatus === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}
              >
                 <ShieldCheck size={14} />
                 {kycStatus === 'approved' ? `KYC Verified • Level ${kycLevel || 1}` : `KYC ${kycStatus.toUpperCase()}`}
              </motion.div>
            )}
          </motion.div>

          <div className="grid md:grid-cols-[1.8fr,1fr] gap-8">
            {/* Main Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
               {showWallet ? (
                   // WALLET DISPLAY UI
                   <div className="bg-card/40 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-xl text-center space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Send {String(cryptoExpectedCurrency || cryptoCurrency).toUpperCase()}</h2>
                            <p className="text-muted-foreground">Scan the QR code or copy the address below to deposit <span className="text-white font-mono">${amount}</span></p>
                            {cryptoExpectedAmount && cryptoExpectedCurrency && (
                              <p className="text-xs text-muted-foreground">Expected: {cryptoExpectedAmount} {String(cryptoExpectedCurrency).toUpperCase()}</p>
                            )}
                        </div>

                        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${walletAddress}`} alt="Wallet QR" className="w-48 h-48" />
                        </div>

                        <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 max-w-md mx-auto">
                            <code className="text-sm text-primary break-all">{walletAddress}</code>
                            <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                                <CheckCircle2 size={20} />
                            </button>
                        </div>

                        <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                {cryptoStatus ? `Status: ${String(cryptoStatus).toUpperCase()}` : 'Awaiting Blockchain Confirmation...'}
                            </div>

                            {cryptoPollError && (
                              <div className="text-xs text-red-400">{cryptoPollError}</div>
                            )}
                            
                            <button 
                                onClick={submit}
                                disabled={loading}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
                            >
                                {loading ? 'Verifying...' : 'I Have Sent The Funds'}
                            </button>
                            <button onClick={() => setShowWallet(false)} className="text-sm text-muted-foreground hover:text-white">Cancel</button>
                        </div>
                   </div>
               ) : (
                   // NORMAL FORM UI
                   <>
               {/* Plan Selection */}
               <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                 <div className="text-sm text-primary mb-4 font-medium uppercase tracking-wider flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs border border-primary/20">1</span>
                   Select Strategy Tier
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   {['starter', 'pro', 'elite'].map((p) => (
                     <button 
                       key={p}
                       onClick={() => setPlan(p as any)}
                       className={`relative p-4 rounded-xl border text-left transition-all duration-300 group overflow-hidden ${plan === p ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.15)]' : 'bg-muted/10 border-border/10 hover:border-border/20 hover:bg-muted/20'}`}
                     >
                       <div className={`absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 transition-opacity ${plan === p ? 'opacity-100' : 'opacity-0'}`} />
                       <div className={`font-bold capitalize mb-1 relative z-10 ${plan === p ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{p}</div>
                       <div className="text-xs text-muted-foreground/80 relative z-10 group-hover:text-muted-foreground transition-colors">${ranges[p as keyof typeof ranges].min.toLocaleString()} - ${ranges[p as keyof typeof ranges].max.toLocaleString()}</div>
                       {plan === p && <motion.div layoutId="check" className="absolute top-2 right-2 text-primary"><CheckCircle2 size={16} /></motion.div>}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Amount Input */}
               <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                 <div className="text-sm text-primary mb-4 font-medium uppercase tracking-wider flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs border border-primary/20">2</span>
                   Enter Amount
                 </div>
                 <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">$</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-muted/10 border border-border/10 rounded-xl pl-8 pr-4 py-4 text-foreground focus:border-primary/50 focus:bg-primary/5 focus:outline-none transition-all text-xl placeholder-muted-foreground/50 shadow-inner"
                      placeholder={`Min $${ranges[plan].min}`}
                    />
                 </div>
                 <AnimatePresence>
                   {amount && (Number(amount) < ranges[plan].min || Number(amount) > ranges[plan].max) && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="mt-2 text-xs text-red-400 flex items-center gap-1"
                       >
                       <AlertCircle size={12} />
                       Amount must be between ${ranges[plan].min} and ${ranges[plan].max} for {plan} plan
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* Payment Method */}
               <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                 <div className="text-sm text-primary mb-4 font-medium uppercase tracking-wider flex items-center gap-2">
                   <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs border border-primary/20">3</span>
                   Choose Payment Method
                 </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setProvider('paystack')}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 relative overflow-hidden group ${provider === 'paystack' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.15)]' : 'bg-muted/10 border-border/10 hover:border-border/20 hover:bg-muted/20'}`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${provider === 'paystack' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground group-hover:text-foreground'}`}><CreditCard size={20} /></div>
                      <div className="text-left relative z-10">
                        <div className={`font-medium transition-colors ${provider === 'paystack' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>Card / Bank</div>
                        <div className="text-xs text-muted-foreground/70">Instant deposit</div>
                      </div>
                      {provider === 'paystack' && <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5" />}
                    </button>

                    <button 
                      onClick={() => setProvider('crypto')}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 relative overflow-hidden group ${provider === 'crypto' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.15)]' : 'bg-muted/10 border-border/10 hover:border-border/20 hover:bg-muted/20'}`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${provider === 'crypto' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground group-hover:text-foreground'}`}><Bitcoin size={20} /></div>
                      <div className="text-left relative z-10">
                        <div className={`font-medium transition-colors ${provider === 'crypto' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>Crypto</div>
                        <div className="text-xs text-muted-foreground/70">USDT, BTC, ETH</div>
                      </div>
                      {provider === 'crypto' && <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5" />}
                    </button>
                 </div>

                 <AnimatePresence>
                   {provider === 'crypto' && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0, marginTop: 0 }}
                       animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                       exit={{ opacity: 0, height: 0, marginTop: 0 }}
                       className="pt-4 border-t border-border/10 overflow-hidden"
                     >
                       <label className="block text-sm text-muted-foreground mb-3">Select Asset</label>
                       <div className="flex gap-3">
                         {['usdt', 'btc', 'eth'].map(c => (
                           <button
                             key={c}
                             onClick={() => setCryptoCurrency(c as any)}
                             className={`px-4 py-2 rounded-lg border text-sm uppercase transition-all ${cryptoCurrency === c ? 'bg-primary/20 border-primary text-primary shadow-sm' : 'bg-muted/10 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/20'}`}
                           >
                             {c}
                           </button>
                         ))}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               <AnimatePresence>
                 {msg && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-start gap-3 backdrop-blur-md"
                   >
                     <CheckCircle2 size={18} className="mt-0.5 shrink-0"/> <span>{msg}</span>
                   </motion.div>
                 )}
                 {err && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3 backdrop-blur-md"
                   >
                     <AlertCircle size={18} className="mt-0.5 shrink-0"/> <span>{err}</span>
                   </motion.div>
                 )}
               </AnimatePresence>

               <button 
                 onClick={submit}
                 disabled={loading}
                 className={`w-full relative group overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-4 text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4`}
               >
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                 <span className="relative flex items-center justify-center gap-2">
                   {loading ? (
                     <>
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       Processing...
                     </>
                   ) : (
                     `Deploy $${amount || '0'} Capital`
                   )}
                 </span>
               </button>
               </>
               )}
            </motion.div>

            {/* Sidebar Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6 text-foreground font-medium">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp size={18} />
                  </div>
                  Selected Strategy: <span className="capitalize text-primary ml-auto bg-primary/10 px-3 py-1 rounded-full text-xs">{plan}</span>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground">Min Deposit</span>
                    <span className="text-foreground font-mono">${ranges[plan].min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground">Max Deposit</span>
                    <span className="text-foreground font-mono">${ranges[plan].max.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-muted-foreground">Capital Lock</span>
                    <span className="text-foreground">14 Days</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Management Fee</span>
                    <span className="text-foreground">{plan === 'elite' ? '15%' : plan === 'pro' ? '20%' : '25%'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl">
                 <div className="flex items-center gap-2 mb-4 text-foreground font-medium">
                   <Info size={18} className="text-muted-foreground" />
                   Important Notes
                 </div>
                 <ul className="text-xs text-muted-foreground space-y-3 list-disc list-inside leading-relaxed">
                   <li>Capital is deployed immediately upon confirmation.</li>
                   <li>Crypto deposits require network confirmation (usually 10-30 mins).</li>
                   <li>KYC Level {kycLevel || 1} limits apply.</li>
                 </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <DepositContent />
    </Suspense>
  )
}
