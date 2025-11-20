export type AdminNavItem = { path: string; label: string; icon?: string };

export const ADMIN_MENU: AdminNavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/kyc', label: 'KYC', icon: 'shield' },
  { path: '/admin/deposits', label: 'Deposits', icon: 'deposit' },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: 'withdraw' },
  { path: '/admin/profit-engine', label: 'ProfitEngine', icon: 'profit' },
  { path: '/admin/performance', label: 'Performance', icon: 'chart' },
  { path: '/admin/plans', label: 'Plans', icon: 'plans' },
  { path: '/admin/transactions', label: 'Transactions', icon: 'ledger' },
  { path: '/admin/proof', label: 'Proof', icon: 'proof' },
  { path: '/admin/support', label: 'Support', icon: 'support' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  { path: '/admin/logs', label: 'Logs', icon: 'logs' }
];

