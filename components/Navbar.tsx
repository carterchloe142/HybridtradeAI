 "use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Menu, X, ShieldCheck, ShieldAlert, ShieldX, IdCard } from 'lucide-react';
import NotificationBell from '@/app/components/NotificationBell';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import LogoMark from '@/components/LogoMark';

export default function Navbar ()
{
  const pathname = usePathname();
  const [ open, setOpen ] = useState( false );
  const [ kyc, setKyc ] = useState<string>( '' );
  const kycColor = useMemo( () => ( kyc === 'approved' ? 'text-success' : kyc === 'rejected' ? 'text-destructive' : kyc === 'pending' ? 'text-warning' : 'text-primary' ), [ kyc ] );

  useEffect( () =>
  {
    let mounted = true;
    ( async () =>
    {
      try
      {
        const { data } = await supabase.auth.getSession();
        const uid = String( data?.session?.user?.id || '' );
        if ( !uid ) return;
        const { data: prof } = await supabase
          .from( 'User' )
          .select( 'kycStatus' )
          .eq( 'id', uid )
          .maybeSingle();
        if ( !mounted ) return;
        setKyc( String( ( prof as any )?.kyc_status || '' ) );
      } catch { }
    } )();
    return () => { mounted = false };
  }, [] );

  // Don't render global navbar on landing page
  if (pathname === '/') return null;

  return (
    <nav className="w-full sticky top-0 z-50 bg-black/10 backdrop-blur-xl border-b border-white/5 transition-colors shadow-2xl">
      <div className="container-xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
             <LogoMark size={32} className="text-primary relative z-10" />
          </div>
          <span className="font-bold text-2xl text-foreground tracking-tight">
            <span>HybridTrade</span>
            <span className="text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/plans" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Plans</Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Dashboard</Link>
          
          <div className="h-6 w-[1px] bg-white/10" />
          
          <Link href="/deposit" className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all">Deposit</Link>
          <Link href="/withdraw" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Withdraw</Link>
          
          <Link href="/kyc" className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 border border-white/5 hover:bg-secondary/80 transition-colors" title="KYC" aria-label="KYC">
            { kyc === 'approved' ? <ShieldCheck className={ `w-5 h-5 ${ kycColor }` } /> : kyc === 'rejected' ? <ShieldX className={ `w-5 h-5 ${ kycColor }` } /> : kyc === 'pending' ? <ShieldAlert className={ `w-5 h-5 ${ kycColor }` } /> : <IdCard className={ `w-5 h-5 ${ kycColor }` } /> }
          </Link>
          <NotificationBell />
          <ThemeToggle size="sm" />
          <Link href="/auth/login" className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] hover:scale-105 transition-all">Login</Link>
        </div>

        <button aria-label="Toggle menu" className="md:hidden text-foreground" onClick={ () => setOpen( !open ) }>
          { open ? <X /> : <Menu /> }
        </button>
      </div>

      { open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-background border-b border-border">
          <Link href="/plans" onClick={ () => setOpen( false ) } className="text-muted-foreground hover:text-primary">Plans</Link>
          <Link href="/dashboard" onClick={ () => setOpen( false ) } className="text-muted-foreground hover:text-primary">Dashboard</Link>
          <Link href="/deposit" onClick={ () => setOpen( false ) } className="btn-neon text-center">Deposit</Link>
          <Link href="/withdraw" onClick={ () => setOpen( false ) } className="btn-neon text-center">Withdraw</Link>
          <Link href="/kyc" onClick={ () => setOpen( false ) } className="text-muted-foreground hover:text-primary">KYC</Link>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <span className="text-sm text-foreground">Theme</span>
          </div>
          <Link href="/auth/login" onClick={ () => setOpen( false ) } className="btn-neon text-center">Login</Link>
        </div>
      ) }
    </nav>
  );
}
