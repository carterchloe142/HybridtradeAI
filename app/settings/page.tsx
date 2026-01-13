'use client';

export const dynamic = "force-dynamic";

import RequireAuth from '@/components/RequireAuth';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/hooks/useI18n';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { ArrowLeft, Lock, Bell, Moon, Sun, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMsg('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <FuturisticBackground />
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/profile" className="p-2 rounded-xl bg-card/40 border border-border/10 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground backdrop-blur-md group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">Manage your preferences and security</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-8 shadow-xl space-y-8"
          >
            {/* Password Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-border/10">
                <Lock className="text-primary" size={20} />
                <h2 className="text-lg font-medium text-foreground">Security</h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {msg && <div className="p-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-sm">{msg}</div>}
                {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-sm">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-muted/10 border border-border/10 rounded-xl px-4 py-3 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-muted/10 border border-border/10 rounded-xl px-4 py-3 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Preferences Section (Placeholder) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 pb-2 border-b border-border/10">
                <Bell className="text-primary" size={20} />
                <h2 className="text-lg font-medium text-foreground">Notifications</h2>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border border-border/10">
                <span className="text-sm text-foreground">Email Notifications</span>
                <div className="h-6 w-10 rounded-full bg-primary/20 flex items-center justify-end px-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-primary shadow-sm" />
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </RequireAuth>
  );
}
