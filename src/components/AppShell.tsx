'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-sm text-center"
        style={{ border: '1px solid rgba(102,126,234,0.25)' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 32px rgba(102,126,234,0.4)' }}>
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">FinanzasPro</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(232,234,246,0.45)' }}>
          Tu control financiero · Venezuela
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={signInWithGoogle}
          className="btn-glow w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 20px rgba(102,126,234,0.35)' }}
        >
          {/* Google Icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.4-7.7 19.4-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.6 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.3C29.3 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.6 35.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.3C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continuar con Google
        </motion.button>
        <p className="text-xs mt-4" style={{ color: 'rgba(232,234,246,0.25)' }}>
          Tus datos se sincronizan en todos tus dispositivos
        </p>
      </motion.div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  return (
    <>
      <ServiceWorkerRegister />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 mt-14 md:mt-0 mb-20 md:mb-0 p-4 md:p-8 min-h-screen w-full">
          {children}
        </main>
      </div>
    </>
  );
}
