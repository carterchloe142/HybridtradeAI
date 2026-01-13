'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';
import FuturisticBackground from '@/components/ui/FuturisticBackground';
import { Mail, Clock, MessageSquare, MapPin, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <>
      <FuturisticBackground />
      
      <div className="relative min-h-screen pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/50 bg-clip-text text-transparent">
              {t('contact_page.title') || 'Get in Touch'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('contact_page.support_title') || 'We are here to help you with any questions or concerns.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Contact Info Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{t('contact_page.email_label') || 'Email Support'}</h3>
                    <p className="text-muted-foreground text-sm mb-2">For general inquiries and support</p>
                    <a href="mailto:support@hybridtradeai.com" className="text-primary hover:underline font-medium">
                      support@hybridtradeai.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{t('contact_page.hours_label') || 'Business Hours'}</h3>
                    <p className="text-muted-foreground text-sm mb-2">Our support team is available</p>
                    <p className="text-foreground font-medium">
                      Mon–Fri, 9am–6pm (UTC)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">Live Chat</h3>
                    <p className="text-muted-foreground text-sm mb-2">Available for active investors</p>
                    <Link href="/dashboard" className="text-primary hover:underline font-medium flex items-center gap-1">
                      Go to Dashboard <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message Form (Visual Only) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/40 backdrop-blur-xl border border-border/10 rounded-3xl p-8 shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-foreground mb-6">Send us a message</h3>
              
              <form className="space-y-4 flex-1 flex flex-col" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <input type="text" className="w-full bg-muted/20 border border-border/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="Your name" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <input type="email" className="w-full bg-muted/20 border border-border/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors" placeholder="your@email.com" />
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <textarea className="w-full h-full min-h-[120px] bg-muted/20 border border-border/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" placeholder="How can we help you?" />
                </div>

                <button className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 group">
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
