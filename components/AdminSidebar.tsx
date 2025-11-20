import Link from 'next/link';
import { ADMIN_MENU } from '../config/adminMenu';

export default function AdminSidebar() {
  return (
    <aside className="p-4 glass rounded-2xl min-h-[60vh]">
      <nav className="space-y-2">
        {ADMIN_MENU.map(item => (
          <Link key={item.path} href={item.path} className="block px-3 py-2 rounded-lg hover:bg-white/10">
            <span className="text-white/90">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

