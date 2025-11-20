import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutGrid, Wallet, User2 } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/plans', label: 'Plans', icon: Wallet },
  { href: '/profile', label: 'Profile', icon: User2 },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="glass w-full md:w-64 rounded-2xl p-4 h-fit md:h-[calc(100vh-120px)]">
      <nav className="flex md:flex-col gap-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active ? 'bg-white/10 text-neon-blue' : 'hover:bg-white/10'}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
